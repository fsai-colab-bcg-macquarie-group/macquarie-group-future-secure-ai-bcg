import { ArrowLeft, FolderOpen, Plus, Search } from 'lucide-react'
import { useNavigationContext } from '@contexts/context-navigation'
import AddUsers from './add-users/add-users'
import SearchUsers from './search-users/search-users'
import UseCaseTeams from './use-case-teams/use-case-teams'
import { usePermissions } from '@contexts/permissions-context'

export default function Users() {
  const { contextUsersActions, usersWatchers } = useNavigationContext()
  const { hasPermission } = usePermissions()
  const handleMouseDown = () => {
    setTimeout(() => {
      contextUsersActions.cToggleUsersOption()
      if (usersWatchers.cUsersIsOpen) {
        contextUsersActions.cToggleUsersOption()
      }
    }, 100)
  }

  return (
    <>
      {usersWatchers.cIsAddingUsers && <AddUsers />}
      {usersWatchers.cIsSearchingUsers && <SearchUsers />}
      {usersWatchers.cIsUseCaseTeamsOpen && <UseCaseTeams />}
      {!usersWatchers.cIsAddingUsers &&
        !usersWatchers.cIsSearchingUsers &&
        !usersWatchers.cIsUseCaseTeamsOpen && (
          <section className="anim_open_to_right flex h-full min-w-[206px] cursor-default flex-col items-center justify-center overflow-hidden border-r border-r-light800 bg-light100 px-5 py-6 shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
            <div className="flex h-full flex-col items-center justify-center transition-all duration-300">
              <button
                className="my-2 w-full min-w-[130px] flex-nowrap px-1 py-1"
                type="button"
                onMouseDown={handleMouseDown}
              >
                <ArrowLeft size={25} className="text-dark200 hover:text-dark600" />
              </button>
              <hr className="w-full border-neutral-200" />

              {hasPermission('user.get') && (
                <button
                  className="my-2 flex min-w-[100%] flex-nowrap items-center justify-start gap-2 px-1 py-[8px] hover:bg-gray000 duration-300"
                  type="button"
                  onMouseDown={() => contextUsersActions.cToggleSearchUsers()}
                >
                  <Search className="text-dark600 stroke-1" size={24} />
                  <p className="text-dark600 truncate font-sans text-[14px] font-normal">
                    Search Users
                  </p>
                </button>
              )}
              <hr className="w-full border-neutral-200" />

              {hasPermission('user.create') && (
                <button
                  className="my-2 flex w-full min-w-[130px] flex-nowrap items-center gap-2 px-1 py-1.5 hover:bg-gray000 duration-300"
                  type="button"
                  onMouseDown={() => contextUsersActions.cToggleAddingUsers()}
                >
                  <Plus className="text-dark600 stroke-1" size={25} />
                  <p className="text-dark600 truncate font-sans text-[14px] font-normal">
                    Add Users
                  </p>
                </button>
              )}

              <button
                className="flex w-full min-w-[130px] flex-nowrap items-center gap-2 px-1.5 py-2 hover:bg-gray000 duration-300"
                type="button"
                onMouseDown={() => contextUsersActions.cToggleUseCaseTeams()}
              >
                <FolderOpen className="text-dark600 stroke-1" size={23} />
                <p className="text-dark600 truncate font-sans text-[14px] font-normal">
                  Use Case Teams
                </p>
              </button>
            </div>
          </section>
        )}
    </>
  )
}


