import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  signOutStart, signOutSuccess, signOutFailure
} from '../redux/user/userSlice'
import Avatar from './Avatar'

const Chat = () => {
  const [webSocket, setWebSocket] = useState(null)
  const dispatch = useDispatch()
  const [onlinePeople, setOnlinePeople] = useState({})

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3500') // Provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.
    setWebSocket(ws) // Set web-socket server to state

    ws.addEventListener('message', handleMessage)
  }, [])

  // Show Online People
  const showOnlinePeople = (peopleArray) => {
    const people = {}
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username
    })
    //console.log(people)
    setOnlinePeople(people)
  }

  const handleMessage = (event) => {
    const messageData = JSON.parse(event.data)
    //console.log(messageData)
    if ('online' in messageData) {
      showOnlinePeople(messageData.online) // messageData.online is an Array type
    }
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
        <div className="flex-grow p-5">
          <h1 className='flex items-center gap-3 mb-10 text-2xl text-blue-500 font-bold'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
              <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
            </svg>
            Chatty Twitty
          </h1>

          {/* Show online people */}
          {Object.keys(onlinePeople).map(userId => (
            <div key={userId} className="border-b border-gray-50 py-3 bg-slate-200 font-semibold rounded-md mb-3 pl-5 flex items-center gap-3">
              <Avatar username={onlinePeople[userId]} userId={userId} />
              <span>{onlinePeople[userId]}</span>
            </div>
          ))}
        </div>

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
