import React from 'react';
import PropTypes from 'prop-types';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

function EmojiPicker({ message, setMessage }) {
  const handleClick = emojiObject => {
    const newMessage = message + emojiObject.native;
    setMessage(newMessage);
  };
  return <Picker data={data} onEmojiSelect={handleClick} />;
}

EmojiPicker.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  message: PropTypes.string,
  setMessage: PropTypes.func
};

export default EmojiPicker;
