import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Signup = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    return (
        <div className='bg-blue-50 h-screen md:flex gap-8 justify-center items-center'>
            <div className="w-[620px]">
                <img src="chatting.jpg" alt="login-photo" className='rounded-md' />
            </div>
            <form className="w-4/12 flex flex-col gap-5">
                <h1 className='text-4xl font-semibold mb-12'>Chatty Twitty</h1>
                <div className="mb-2">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="block w-full rounded-md p-2 border mb-4 focus:outline-none"
                        placeholder='Username'
                    />
                    <p className="mb-2 text-red-700 font-semibold hidden">This is an error!</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-md p-2 border focus:outline-none"
                        placeholder='Password'
                    />
                    <p className="mt-2 text-red-700 font-semibold hidden">This is an error!</p>
                </div>
                <div className="flex flex-col gap-3 ">
                    <button className="block w-full rounded-md border bg-green-700 hover:bg-green-600 p-3 text-white">
                        Sign Up
                    </button>
                    <div className="flex gap-5">
                        <p className="">Already have an account?</p>
                        <Link to={'/sign-in'}>
                            <span className="px-4 py-1 bg-blue-900 rounded text-white">Login</span>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Signup
