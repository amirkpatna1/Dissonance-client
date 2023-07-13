import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import moment from 'moment-timezone';
import CommonModal from '../../components/CommonModal';

const getLastSeen = date => {
  if (moment(date).startOf('day').isSame(moment().startOf('day'))) {
    return moment(date).format('hh:mm a');
  }
  return moment(date).format('DD/MM/YYYY hh:mm a');
};

export default function LongMenu({ name, photoUrl, receiver, isOnline }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center space-x-4">
      <CommonModal
        open={open}
        setOpen={setOpen}
        previewImage={true}
        element={
          <Avatar
            alt={name}
            src={photoUrl || '/static/images/avatar/2.jpg'}
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
      <Avatar alt={name} src={photoUrl || '/static/images/avatar/2.jpg'} onClick={() => setOpen(true)} />
      <div className="font-medium dark:text-white">
        <div>{name}</div>
        <div className="text-sm text-gray-500 dark:text-white">
          {isOnline
            ? 'Online'
            : `Last seen ${(receiver && receiver.lastSeen && getLastSeen(receiver.lastSeen)) || ' '}`}
        </div>
      </div>
    </div>
  );
}

LongMenu.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  name: PropTypes.string,
  photoUrl: PropTypes.string,
  receiver: PropTypes.object,
  isOnline: PropTypes.bool
};
