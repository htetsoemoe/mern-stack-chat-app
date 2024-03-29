import React from 'react'

const Avatar = ({ userId, username, online }) => {
    const colors = ['bg-teal-400', 'bg-red-400',
        'bg-cyan-400', 'bg-purple-400',
        'bg-blue-400', 'bg-yellow-400',
        'bg-orange-400', 'bg-pink-400',
        'bg-fuchsia-400', 'bg-rose-400'];

    // Changed userId base16 to base10
    const userIdBase10 = parseInt(userId, 16)

    // Calculate avatar background color based on userIdBase10
    const colorIndex = userIdBase10 % colors.length
    const color = colors[colorIndex]

    return (
        <div className={`relative w-8 h-8 ${color} rounded-full border border-slate-700`}>
            <div className="pt-1 text-center w-full opacity-80">
                {username[0]}
            </div>
            {online && (
                <div className="absolute w-3 h-3 bg-green-500 -bottom-1 right-0 rounded-full border border-white"></div>
            )}
            {!online && (
                <div className="absolute w-3 h-3 bg-black -bottom-1 right-0 rounded-full border border-white"></div>
            )}
        </div>
    )
}

export default Avatar
