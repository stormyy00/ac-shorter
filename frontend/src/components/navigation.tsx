"use client"
import {useSession, signOut} from '@/utils/auht-client'
import Link from 'next/link'
import React from 'react'

const Navigation = () => {
    const {data: session} = useSession()
 

  return (

        <div className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
            <div className="text-gray-200 text-xl font-semibold">AC Shorter</div>
            <div>
                {session ? (
                <button
                    onClick={() => signOut()}
                    className="text-white bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-2xl font-semibold"
                >
                    Sign Out
                </button>
                ) : (
                <Link href="/signin" className="text-white bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-2xl font-semibold">
                    Sign In
                </Link>
                )}
            </div>
            </div>
        </div>
      
  )
}

export default Navigation
