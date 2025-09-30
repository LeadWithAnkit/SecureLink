import { useState } from 'react'
import LandingPage from './pages/landing'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <Router>


        <Routes>

          {/* <Route path='/home' element=/> */}
         <Route path='/' element={<LandingPage />}> </Route>

          </Routes>
        
      </Router>
      
    </div>
  )
}

export default App
