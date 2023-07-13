import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { EmojiEmotions, Close } from '@mui/icons-material';
import EmojiPicker from './EmojiPicker';

const ChatMessageBar = ({ onSend, drawerWidth, typingHandler }) => {
  const [message, setMessage] = useState('');
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [inputRows, setInputRows] = useState(1); // Number of rows in the input field
  const inputRef = useRef(null);

  const handleKeyDown = event => {
    if (event.key === 'Enter' && message) {
      onSend(message);
      setMessage('');
    }
  };

  const toggleEmojiPicker = () => {
    setOpenEmojiPicker(!openEmojiPicker);
  };

  const handleSendClick = () => {
    if (message) {
      onSend(message);
      setMessage('');
      setOpenEmojiPicker(false);
    }
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures the effect runs only once

  useEffect(() => {
    const inputElement = inputRef.current;
    const textFieldWidth = inputElement.getBoundingClientRect().width;
    const calculatedRows = Math.ceil((message.length * 2) / textFieldWidth);
    setInputRows(Math.min(calculatedRows, 9));
  }, [message]); // Recalculate rows whenever the message changes

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        backgroundColor: '#f5f5f5',
        ...(windowWidth < 600
          ? {}
          : {
              width: `calc(100% - ${drawerWidth}px)`,
              marginLeft: `${drawerWidth}px`
            })
      }}>
      <div style={{ position: 'absolute', bottom: '15px', left: '-1px' }}>
        {openEmojiPicker && <EmojiPicker setMessage={setMessage} message={message} />}

        <IconButton onClick={toggleEmojiPicker}>
          {openEmojiPicker ? <Close /> : <EmojiEmotions sx={{ color: 'grey' }} />}
        </IconButton>
      </div>
      <TextField
        ref={inputRef}
        fullWidth
        multiline
        rows={inputRows}
        placeholder="Type your message here"
        value={message}
        onChange={event => {
          setMessage(event.target.value);
          typingHandler();
        }}
        onKeyDown={handleKeyDown}
        sx={{ marginLeft: '30px' }}
      />
      <IconButton onClick={handleSendClick}>
        <SendIcon />
      </IconButton>
    </div>
  );
};

ChatMessageBar.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  onSend: PropTypes.func,
  drawerWidth: PropTypes.number,
  typingHandler: PropTypes.func
};

export default ChatMessageBar;
