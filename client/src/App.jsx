import React from 'react'
import Login from './components/Login'
import { Routes, Route } from 'react-router-dom'
import Signup from './components/Signup'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/sign-in' element={<Login />} />
        <Route path='/sign-up' element={<Signup />} />
      </Routes>
    </>
  )
}

export default App
