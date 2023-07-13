/* eslint-disable no-shadow */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ArrowBack } from '@mui/icons-material';
import moment from 'moment-timezone';
import io from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import Lottie from 'react-lottie';
import ChatBar from './chatbar';
import ChatMessageBar from './ChatBottom';
import MessageBox from './MessageBox';
import ChatHeader from './ChatHeader';
import MenuListComposition from './MoreOptions';
import AvatarWithLastSeen from './AvatarWithLastSeen';
import { baseLocalApi, baseApi } from '../../utils/utility';
import { actionCreators } from '../../state/index';
import animationData from '../../animations/typing.json';

const drawerWidth = 340;

let socket;

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const updateLastMessage = (currRooms, room, message, cnt) => {
  const updatedRooms = JSON.parse(JSON.stringify(currRooms));
  let i = 0;
  for (i = 0; i < updatedRooms.length; i += 1) {
    if (updatedRooms[i]._id === room._id) {
      const newMessage = { ...message };
      newMessage.message =
        newMessage.message.length > 30 ? `${newMessage.message.substr(0, 35)}...` : newMessage.message;
      updatedRooms[i].lastMessage = newMessage;
      if (cnt) {
        if (!updatedRooms[i].notSeenCount) updatedRooms[i].notSeenCount = 0;
        updatedRooms[i].notSeenCount += 1;
      }
      break;
    }
  }
  if (i === updatedRooms.length && updatedRooms.length) {
    const newRoom = {
      _id: room._id,
      name: room.name,
      photoUrl: room.photoUrl,
      createdOn: room.createdOn,
      admins: room.admins,
      users: room.users,
      lastMessage: message,
      notSeenCount: 1
    };
    updatedRooms.splice(0, 0, newRoom);
  }
  updatedRooms.sort((a, b) => {
    if (!a.lastMessage.createdOn) {
      if (!b.lastMessage.createdOn) {
        return moment(a.createdOn).isAfter(moment(b.createdOn)) ? -1 : 1;
      }
      return moment(a.createdOn).isAfter(moment(b.lastMessage.createdOn)) ? -1 : 1;
    }
    if (!b.lastMessage.createdOn) {
      return moment(a.createdOn).isAfter(moment(b.lastMessage.createdOn)) ? -1 : 1;
    }
    return moment(a.lastMessage.createdOn).isAfter(moment(b.lastMessage.createdOn)) ? -1 : 1;
  });
  return updatedRooms;
};

const updateMessage = (newMessages, message, setMessage) => {
  const messages = [...newMessages];
  for (let i = 0; i < messages.length; i += 1) {
    if (messages[i]._id === message._id) {
      messages[i].status = 'seen';
      setMessage(messages);
      break;
    }
  }
};

const ResponsiveDrawer = props => {
  const dispatch = useDispatch();
  const { setCurrentRoom, setChatList } = bindActionCreators(actionCreators, dispatch);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [receiver, setReceiver] = useState({});
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(window.innerWidth <= 600);
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const navigate = useNavigate();
  const scrollableRef = useRef(null);
  const scrollToBottom = () => {
    if (scrollableRef && scrollableRef.current) {
      scrollableRef.current.scrollIntoView({
        block: 'end'
      });
    }
  };

  const room = useSelector(state => {
    return state.roomReducer;
  });
  const currRoom = useRef(
    useSelector(state => {
      return state.roomReducer;
    })
  );

  const updateOneMessagesAsSeen = messageId => {
    const patchData = { receiverId: localStorage.getItem('_id') };
    axios
      .patch(`${baseLocalApi}/${currRoom.current.isGroup ? 'message-seen' : 'messages'}/${messageId}`, patchData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('Token')}`
        }
      })
      .then(() => {})
      .catch(err => {
        console.error(err);
      });
  };
  const rooms = JSON.parse(
    JSON.stringify(
      useSelector(state => {
        return state.chatListReducer.rooms;
      })
    )
  );

  const checkUserOnlineStatus = () => {
    setOnline(false);
    if (receiver && receiver._id) {
      socket.emit('pingForOnlineStatus', {
        senderId: localStorage.getItem('_id'),
        receiverId: receiver._id
      });
    }
  };

  const updateAllMessagesAsSeen = () => {
    const currMessages = [...messages];
    for (let i = 0; i < currMessages.length; i += 1) {
      currMessages[i].status = 'seen';
    }
    setMessages(() => currMessages);
  };

  const updateMessagesAsSeen = () => {
    // eslint-disable-next-line no-shadow
    const room = currRoom.current;
    const patchData = { roomId: room._id };

    // eslint-disable-next-line no-nested-ternary
    patchData.receiverId = room.isGroup
      ? localStorage.getItem('_id')
      : room.users[0] === localStorage.getItem('_id')
      ? room.users[1]
      : room.users[0];
    axios
      .patch(`${baseLocalApi}/${room.isGroup ? 'message-seen' : 'messages'}`, patchData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('Token')}`
        }
      })
      .then(() => {})
      .catch(err => {
        console.error(err);
      });
  };
  useEffect(() => {
    if (!localStorage.getItem('Token')) {
      navigate('/signin');
      // return;
    }
    setOnline(false);
    setTyping(() => {
      return false;
    });

    // OneSignal.init({ appId: '5655f3bd-13db-4bce-90e0-5c8b5df3671e' });

    socket = io(baseApi, {
      auth: {
        _id: localStorage.getItem('_id')
      }
    });
    socket.emit('setup', { _id: localStorage.getItem('_id') });
    socket.on('connected', () => setSocketConnected(true));

    socket.on('typing', ({ userId, roomId }) => {
      if (userId !== localStorage.getItem('_id') && roomId === currRoom.current._id) {
        setTyping(() => true);
      }
    });

    socket.on('stop typing', () => setTyping(() => false));

    socket.on('disconnect', () => {
      console.log('Disconnected !!');
    });

    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      if (window.innerWidth >= 600) {
        setMobileOpen(false);
      } else if (!room._id) {
        setMobileOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    if (room._id) {
      setMobileOpen(false);
      if (!room.isGroup) {
        const receiverId = room.users[0] === localStorage.getItem('_id') ? room.users[1] : room.users[0];
        axios
          .get(`${baseLocalApi}/users/${receiverId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('Token')}`
            }
          })
          .then(userRes => {
            setReceiver(() => userRes.data.user);
          })
          .catch(err => {
            console.error(err);
          });
      }
      socket.emit('join chat', room._id);
      axios
        .get(`${baseLocalApi}/messages/${room._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('Token')}`
          }
        })
        .then(response => {
          setMessages(response.data.messages);
        })
        .catch(error => {
          console.error('Error:', error.message);
        });
      if (currRoom.current.notSeenCount) {
        updateMessagesAsSeen();
        if (!currRoom.current.isGroup) {
          socket.emit('updateMessagesAsSeen', { roomId: currRoom.current._id });
        }
      }
    }

    scrollToBottom();

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [room]); // Empty dependency array ensures the effect runs only once

  useEffect(() => {
    socket.on('message received', newMessageReceived => {
      if (
        newMessageReceived &&
        currRoom.current &&
        currRoom.current._id &&
        newMessageReceived._id === currRoom.current._id
      ) {
        setMessages(prevMessages => {
          return [...prevMessages, newMessageReceived.message];
        });
        const updatedRooms = updateLastMessage(rooms, currRoom.current, newMessageReceived.message);
        if (updatedRooms.length) {
          setChatList({ rooms: updatedRooms });
        }
        updateOneMessagesAsSeen(newMessageReceived.message._id);
        socket.emit('message delivered ack', {
          userId: localStorage.getItem('_id'),
          newMessageReceived
        });
      } else {
        const updatedRooms = updateLastMessage(rooms, newMessageReceived, newMessageReceived.message, 1);
        if (updatedRooms.length) {
          setChatList({ rooms: updatedRooms });
        }
      }
    });
    const interval = setInterval(checkUserOnlineStatus, 5000);

    socket.on('pingForAck', ({ receiverId, senderId }) => {
      if (senderId !== localStorage.getItem('_id')) {
        socket.emit('pingBackForAck', { senderId, receiverId });
      }
    });

    socket.on('pingAck', obj => {
      if (receiver && obj && obj.receiverId === receiver._id) {
        setOnline(true);
      }
    });

    socket.on('updateUnreadMessagesAsSeen', () => {
      updateAllMessagesAsSeen();
    });

    socket.on('message received ack', newMessageReceived => {
      if (
        newMessageReceived &&
        currRoom.current &&
        newMessageReceived._id === currRoom.current._id &&
        !currRoom.current.isGroup
      ) {
        updateMessage(messages, newMessageReceived.message, setMessages);
      }
    });
    scrollToBottom();
    return () => {
      clearInterval(interval);
      socket.removeListener('message received ack');
      socket.removeListener('message received');
      socket.removeListener('pingForAck');
      socket.removeListener('pingAck');
      socket.removeListener('pingBackForAck');
      socket.removeEventListener('updateUnreadMessagesAsSeen');
    };
  });

  const windowProp = props.window;

  const handleDrawerToggle = () => {
    currRoom.current = {};
    setMessages([]);
    setMobileOpen(!mobileOpen);
  };

  const updateNotSeenCount = (currRooms, room) => {
    const updatedRooms = JSON.parse(JSON.stringify(currRooms));
    for (let i = 0; i < updatedRooms.length; i += 1) {
      if (updatedRooms[i]._id === room._id) {
        updatedRooms[i].notSeenCount = 0;
        break;
      }
    }
    return updatedRooms;
  };

  const typingHandler = () => {
    if (!socketConnected) return;

    socket.emit('typing', {
      roomId: room._id,
      userId: localStorage.getItem('_id')
    });

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const currTime = new Date().getTime();
      const timeDiff = currTime - lastTypingTime;
      if (timeDiff >= timerLength) {
        socket.emit('stop typing', room._id);
        setTyping(() => false);
      }
    }, timerLength);
  };

  const sendMessage = message => {
    const { _id, name } = localStorage;
    const postData = {
      message,
      senderName: name,
      senderId: _id,
      roomId: room._id,
      createdOn: new Date(),
      status: 'not_delivered'
    };
    socket.emit('stop typing', room._id);
    setMessages([...messages, postData]);
    axios
      .post(`${baseLocalApi}/messages/`, postData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('Token')}`
        }
      })
      .then(response => {
        socket.emit('new message', { ...room, message: response.data.message });
        setMessages([...messages, response.data.message]);
        const updatedRooms = updateLastMessage(rooms, room, response.data.message);
        if (updatedRooms.length) {
          setChatList({ rooms: updatedRooms });
        }
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
    const pushNotificationData = {
      app_id: process.env.REACT_APP_ONE_SIGNAL,
      contents: {
        en: message // Customize the message content as per your requirements
      },
      buttons: [{ id: 'reply', text: 'Reply', icon: 'logow' }],
      headings: {
        en: `New message from ${localStorage.getItem('name')}`
      },
      filters: [{ field: 'tag', key: '_id', relation: '=', value: receiver.mobile }],
      small_icon: 'notification_icon',
      large_icon: 'notification_icon',
      android_sound: 'buzzer',
      android_channel_id: process.env.REACT_APP_ONESIGNAL_CHANNEL_ID
    };
    axios
      .post(`https://onesignal.com/api/v1/notifications`, pushNotificationData, {
        headers: {
          Authorization: `Basic ${process.env.REACT_APP_ONESIGNAL_REST_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      .then(() => {})
      .catch(error => {
        console.error('Error:', error.message);
      });
  };

  const changeRoom = room => {
    if (windowWidth <= 600) {
      setMobileOpen(false);
    }
    setCurrentRoom(room);
    currRoom.current = room;
    const updatedRooms = updateNotSeenCount(rooms, currRoom.current);
    if (updatedRooms.length) {
      setChatList({ rooms: updatedRooms });
    }
  };

  const addUserInGroup = value => {
    const postData = { userIdToAdd: value };
    axios
      .post(`${baseLocalApi}/rooms/${currRoom.current._id}/add-user`, postData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('Token')}`
        }
      })
      .then(() => {
        // console.log('Response:', response.data);
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  };

  const drawer = (
    <div>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `${drawerWidth}px`, xs: `100%` },
          mr: {
            sm: `calc(100% - ${drawerWidth}px)`
          }
        }}>
        <ChatHeader setRoom={changeRoom} />
      </AppBar>
      <Toolbar />
      <Toolbar />
      <ChatBar setRoom={changeRoom} />
    </div>
  );

  const container = windowProp !== undefined ? () => windowProp().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {currRoom.current._id && (
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` }
          }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, visibility: { sm: 'hidden' } }}>
                <ArrowBack />
              </IconButton>
              <AvatarWithLastSeen
                name={currRoom.current.isGroup ? currRoom.current.name : (receiver && receiver.name) || room.name}
                receiver={receiver}
                photoUrl={(receiver && receiver.photoUrl) || room.photoUrl}
                isOnline={online}
              />
            </div>
            <Typography variant="h6" noWrap component="div" display="flex" alignItems="right">
              <MenuListComposition
                listOptions={false}
                isGroup={currRoom.current.isGroup}
                addUser={addUserInGroup}
                showGroupNameInputBox={false}
              />
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: '100%'
            }
          }}>
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            }
          }}
          open>
          {drawer}
        </Drawer>
      </Box>
      {currRoom.current._id && (
        <>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` }
            }}>
            <Toolbar />
            <div style={{ paddingBottom: '70px' }} ref={scrollableRef}>
              {messages.map((el, index) => (
                <MessageBox
                  key={index}
                  message={el.message}
                  sender={el.senderName}
                  align={el.senderId !== localStorage.getItem('_id') ? 'left' : 'right'}
                  timestamp={moment(el.createdOn).format('hh:mm a')}
                  status={el.status}
                />
              ))}
              {typing && (
                <MessageBox
                  message=""
                  sender=""
                  align="left"
                  timestamp=""
                  element={<Lottie width={70} options={defaultOptions} style={{ padding: '0', marginLeft: '-20px' }} />}
                />
              )}
            </div>
          </Box>
          <ChatMessageBar typingHandler={typingHandler} onSend={sendMessage} drawerWidth={drawerWidth} />
        </>
      )}
    </Box>
  );
};

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func
};

export default ResponsiveDrawer;
