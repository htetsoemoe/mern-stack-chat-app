import React, { useState } from 'react'

const Login = () => {
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
                        className="block w-full rounded-md p-2 mb-4 border focus:outline-none"
                        placeholder='Username'
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-md p-2 border focus:outline-none"
                        placeholder='Password'
                    />
                    <p className="mt-4 text-red-700 font-semibold hidden">This is an error!</p>
                </div>
                <div className="flex flex-col gap-3 ">
                    <button className="block w-full rounded-md border bg-green-700 hover:bg-green-600 p-3 text-white">
                        Login
                    </button>
                    <div className="flex gap-5">
                        <p className="">Want to create a new account?</p>
                        <a href='#' className="underline">Register</a>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Login
