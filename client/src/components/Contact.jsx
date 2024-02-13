import React from 'react'
import Avatar from './Avatar'

const Contact = ({ id, username, onClick, selected, online }) => {
    return (
        <div key={id}
            onClick={() => onClick(id)}
            className={`border-b border-gray-50 bg-slate-200 font-semibold rounded-md mb-3 flex items-center gap-3 hover:cursor-pointer`}>

            {/* If user clicked on a specified user show vertical bar on left-handed side */}
            {selected && (
                <div className="w-[7px] bg-orange-700 h-14"></div>
            )}

            <div className="flex items-center gap-3 pl-3 py-3">
                <Avatar username={username} userId={id} online={online} />
                <span>{username}</span>
            </div>
        </div>
    )
}

export default Contact
