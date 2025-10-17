import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import withAuth from './utils/withAuth';
import Landing from './pages/landing';
import Authentication from './pages/authentication';
import Home from './pages/home';
import VideoMeet from './pages/VideoMeet';
import History from './pages/history';
import './App.css';

// Protected components
const ProtectedHome = withAuth(Home);
const ProtectedVideoMeet = withAuth(VideoMeet);
const ProtectedHistory = withAuth(History);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/home" element={<ProtectedHome />} />
            <Route path="/meet" element={<ProtectedVideoMeet />} />
            <Route path="/history" element={<ProtectedHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;