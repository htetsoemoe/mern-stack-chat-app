import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  signOutStart, signOutSuccess, signOutFailure
} from '../redux/user/userSlice'
import Avatar from './Avatar'
import Logo from './Logo'
import { uniqBy, uniqueId } from 'lodash'
import axios from 'axios'
import Contact from './Contact'

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
  // console.log(messages)
  const divUnderMessages = useRef()
  const [offlinePeople, setOfflinePeople] = useState({})
  // console.log(offlinePeople)

  useEffect(() => {
    connectToWebSocket()
  }, [selectedUserId])

  // when chat component was mounted, reloaded the page(Chat.jsx) and lost the connection, need to reconnect to socket server
  const connectToWebSocket = () => {
    const ws = new WebSocket('ws://localhost:3500') // Provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.
    setWebSocket(ws) // Set web-socket server to state

    // handler of incoming messages from socket server
    ws.addEventListener('message', handleMessage)

    // handler of web socket connection close or component update(Chat.jsx)
    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnected...")
        connectToWebSocket()
      }, 1000)
    })
  }

  // get all messages of when user clicked on a specified user(selectedUserId)
  const fetchAllMessages = async () => {
    const res = await fetch(`/chatty/v1/message/${selectedUserId}`, { method: 'GET' })
    const data = await res.json()
    setMessages(data)
  }

  // get selectedUserId's messages from MongoDB
  useEffect(() => {
    if (selectedUserId) {
      fetchAllMessages()
    }
  }, [selectedUserId])

  // get all users from MongoDB and filter offlinePeople based on 'onlinePeople' dependency
  useEffect(() => {
    // this method return offlinePeople array
    const getOfflinePeople = async () => {
      const res = await fetch('/chatty/v1/users/')
      const data = await res.json()
      return data
    }

    getOfflinePeople().then(res => {
      const offlinePeopleArray = res
        .filter(p => p._id !== userId) // exclude current userId
        .filter(p => !Object.keys(onlinePeople).includes(p._id)) // filter only offline people

      const offlinePeople = {}
      offlinePeopleArray.forEach(p => {
        offlinePeople[p._id] = p
      })
      setOfflinePeople(offlinePeople)
      // console.log(offlinePeople)
    })
  }, [onlinePeople])

  // If new message has arrived, this effect will run
  useEffect(() => {
    const div = divUnderMessages.current
    if (div) {
      div.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

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
  const handleMessage = (event) => {  // event = MessageEvent
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
  const sendMessage = (event, file = null) => {
    if (event) {
      event.preventDefault()
    }
    console.log("Message Sending...")

    webSocket.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessageText,
      file, // file object
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
  // console.log("Before Exclude current user : ", excludeCurrentUserFromOnlinePeople)

  delete excludeCurrentUserFromOnlinePeople[userId]
  // console.log("After Exclude current user : ", excludeCurrentUserFromOnlinePeople)

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

  const sendFile = (event) => {
    const reader = new FileReader()
    reader.readAsDataURL(event.target.files[0])
    reader.onload = () => {
      sendMessage(null, {
        name: event.target.files[0].name,
        data: reader.result,
      })
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
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={excludeCurrentUserFromOnlinePeople[userId]}
              onClick={() => { setSelectedUserId(userId) }}
              selected={userId === selectedUserId}
            />
          ))}

          {/* Show offline people */}
          {Object.keys(offlinePeople).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => { setSelectedUserId(userId) }}
              selected={userId === selectedUserId}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-5 mb-9 pl-5 pr-5">
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="font-semibold">
              {username}
            </span>
          </div>
          <button
            onClick={signOutHandler}
            className='text-sm font-semibold bg-blue-200 hover:bg-blue-300 hover:text-black py-1 px-2  border rounded-md'
          >
            Sign Out
          </button>
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
                    <div className={`text-left inline-block p-2 my-2 rounded-md text-sm ${message.sender === userId ? 'bg-blue-500 text-white font-semibold' : 'bg-white text-gray-500 font-semibold'}`}>
                      {message.text}
                    </div>
                    {/* SenderID: {message.sender} <br />
                  MyID: {userId} <br /> */}
                  </div>
                ))}
                {/* This div for smooth scrolling */}
                <div ref={divUnderMessages}></div>
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
            <label className='p-2 bg-blue-200 text-gray-600 cursor-pointer rounded-sm border border-blue-200'>
              <input type="file" className='hidden' onChange={sendFile} />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
              </svg>
            </label>
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
