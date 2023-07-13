import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24
};

const previewImageStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'transparent',
  border: '2px transparent',
  borderRadius: '50%',
  boxShadow: 24
};

export default function BasicModal({ open, setOpen, title, element, previewImage }) {
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={previewImage ? previewImageStyle : style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          {element}
        </Box>
      </Modal>
    </div>
  );
}

BasicModal.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  title: PropTypes.string,
  element: PropTypes.any,
  previewImage: PropTypes.bool
};
