export const initialState = {
  user: null,
  uid: null,
  togglerState: 1,
  photoURL: ''
};

export const actionTypes = {
  SET_USER: 'SET_USER',
  SET_SESSION: 'SET_SESSION',
  SET_TOGGLER: 'SET_TOGGLER'
};

// eslint-disable-next-line default-param-last
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.user
      };
    case actionTypes.SET_SESSION:
      localStorage.setItem('uid', action.uid);
      localStorage.setItem('displayName', action.displayName);
      localStorage.setItem('photoURL', action.photoURL);
      console.log('session added to storage');
      return {
        ...state,
        _id: action._id,
        name: action.name,
        photoUrl: action.photoUrl,
        Token: action.Token
      };
    case actionTypes.SET_TOGGLER:
      return {
        ...state,
        togglerState: action.togglerState
      };

    default:
      return state;
  }
};

export default reducer;
