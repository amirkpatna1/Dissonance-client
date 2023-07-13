export const initialState = {
  rooms: []
};

export const actionTypes = {
  SET_CHAT_LIST: 'SET_CHAT_LIST'
};

// eslint-disable-next-line default-param-last
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_CHAT_LIST:
      return {
        ...state,
        rooms: action.rooms
      };

    default:
      return state;
  }
};

export default reducer;
