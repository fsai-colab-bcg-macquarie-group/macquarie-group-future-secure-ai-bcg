'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import ToastOverlay from '@components/miscs/toast'

type ToastContextType = {
  toastActions: {
    showToast: (message: { title: string; description: string }) => void
    hideToast: () => void
  }
  toastState: {
    isVisible: boolean
    message: { title: string; description: string }
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState({
    title: '',
    description: '',
  })

  const showToast = (message: { title: string; description: string }) => {
    setMessage(message)
    setIsVisible(true)
  }

  const hideToast = () => {
    setIsVisible(false)
    setMessage({
      title: '',
      description: '',
    })
  }

  const toastActions = {
    showToast,
    hideToast,
  }

  const toastState = {
    isVisible,
    message,
  }

  return (
    <ToastContext.Provider value={{ toastActions, toastState }}>
      <ToastOverlay />
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
