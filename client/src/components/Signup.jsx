import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Signup = () => {
    const [formData, setFormData] = useState({})
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.id]: event.target.value
        })
        // console.log(event.target.value)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        // console.log(formData)

        try {
            setLoading(true)
            const res = await fetch('/chatty/v1/auth/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            console.log(data)

            if (data.success === false) {
                setLoading(false)
                setError(data.message)
                return
            }

            setLoading(false)
            setError(null)
            navigate('/sign-in')

        } catch (error) {
            setLoading(false)
            setError(error.message)
        }
    }

    return (
        <div className='bg-blue-50 h-screen md:flex gap-8 justify-center items-center'>
            <div className="w-[650px]">
                <img src="chatting.jpg" alt="login-photo" className='rounded-md' />
            </div>
            <form
                onSubmit={handleSubmit}
                className="w-4/12 flex flex-col gap-5">
                <h1 className='text-4xl font-semibold mb-12'>Chatty Twitty</h1>
                <div className="mb-2">
                    <input
                        type="text"
                        onChange={handleChange}
                        className="block w-full rounded-md p-2 border mb-4 focus:outline-none"
                        id="username" name="username"
                        placeholder='Username'
                        required
                    />
                    <p className="mb-2 text-red-700 font-semibold hidden">This is an error!</p>
                    <input
                        type="email"
                        onChange={handleChange}
                        className="block w-full rounded-md p-2 border mb-4 focus:outline-none"
                        id="email" name="email"
                        placeholder='Email'
                        required
                    />
                    <p className="mb-2 text-red-700 font-semibold hidden">This is an error!</p>
                    <input
                        type="password"
                        onChange={handleChange}
                        className="block w-full rounded-md p-2 border focus:outline-none"
                        id="password" name="password"
                        placeholder='Password'
                        required
                    />
                    <p className="mt-2 text-red-700 font-semibold hidden">This is an error!</p>
                </div>
                <div className="flex flex-col gap-3 ">
                    <button className="block w-full rounded-md border bg-green-700 hover:bg-green-600 p-3 text-white">
                        {loading ? 'Loading...' : 'Sign Up'}
                    </button>
                    <div className="flex gap-5">
                        <p className="">Already have an account?</p>
                        <Link to={'/sign-in'}>
                            <span className="px-4 py-1 bg-blue-900 rounded text-white">Login</span>
                        </Link>
                    </div>
                    {<p className='text-red-700 mt-5'>{error}</p>}
                </div>
            </form>
        </div>
    )
}

export default Signup
