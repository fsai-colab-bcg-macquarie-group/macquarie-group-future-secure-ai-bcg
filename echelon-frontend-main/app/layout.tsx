import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@contexts/context-toast'
import { UserDataProvider } from '@contexts/context-user-data'

export const metadata: Metadata = {
  title: 'Echelon',
  description: 'Project Echelon',
}

export default function Layout({
  children,
  
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html>
      <body
        className={`flex h-screen max-h-screen min-w-screen flex-row overflow-hidden bg-background`}
      >
        <ToastProvider>
          <UserDataProvider>{children}</UserDataProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
