export const setUser = props => {
  return dispatch => {
    dispatch({
      type: 'SET_USER',
      ...props
    });
  };
};

export const setSession = props => {
  return dispatch => {
    dispatch({
      type: 'SET_SESSION',
      ...props
    });
  };
};

export const setCurrentRoom = props => {
  return dispatch => {
    dispatch({
      type: 'SET_ROOM',
      ...props
    });
  };
};

export const setChatList = props => {
  return dispatch => {
    dispatch({
      type: 'SET_CHAT_LIST',
      ...props
    });
  };
};
