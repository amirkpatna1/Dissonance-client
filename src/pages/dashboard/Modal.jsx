import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import SnackBar from '../../components/SnackBar';
import { validateFormData } from '../../utils/utility';

export default function Modal({
  addUser,
  element,
  open,
  setOpen,
  showIconButton = true,
  isGroup = false,
  showGroupNameInputBox = true
}) {
  // const [open, setOpen] = React.useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [value, setValue] = React.useState('');
  const [roomName, setRoomName] = useState('');
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleSubmit = () => {
    if (isGroup && showGroupNameInputBox) {
      if (!roomName) {
        setSeverity('error');
        setSnackBarMessage('Please enter valid group name!');
        setOpenSnackBar(true);
        return;
      }
      if (roomName.length > 30) {
        setSeverity('error');
        setSnackBarMessage('Please enter shorter group name!');
        setOpenSnackBar(true);
        return;
      }
    }
    if (!(value && validateFormData({ mobile: value }) && value !== localStorage.getItem('mobile'))) {
      setSeverity('error');
      setSnackBarMessage('Please enter valid mobile number!');
      setOpenSnackBar(true);
      return;
    }

    addUser(value, isGroup, roomName);
    setValue('');
    handleClose();
  };

  return (
    <div>
      {showIconButton && (
        <IconButton color="inherit" sx={{ color: 'orange' }} onClick={handleClickOpen}>
          {element}
        </IconButton>
      )}

      <SnackBar message={snackBarMessage} open={openSnackBar} setOpen={setOpenSnackBar} severity={severity} />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Start Messaging</DialogTitle>
        <DialogContent>
          <DialogContentText>To start messaging, please enter mobile number here.</DialogContentText>
          {isGroup && showGroupNameInputBox && (
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Group name"
              type="text"
              fullWidth
              variant="standard"
              onChange={event => {
                setRoomName(event.target.value);
              }}
            />
          )}
          <TextField
            autoFocus
            margin="dense"
            id="mobile"
            label="Mobile number"
            fullWidth
            variant="standard"
            onChange={event => {
              setValue(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

Modal.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  addUser: PropTypes.func,
  element: PropTypes.any,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  showIconButton: PropTypes.bool,
  isGroup: PropTypes.bool,
  showGroupNameInputBox: PropTypes.bool
};
