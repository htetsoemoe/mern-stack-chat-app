import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  signOutStart, signOutSuccess, signOutFailure
} from '../redux/user/userSlice'
import Avatar from './Avatar'
import Logo from './Logo'
import { uniqBy, uniqueId } from 'lodash'

const Chat = () => {
  const [webSocket, setWebSocket] = useState(null)
  const dispatch = useDispatch()
  const [onlinePeople, setOnlinePeople] = useState({})
  const [selectedUserId, setSelectedUserId] = useState(null)
  const { currentUser } = useSelector((state) => state.user)  // Get currentUser from Redux Store
  const { _id: userId, username } = currentUser
  // console.log(userId, username)
  const [newMessageText, setNewMessageText] = useState("")
  const [messages, setMessages] = useState([])
  console.log(messages)

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
    } else if ('text' in messageData) {
      console.log(messageData)
      setMessages(prev => ([...prev, { ...messageData }]))
    }
  }

  // Send Message to web socket server
  const sendMessage = (event) => {
    event.preventDefault()
    console.log("Message Sending...")
    webSocket.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessageText,
    }))
    setNewMessageText('')
    setMessages(prev => ([...prev, {
      text: newMessageText,
      sender: userId,
      recipient: selectedUserId,
    }]))
  }

  // remove duplicate message id with lodash's uniqueBy
  // const messagesWithoutDuplicates = uniqueId(messages, '_id')

  // Exclude Current Login User from Chat UI
  const excludeCurrentUserFromOnlinePeople = { ...onlinePeople }
  // console.log(excludeCurrentUserFromOnlinePeople)
  delete excludeCurrentUserFromOnlinePeople[userId]

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
          {/* !selectedUserId = !undefined = true */}
          {!selectedUserId && (
            <div className="flex flex-grow h-full pt-20">
              <div className="text-gray-500 text-2xl">&larr; Select a person from the sidebar.</div>
            </div>
          )}
          {/* !!selectedUserId = !!undefined = false meaning is 'selectedUserId' is existing */}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messages.map((message, index) => (
                  <div key={index}
                    className={(message.sender === userId ? 'text-right' : 'text-left')}
                  >
                    <div className={`text-left inline-block p-2 my-2 rounded-md text-sm ${message.sender === userId ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}>
                      {message.text}
                    </div>
                    {/* SenderID: {message.sender} <br />
                  MyID: {userId} <br /> */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form
            onSubmit={sendMessage}
            className='flex gap-2 mb-5'>
            <input
              type="text"
              value={newMessageText}
              onChange={event => setNewMessageText(event.target.value)}
              placeholder="Type your message"
              className="bg-white p-3 border rounded-sm flex-grow focus:outline-none"
            />
            <button
              type='submit'
              className='bg-blue-800 p-2 rounded-sm text-white'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Chat
