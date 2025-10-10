import { useState, useEffect } from 'react'
import LandingPage from './pages/landing'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Authentication from './pages/authentication';
import VideoMeetComponent from './pages/VideoMeet';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage user={user} onLogout={handleLogout} />} />
          <Route path='/auth' element={!user ? <Authentication /> : <Navigate to="/" />} />
          <Route path='/dashboard' element={user ? <div>Dashboard - Welcome {user.name}</div> : <Navigate to="/auth" />} />
          <Route path='/:url' element={<VideoMeetComponent />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
