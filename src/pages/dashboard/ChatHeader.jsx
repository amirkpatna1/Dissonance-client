import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { Logout, AddBox } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { baseLocalApi } from '../../utils/utility';
import MoreOptions from './MoreOptions';
import SnackBar from '../../components/SnackBar';
import AddUserModal from './Modal';
import { actionCreators } from '../../state/index';
import UserProfile from '../../components/UserProfile';
import CommonModal from '../../components/CommonModal';

const ChatHeader = ({ setRoom }) => {
  const dispatch = useDispatch();
  const { setChatList } = bindActionCreators(actionCreators, dispatch);
  const rooms = useSelector(state => {
    return state.chatListReducer.rooms;
  });
  const options = ['Group chat'];
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const navigate = useNavigate();
  const addUser = (value, isGroup, name = '') => {
    const postData = {
      name,
      isGroup: !!isGroup,
      user: value,
      _id: localStorage.getItem('_id')
    };
    axios
      .post(`${baseLocalApi}/rooms`, postData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('Token')}`
        }
      })
      .then(response => {
        let found = false;
        for (let i = 0; i < rooms.length; i += 1) {
          if (response.data.room._id === rooms[i]._id) {
            found = true;
            break;
          }
        }
        if (!found) {
          setChatList({ rooms: [response.data.room, ...rooms] });
          setRoom({ ...response.data.room });
        } else {
          setSeverity('warning');
          setSnackBarMessage(`This chat is already open`);
          setOpenSnackBar(true);
        }
      })
      .catch(error => {
        setSeverity('error');
        setSnackBarMessage(error.message);
        setOpenSnackBar(true);
        console.error('Error:', error.message);
      });
  };

  return (
    <Box display="flex">
      <CommonModal open={openModal} setOpen={setOpenModal} element={<UserProfile setOpen={setOpenModal} />} />
      <List
        sx={{
          width: '100%',
          maxWidth: 360,
          bgcolor: 'background.paper'
          //   ml: {
          //     sm: `calc(100% - 200px)`,
          //     xs: `calc(100% - 200px)`,
          //   },
        }}>
        <ListItem>
          <IconButton
            color="inherit"
            sx={{
              color: 'black',
              marginLeft: '5px'
            }}
            onClick={() => {
              setOpenModal(true);
            }}>
            <Avatar
              alt={localStorage.getItem('name')}
              src={localStorage.getItem('photoUrl') || '/static/images/avatar/1.jpg'}
            />
          </IconButton>
        </ListItem>
      </List>
      <List
        sx={{
          width: '100%',
          maxWidth: 360,
          bgcolor: 'background.paper'
        }}>
        <ListItem>
          <AddUserModal addUser={addUser} open={open} setOpen={setOpen} element={<AddBox />} />
          <MoreOptions listOptions={options} addUser={addUser} />
          <SnackBar message={snackBarMessage} open={openSnackBar} setOpen={setOpenSnackBar} severity={severity} />
          <IconButton
            color="inherit"
            sx={{ color: 'black', marginLeft: '40px' }}
            onClick={() => {
              localStorage.clear();
              navigate('/signin');
            }}>
            <Logout />
          </IconButton>
        </ListItem>
      </List>
    </Box>
  );
};

ChatHeader.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  setRoom: PropTypes.func
};

export default ChatHeader;
