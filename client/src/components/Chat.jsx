import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  signOutStart, signOutSuccess, signOutFailure
} from '../redux/user/userSlice'
import Avatar from './Avatar'
import Logo from './Logo'

const Chat = () => {
  const [webSocket, setWebSocket] = useState(null)
  const dispatch = useDispatch()
  const [onlinePeople, setOnlinePeople] = useState({})
  const [selectedUserId, setSelectedUserId] = useState(null)
  const { currentUser } = useSelector((state) => state.user)  // Get currentUser from Redux Store
  const { _id: userId, username } = currentUser
  // console.log(userId, username)

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

  // Socket server response to client handler
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

  // Exclude Current Login User from Chat UI
  const excludeCurrentUserFromOnlinePeople = { ...onlinePeople }
  // console.log(excludeCurrentUserFromOnlinePeople)
  delete excludeCurrentUserFromOnlinePeople[userId]

  return (
    <div className='flex h-screen'>
      {/* Left Sections */}
      <div className="flex flex-col bg-white w-1/4">
        <div className="flex-grow p-5">
          <Logo />

          {/* Show online people */}
          {Object.keys(excludeCurrentUserFromOnlinePeople).map(userId => (
            <div key={userId}
              onClick={() => setSelectedUserId(userId)}
              className={`border-b border-gray-50 bg-slate-200 font-semibold rounded-md mb-3 flex items-center gap-3 hover:cursor-pointer ${userId === selectedUserId ? 'bg-blue-200' : ''}`}>

              {/* If user clicked on a specified user show vertical bar on left-handed side */}
              {userId === selectedUserId && (
                <div className="w-[7px] bg-pink-500 h-14"></div>
              )}

              <div className="flex items-center gap-3 pl-3 py-3">
                <Avatar username={onlinePeople[userId]} userId={userId} />
                <span>{onlinePeople[userId]}</span>
              </div>
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
          {!selectedUserId && (
            <div className="flex flex-grow h-full pt-20">
              <div className="text-gray-500 text-2xl">&larr; Select a person from the sidebar.</div>
            </div>
          )}
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
