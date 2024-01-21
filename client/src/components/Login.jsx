import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { signInStart, signInFailure, signInSuccess } from '../redux/user/userSlice'

const Login = () => {
    const [formData, setFormData] = useState({})
    const { loading, error } = useSelector((state) => state.user)
    //console.log(error)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.id]: event.target.value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            dispatch(signInStart())
            const res = await fetch('/chatty/v1/auth/sign-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            console.log(data)

            if (data.success === false) {
                dispatch(signInFailure(data.message)) // set backend error message into 'error' of redux store
                console.log(data.message)
                return
            }

            dispatch(signInSuccess(data))
            navigate('/')

        } catch (error) {
            dispatch(signInFailure(error.message))
        }
    }

    return (
        <div className='bg-blue-50 h-screen md:flex gap-8 justify-center items-center'>
            <div className="w-[620px]">
                <img src="chatting.jpg" alt="login-photo" className='rounded-md' />
            </div>
            <form
                onSubmit={handleSubmit}
                className="w-4/12 flex flex-col gap-5">
                <h1 className='text-4xl font-semibold mb-12'>Chatty Twitty</h1>
                <div className="mb-2">
                    <input
                        type="email"
                        onChange={handleChange}
                        id='email' name='email'
                        className="block w-full rounded-md p-2 mb-4 border focus:outline-none"
                        placeholder='Email'
                        required
                    />
                    <input
                        type="password"
                        onChange={handleChange}
                        id='password' name='password'
                        className="block w-full rounded-md p-2 border focus:outline-none"
                        placeholder='Password'
                        required
                    />
                    <p className={`mt-4 text-red-700 font-semibold ${error ? "" : "hidden"}`}>{error}</p>
                </div>
                <div className="flex flex-col gap-3 ">
                    <button
                        disabled={loading}
                        className="block w-full rounded-md border bg-green-700 hover:bg-green-600 p-3 text-white">
                        {loading ? 'Loading...' : 'Sign In'}
                    </button>
                    <div className="flex gap-5">
                        <p className="">Want to create a new account?</p>
                        <Link to={'/sign-up'}>
                            <span className="px-4 py-1 bg-blue-900 rounded text-white">Register</span>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Login
