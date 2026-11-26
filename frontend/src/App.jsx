import { MotionConfig } from 'motion/react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from './Pages/Landing.jsx'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import Dashboard from './Pages/Dashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MotionConfig>
    </BrowserRouter>
  )
}

export default App