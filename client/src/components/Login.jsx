import React, { useState } from 'react'

const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    return (
        <div className='bg-blue-50 h-screen flex items-center'>
            <form className="w-4/12 mx-auto mb-12">
                <h1 className='text-xl font-semibold pb-2 text-center mb-4'>Chat Room</h1>
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
                    className="block w-full rounded-md p-2 mb-7 border focus:outline-none"
                    placeholder='Password'
                />
                <button className="block w-full rounded-md border bg-green-700 hover:bg-green-600 p-3 text-white">
                    Login
                </button>
            </form>
        </div>
    )
}

export default Login
