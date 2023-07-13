import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { baseLocalApi } from '../../utils/utility';
import { actionCreators } from '../../state/index';
import CircleNumber from '../../components/CircleNumber';
import CommonModal from '../../components/CommonModal';

const AlignItemsList = ({ setRoom }) => {
  // const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [name, setName] = useState();
  const dispatch = useDispatch();
  const { setChatList } = bindActionCreators(actionCreators, dispatch);
  const data = [
    ...useSelector(state => {
      return state.chatListReducer.rooms;
    })
  ];
  useEffect(() => {
    axios
      .get(`${baseLocalApi}/rooms/${localStorage.getItem('_id')}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('Token')}`
        }
      })
      .then(res => {
        setChatList({ rooms: res.data.rooms });
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <CommonModal
        open={open}
        setOpen={setOpen}
        previewImage={true}
        element={
          <Avatar
            alt={name}
            src={photoUrl}
            sx={{
              width: 315,
              height: 315,
              borderRadius: '50%',
              backgroundColor: 'orange',
              fontSize: '4rem'
            }}
          />
        }
      />
      {data.map(
        (el, index) =>
          el && (
            <div key={index}>
              <ListItem alignItems="flex-start" className="hover:bg-sky-100 cursor-pointer transition duration-300">
                <ListItemAvatar>
                  <Avatar
                    alt={el.isGroup ? el.name : el.receiverName}
                    src={el.photoUrl || '/static/images/avatar/1.jpg'}
                    sx={{ backgroundColor: 'orange' }}
                    onClick={() => {
                      setPhotoUrl(el.photoUrl || '/static/images/avatar/1.jpg');
                      setName(el.isGroup ? el.name : el.receiverName);
                      setOpen(true);
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  onClick={() => {
                    setRoom({ ...data[index] });
                  }}
                  primary={!el.isGroup ? el.receiverName : el.name}
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color={el.notSeenCount > 0 ? 'green' : 'text.primary'}>
                        {(el.lastMessage && el.lastMessage.senderName) || ''}
                      </Typography>
                      {` — ${(el.lastMessage && el.lastMessage.message) || ''}`}
                    </React.Fragment>
                  }
                />
                {el.notSeenCount > 0 && <CircleNumber number={el.notSeenCount} />}
              </ListItem>
              <Divider variant="inset" component="li" />
            </div>
          )
      )}
    </List>
  );
};

AlignItemsList.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  setRoom: PropTypes.func
};

export default AlignItemsList;
