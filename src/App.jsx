import React, { Routes, Route } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ChatBox from './pages/dashboard/chatbox';
import './App.css';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<ChatBox />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/chatbox" element={<ChatBox />} />
      </Routes>
    </>
  );
};

export default App;
