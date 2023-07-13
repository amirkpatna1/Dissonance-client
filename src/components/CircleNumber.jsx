import React from 'react';
import PropTypes from 'prop-types';

const CircleNumber = ({ number }) => {
  const circleStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'green',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold',
    marginTop: '18px'
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <div style={circleStyle}>{number}</div>
    </div>
  );
};

CircleNumber.propTypes = {
  number: PropTypes.number
};

export default CircleNumber;
