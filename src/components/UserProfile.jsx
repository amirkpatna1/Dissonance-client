import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactS3 from 'react-s3';
import axios from 'axios';
import Compressor from 'compressorjs';
import { baseApi } from '../utils/utility';
import SnackBar from './SnackBar';

// eslint-disable-next-line global-require
window.Buffer = window.Buffer || require('buffer').Buffer;

const config = {
  bucketName: process.env.REACT_APP_BUCKET,
  dirName: 'profile',
  region: process.env.REACT_APP_REGION,
  accessKeyId: process.env.REACT_APP_AWSAccessKeyId,
  secretAccessKey: process.env.REACT_APP_AWSSecretAccessKey
};

// eslint-disable-next-line no-unused-vars
const UserProfile = ({ editAccess, setOpen }) => {
  const [image, setImage] = useState();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const addImages = event => {
    const images = [];
    [...event.target.files].forEach(img => {
      const url = URL.createObjectURL(img);
      images.push({ file: img, url });
    });
    const file = event.target.files[0];
    // eslint-disable-next-line no-new
    new Compressor(file, {
      quality: 0.4, // Adjust the quality value as per your requirement
      success: compressedResult => {
        // compressedResult has the compressed file.
        // Use the compressed file to upload the images to your server.
        compressedResult.name = localStorage.getItem('_id');
        ReactS3.uploadFile(compressedResult, config)
          .then(data => {
            const patchData = { photoUrl: data.location };
            axios
              .patch(`${baseApi}/api/users/${localStorage.getItem('_id')}`, patchData, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('Token')}`
                }
              })
              .then(() => {
                setSeverity('success');
                setSnackBarMessage(`Successfully updated profile picture`);
                setOpenSnackBar(true);
                localStorage.setItem('photoUrl', data.location);
              })
              .catch(err => {
                setSeverity('error');
                setSnackBarMessage(err.message);
                setOpenSnackBar(true);
                console.error(err);
              });
          })
          .catch(err => {
            setImage(false);
            return console.error(err);
          });
      }
    });

    if (images && images[0]?.url) {
      setImage(images[0].url);
    }
  };

  const headerStyle = {
    position: 'absolute',
    top: '4%',
    left: '7%',
    color: 'black',
    zIndex: '2'
  };

  return (
    <div style={{ position: 'relative' }}>
      <SnackBar message={snackBarMessage} open={openSnackBar} setOpen={setOpenSnackBar} severity={severity} />

      <ArrowBackIcon sx={headerStyle} onClick={() => setOpen(false)} />

      <div className="body-container">
        <div className="container">
          <div className="avatar">
            <label htmlFor="file-input">
              <Avatar
                alt={localStorage.getItem('name')}
                src={image || localStorage.getItem('photoUrl') || '/static/images/avatar/1.jpg'}
                sx={{
                  width: 165,
                  height: 165,
                  borderRadius: '50%',
                  backgroundColor: 'orange',
                  fontSize: '4rem'
                }}
              />
              <div className="plus-icon">+</div>
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/jpg, image/jpeg, image/png, image/svg, image/svg+xml"
              style={{ display: 'none' }}
              onChange={addImages}
            />
          </div>
          <div className="username">
            <h3>{localStorage.getItem('name')}</h3>
          </div>
          <div className="button" data-target="#home">
            <div className="button__icon">
              <i className="fa-solid fa-house"></i>
            </div>
            <div className="button__text">Home</div>
          </div>
          <div className="button" data-target="#contact">
            <div className="button__icon">
              <i className="fa-solid fa-phone"></i>
            </div>
            <div className="button__text">Contact</div>
          </div>
          <div className="button" data-target="#about">
            <div className="button__icon">
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="button__text">About</div>
          </div>
          <div className="button" data-target="#education">
            <div className="button__icon">
              <i className="fa-solid fa-user-graduate"></i>
            </div>
            <div className="button__text">Education</div>
          </div>
        </div>
        <div className="page" id="home">
          <div className="page__header">
            <div className="page__title">Home</div>
            <div className="page__close">
              <i className="fa-solid fa-xmark"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

UserProfile.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  editAccess: PropTypes.bool,
  setOpen: PropTypes.func
};

export default UserProfile;
