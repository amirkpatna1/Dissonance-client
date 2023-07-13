export const initialState = {
  _id: '',
  name: '',
  photoUrl: '',
  createdOn: '',
  admins: [],
  users: []
};

export const actionTypes = {
  SET_ROOM: 'SET_ROOM'
};

// eslint-disable-next-line default-param-last
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_ROOM:
      return {
        ...state,
        _id: action._id,
        name: action.name,
        photoUrl: action.photoUrl,
        createdOn: action.createdOn,
        admins: action.admins,
        users: action.users
      };

    default:
      return state;
  }
};

export default reducer;
