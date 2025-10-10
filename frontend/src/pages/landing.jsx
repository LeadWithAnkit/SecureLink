import React from 'react'
import { Link } from "react-router-dom";
import "../App.css";

export default function LandingPage({ user, onLogout }) {
  return (
    <div className='landingPageContainer'>
        <nav>
          <div className='navHeader'>
            <h2><img src='/logo.png' alt='logo' /> SecureLink</h2>
          </div>
          <div className='navlist'>
            <p>Join as Guest</p>
            {user ? (
              <>
                <p>Welcome, {user.name}</p>
                <div role='button' onClick={onLogout}>
                  <p>Logout</p>
                </div>
              </>
            ) : (
              <>
                <div role='button'>
                  <Link to="/auth">Login</Link>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Rest of your landing page content */}
        <div className="landingMainContainer">
          <div>
            <h1><span style={{color:"magenta"}}>Connect</span> with your loved Ones</h1>
            <p>Cover your relation at distance by SecureLink</p>
            <div role='button'>
              <Link to={user ? "/dashboard" : "/auth"}>Get Started</Link>
            </div>
          </div>
          <div>
            <img src="/mobile.png" alt="image" />
          </div>
        </div>
    </div>
  )
}

//-> CSS to jsx
//-> premade component ko modify karke use karna

