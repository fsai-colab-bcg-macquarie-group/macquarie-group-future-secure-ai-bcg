'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { extractTokenInfo } from '../services/jwt-service'
import { getCookie } from '../services/cookie-service'

interface PermissionsContextType {
  permissions: string[]
  hasPermission: (permission: string) => boolean
}
const PermissionsContext = createContext<PermissionsContextType | null>(null)

export const PermissionsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [permissions, setPermissions] = useState<string[]>([])
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Get token from cookie
        const cookieToken = await getCookie('token')
        const tokenPayload = cookieToken
          ? await extractTokenInfo(cookieToken)
          : null
        if (tokenPayload) {
          // Assuming the permissions array is in decoded.user_permissions
          setPermissions(tokenPayload.user_permissions || [])
        }
      } catch (error) {
        console.error('Error processing token', error)
        setPermissions([])
      }
    }

    fetchPermissions()
  }, [])

  // Function to check if a permission exists
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export const usePermissions = () => {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}
