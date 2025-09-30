import React from 'react'
import { Link } from "react-router-dom";
import "../App.css";
export default function LandingPage() {
  return (
    <div className='landingPageContainer'>
        <nav>
          <div className='navHeader'>
            <h2><img src= '/logo.png' alt='logo' /> </h2>
            </div>
          <div className='navlist'>
            <p> Join as Guest</p> 
            <p> Register</p> 
            <div role='button'>
              <p>Login</p>
            </div>
            </div>
        </nav>

        <div className="landingMainContainer">
          <div>
            <h1><span style={{color:"magenta"}}>Connect</span> with your loved Ones</h1>

            <p> Cover your relation at distance by SecureLink </p>
            <div role='button'>
              <Link to={"/home"}> Get Started</Link>
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

