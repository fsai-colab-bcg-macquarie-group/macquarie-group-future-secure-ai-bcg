'use client'

import { useState } from 'react'
import Overlay from './confirm-modal'
import { LogOut } from 'lucide-react'

export default function Logout() {
  const [isSelected, setIsSelected] = useState(false)
  return (
    <>
      <button
        type="button"
        className={`group font-400 flex items-center gap-4 px-4 py-4 text-xs transition-all duration-300 hover:bg-gray200 ${isSelected && 'bg-gray200'}`}
        onClick={() => setIsSelected(true)}
      >
        <div className="aspect-square w-6 opacity-80">
          <LogOut
            className={`${isSelected && 'text-dark600'} group-hover:text-dark600 transition-all duration-300`}
          />
        </div>
        <p
          className={`${isSelected && 'text-dark600'} group-hover:text-dark600 transition-all duration-300`}
        >
          Logout
        </p>
      </button>
      {isSelected && <Overlay setIsSelected={setIsSelected} />}
    </>
  )
}
