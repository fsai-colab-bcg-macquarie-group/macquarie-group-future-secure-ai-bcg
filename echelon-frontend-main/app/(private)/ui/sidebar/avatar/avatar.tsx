'use client'

import { useEffect, useRef, useState } from 'react'
import Logout from './logout/logout'
import ResetPassword from './reset-password/reset-password'
import { useNavigationContext } from '@contexts/context-navigation'
import { useDataContext } from '@contexts/context-user-data'
import { TuserJwtData } from '@contexts/types'
import SwitchCase from './switch-case/switch-case'

export default function Avatar() {
  const { contextUsersActions, usersWatchers } = useNavigationContext()
  const { userContextWatchers } = useDataContext()

  const [isSelected, setIsSelected] = useState(false)

  return (
    <span className="relative pt-4">
      <button
        type="button"
        className={`text-dark600 flex aspect-square w-[37px] items-center justify-center p-2 font-sans text-sm font-semibold transition-all duration-300 ${userContextWatchers.cUserNameAbbreviated && 'hover:bg-gray000'}`}
        disabled={!userContextWatchers.cUserNameAbbreviated}
        onMouseDown={() => {
          setIsSelected(!isSelected)
          if (usersWatchers.cUsersIsOpen) {
            contextUsersActions.cToggleUsersOption()
          }
        }}
      >
        <span className="opacity-100">
          {userContextWatchers.cUserNameAbbreviated ? (
            userContextWatchers.cUserNameAbbreviated
          ) : (
            <div className="-mt-2.5 aspect-square w-8 translate-y-2 animate-pulse bg-neutral-200" />
          )}
        </span>
      </button>
      {isSelected && (
        <AvatarDrop
          setIsSelected={setIsSelected}
          userInfo={userContextWatchers.cUserData}
        />
      )}
    </span>
  )
}

function AvatarDrop({
  setIsSelected,
  userInfo,
}: {
  setIsSelected: (isSelected: boolean) => void
  userInfo: TuserJwtData | null
}) {
  const { userContextWatchers } = useDataContext()
  const dropdownRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsSelected(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsSelected])

  return (
    <section
      ref={dropdownRef}
      className="shadow-primary anim_opacity_reveal absolute left-[94px] bottom-0 h-fit w-[314px] bg-white"
    >
     <div className="p-4 pb-0">
  <h4 className="text-dark600 font-sans text-sm font-semibold">
    {userInfo?.profile.first_name} {userInfo?.profile.last_name}
  </h4>
  <p className="text-dark600 font-sans text-xs font-normal">
    {userInfo?.profile.access_name}
  </p>
  <p className="text-dark600 mt-2 mb-3 font-sans text-xs font-normal">
    {userInfo?.email}
  </p>
  {!userInfo?.profile.access_name.includes('Admin') && ( 
    <hr className="w-full place-self-center border-neutral-200" />
  )}

  {userInfo?.use_case_teams && userInfo && (
    <>
      <p className="text-dark600 my-3.5 font-sans text-xs font-normal">
        {userContextWatchers.cSelectedTeam?.name}
      </p>
      <hr className="w-full place-self-center border-neutral-200" />
    </>
  )}
</div>
      <div className="flex flex-col">
        {userInfo?.use_case_teams && userInfo.use_case_teams.length > 1 && (
          <SwitchCase />
        )}
        {!userInfo?.amr[0].method.includes('sso/saml') && <ResetPassword />}
        <Logout />
      </div>
    </section>
  )
}
