import { combineReducers } from 'redux';
import userReducer from './userReducer';
import roomReducer from './roomReducer';
import chatListReducer from './chatListReducer';

const reducers = combineReducers({
  userReducer,
  roomReducer,
  chatListReducer
});

export default reducers;
