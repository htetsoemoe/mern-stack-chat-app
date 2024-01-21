import React from 'react'
import Login from './components/Login'
import { Routes, Route } from 'react-router-dom'
import Signup from './components/Signup'
import Chat from './components/Chat'
import PrivateRoutes from './components/PrivateRoutes'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/sign-in' element={<Login />} />
        <Route path='/sign-up' element={<Signup />} />

        <Route element={<PrivateRoutes />}>
          <Route path='/' element={<Chat />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
