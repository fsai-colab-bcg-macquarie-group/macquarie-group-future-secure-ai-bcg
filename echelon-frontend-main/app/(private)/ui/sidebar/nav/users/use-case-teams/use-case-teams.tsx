import { ArrowLeft, Plus, Search } from 'lucide-react'
import { useNavigationContext } from '@contexts/context-navigation'
import {
  getUseCaseTeamById,
  getUseCaseTeamsMembersCount,
} from '@services/user-query-service'
import { useEffect, useState } from 'react'
import { useDataContext } from '@contexts/context-user-data'
import { TmanagedUseCaseTeam } from '@contexts/types'
import { useToast } from '@contexts/context-toast'
import ManageUseCaseTeam from './manage-use-case-team/manage-use-case-team'
import AddUseCaseTeam from './add-use-case-team/add-use-case-team'
import UseCaseTeamsSkeleton from './skeleton'

type UseCaseTeam = {
  id: string
  name: string
  memberCount: number
}

export default function UseCaseTeams() {
  const { contextUsersActions, usersWatchers } = useNavigationContext()

  return (
    <div className="shadow-primary anim_open_to_right absolute top-[max(0px,calc(50vh-48vh))] left-4 flex h-[96vh] max-h-screen max-w-[80vw] cursor-default bg-white">
      <section className="border-r-light600 flex h-full min-w-[80px] flex-col items-center border-r">
        <button
          type="button"
          className="my-3 px-2 py-2"
          onClick={() => {
            if (usersWatchers.cIsAddUseCaseTeamOpen) {
              return contextUsersActions.cToggleAddUseCaseTeam()
            }
            if (usersWatchers.cIsUseCaseTeamManagementOpen) {
              return contextUsersActions.cToggleUseCaseTeamManagement()
            }
            if (usersWatchers.cIsUseCaseTeamsOpen) {
              return contextUsersActions.cToggleUseCaseTeams()
            }
          }}
        >
          <ArrowLeft className="text-dark200 hover:text-dark600" size={35} />
        </button>

        <hr className="mt-1 w-2/5 place-self-center border-neutral-200" />
      </section>

      {usersWatchers.cIsAddUseCaseTeamOpen ? (
        <AddUseCaseTeam />
      ) : usersWatchers.cIsUseCaseTeamManagementOpen ? (
        <ManageUseCaseTeam />
      ) : (
        <UseCaseTeamsWorkspace />
      )}

      {!usersWatchers.cIsUseCaseTeamManagementOpen &&
        !usersWatchers.cIsAddUseCaseTeamOpen && (
          <div className="pointer-events-none absolute top-[calc(100%-80px)] z-50 ml-[80px] h-20 w-[calc(100%-80px)] bg-gradient-to-t from-white to-transparent" />
        )}
    </div>
  )
}

function UseCaseTeamsWorkspace() {
  const { userContextActions, userContextWatchers } = useDataContext()
  const { contextUsersActions } = useNavigationContext()
  const { toastActions } = useToast()

  const [teams, setTeams] = useState<UseCaseTeam[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setFetching(true)
        await new Promise((resolve) => setTimeout(resolve, 2500))
        const { data } = (await getUseCaseTeamsMembersCount()) as {
          data: UseCaseTeam[]
        }

        setTeams(data)

        setFetching(false)
      } catch (error) {
        toastActions.showToast({
          title: 'Sorry, something went wrong',
          description: `Unable to load your team list. Please try again. \nMessage from server: ${error && error instanceof Error && error.message}`,
        })
      }
    }

    // For testing purposes
    setIsSearching(false)

    fetchTeams()
  }, [toastActions])

  const handleTeamClick = async (id: string) => {
    setIsLoading(true)
    const { data } = (await getUseCaseTeamById(id)) as {
      data: TmanagedUseCaseTeam
    }

    if (Array.isArray(data) && data?.length > 0) {
      userContextActions.cUpdateManagedUseCaseTeam(data[0])
    } else {
      userContextActions.cUpdateManagedUseCaseTeam(data)
    }

    setIsLoading(false)
    contextUsersActions.cToggleUseCaseTeamManagement()
  }

  if (fetching)
    return (
      <div className="flex h-full w-screen max-w-[80vw] items-start opacity-60">
        <span>
          <UseCaseTeamsSkeleton />
        </span>
      </div>
    )

  return (
    <>
      <div
        className={`flex h-full w-screen max-w-[80vw] flex-col items-start justify-start ${
          isLoading && 'pointer-events-none opacity-50'
        } ${isSearching && 'pointer-events-none opacity-50'}`}
      >
        <div className="flex h-fit flex-col items-start justify-center px-7 py-[23px]">
          <h1 className="text-dark600 font-sans text-[20px] font-semibold whitespace-nowrap">
            Use Case Teams
          </h1>
        </div>
        <hr className="mx-[26px] mt-1 w-[calc(100%-52px)] border-neutral-200" />

        <div className="mx-6.5 mt-[23px] min-w-[94.5%] pb-8">
          <section className="flex flex-col">
            <div
              className={`inline-flex max-w-[600px] min-w-fit items-center gap-3`}
            >
              <Search className="text-dark600 stroke-1 opacity-70" size={30} />
              <input
                className="placeholder:text-dark600 w-full py-6 text-[16px] placeholder:opacity-70"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isSearching}
                maxLength={50}
                // ref={inputRef}
              />
            </div>
            <hr className="w-full max-w-[600px] border-neutral-200" />
          </section>
        </div>

        <div className="mx-6.5 min-w-[94.5%] overflow-y-auto">
          <section className="flex flex-wrap gap-6 pb-8">
            {userContextWatchers.cUserData?.profile.access_name !==
              'Platform Administrator' && (
              <div
                className="border-fsai_Foreground_Default hover:bg-light600 inline-flex w-[253.33px] items-center gap-2 border border-dashed px-10 py-9 transition-all duration-300 hover:cursor-pointer"
                onClick={() => {
                  userContextActions.cUpdateManagedUseCaseTeam({
                    id: '',
                    name: '',
                    ownerId: '',
                    ownerFirstName: '',
                    ownerLastName: '',
                    members: [],
                  })
                  contextUsersActions.cToggleAddUseCaseTeam()
                }}
              >
                <Plus className="text-dark600 stroke-1" size={25} />
                <p className="truncate text-[14px]">Add Use Case Team</p>
              </div>
            )}

            {teams
              ?.filter((team) =>
                team.name.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((team) => (
                <div
                  key={team.id}
                  className="bg-light100 hover:bg-gray300 flex w-[253.33px] flex-col items-start py-4 transition-all duration-300 hover:cursor-pointer"
                  onClick={() => handleTeamClick(team.id)}
                >
                  <p className="text-dark600 mb-2 max-w-[255px] overflow-hidden px-4 text-[14px] text-ellipsis whitespace-nowrap">
                    {team.name}
                  </p>
                  <hr className="border-text-dark100 my-2 w-full" />
                  <p className="text-dark500 mt-1 overflow-hidden px-4 text-[12px] text-ellipsis whitespace-nowrap">
                    {team.memberCount}
                  </p>
                </div>
              ))}
          </section>
        </div>
      </div>
    </>
  )
}
