'use client'

import Avatar from './avatar/avatar'
import Navigation from './nav/navigation'
import Logo from '@assets/svg/fsai-os.svg'
import { useRef, useEffect } from 'react'

export default function Sidebar() {
  const navRef = useRef<HTMLDivElement>(null)

  // Logic to add borders on the scrollbar when there is overflow-y
  useEffect(() => {
    const checkScroll = () => {
      if (navRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = navRef.current
        navRef.current.style.borderWidth = `${scrollTop > 0 ? 1 : 0}px ${0}px ${scrollHeight - scrollTop === clientHeight ? 0 : 1}px`
        navRef.current.style.borderStyle = 'solid'
        navRef.current.style.borderColor = '#E7EAEE'
      }
    }

    const observer = new ResizeObserver(checkScroll)
    if (navRef.current) {
      observer.observe(navRef.current)
      navRef.current.addEventListener('scroll', checkScroll)
      checkScroll()
    }

    return () => {
      observer.disconnect()
      navRef.current?.removeEventListener('scroll', checkScroll)
    }
  }, [])

  return (
    <div className="pointer-events-auto fixed z-20 flex h-screen w-fit max-w-[100px] flex-col items-center justify-between overflow-visible border-r border-r-gray000 bg-light100 px-5 py-6">
      <div className="aspect-square w-[52px] bg-transparent">
        <img
          src={Logo.src}
          alt="Logo FSAI OS"
          className="aspect-square h-auto w-full rounded-md"
        />
      </div>
      <div
        ref={navRef}
        className="max-h-[calc(100vh-100px)] max-w-[100px] overflow-y-auto"
      >
        <Navigation />
      </div>
      <Avatar />
    </div>
  )
}
