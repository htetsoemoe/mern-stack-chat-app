import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  signOutStart, signOutSuccess, signOutFailure
} from '../redux/user/userSlice'

const Chat = () => {
  const [webSocket, setWebSocket] = useState(null)
  const dispatch = useDispatch()

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3500') // Provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.
    setWebSocket(ws) // Set web-socket server to state

    ws.addEventListener('message', handleMessage)
  }, [])

  const handleMessage = (event) => {
    console.log("New Message", event)
  }

  // SignOut Handler
  const signOutHandler = async () => {
    try {
      dispatch(signOutStart())
      const res = await fetch('/chatty/v1/auth/sign-out') // clear jwt token in cookie from backend
      const data = await res.json()

      if (data.success === false) {
        dispatch(signOutFailure(data.message))
        return
      }

      dispatch(signOutSuccess())  // when signOut is success set null to currentUser in redux store

    } catch (error) {
      dispatch(signOutFailure(error.message))
    }
  }

  return (
    <div className='flex h-screen'>
      {/* Left Sections */}
      <div className="flex flex-col bg-white w-1/4">
        <h1 className="flex-grow text-2xl p-5 font-semibold">Contacts</h1>

        <div className="mb-5 pl-5">
          <span
            onClick={signOutHandler}
            className="text-red-700 text-xl cursor-pointer">Sign Out</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col bg-blue-50 w-full p-4">
        <div className='flex-grow'>
          <h1 className="text-2xl p-3 font-semibold">Messages with selected person</h1>
        </div>
        <div className='flex gap-2 mb-5'>
          <input
            type="text"
            placeholder="Type your message"
            className="bg-white p-3 border rounded-sm flex-grow focus:outline-none"
          />
          <button className='bg-blue-800 p-2 rounded-sm text-white'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
