import Sidebar from '@ui/sidebar/sidebar'
import PageIframe from './(private)/components/container-page-iframe/container-page-iframe'
import { NavigationProvider } from '@contexts/context-navigation'
import { UserDataProvider } from '@contexts/context-user-data'

export default function Page() {
  return (
    <>
      <UserDataProvider>
        <NavigationProvider>
          <div className="min-w-[97px]">
            <Sidebar />
          </div>
          <PageIframe />
        </NavigationProvider>
      </UserDataProvider>
    </>
  )
}
