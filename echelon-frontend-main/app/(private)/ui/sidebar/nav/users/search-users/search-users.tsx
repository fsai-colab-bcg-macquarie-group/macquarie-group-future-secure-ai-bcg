import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { useNavigationContext } from '@contexts/context-navigation'
import { searchUserByTerm } from '@services/user-query-service'
import { getUser } from '@services/user-service'
import { useDataContext } from '@contexts/context-user-data'
import SearchUsersSkeleton from './skeleton'
import { Response } from '@services/http/types'
import { User } from '@definitions/user-definitions'
import { formatInput } from './helper'
import { useToast } from '@contexts/context-toast'
import EditUserForm from '@components/forms/edit-form/main'

type ResponseSearchUsers = {
  userId: User['id']
  firstName: User['firstName']
  lastName: User['lastName']
  email: User['email']
}

export default function SearchUsers() {
  const { contextUsersActions, usersWatchers } = useNavigationContext()

  return (
    <div className="shadow-primary anim_open_to_right absolute top-[max(0px,calc(50vh-392px))] left-4 mt-3 flex h-[784px] max-h-[93.5vh] cursor-default bg-white transition-[width] duration-300">
      <section className="border-r-light600 flex h-full min-w-[80px] flex-col items-center border-r">
        <button
          type="button"
          className="my-3 px-2 py-2"
          onClick={() => {
            if (usersWatchers.cIsUserAccountOpen)
              return contextUsersActions.cToggleUserAccount()
            contextUsersActions.cToggleSearchUsers()
          }}
        >
          <ArrowLeft className="text-dark200 hover:text-dark600" size={35} />
        </button>

        <hr className="mt-1 w-2/5 place-self-center border-neutral-200" />
      </section>
      {usersWatchers.cIsUserAccountOpen ? (
        <EditUserForm />
      ) : (
        <SearchUsersForm />
      )}
      {!usersWatchers.cIsUserAccountOpen && (
        <div className="pointer-events-none absolute top-[calc(100%-80px)] z-50 ml-[80px] h-20 w-[calc(100%-80px)] bg-gradient-to-t from-white to-transparent" />
      )}
    </div>
  )
}

function SearchUsersForm() {
  const { contextUsersActions } = useNavigationContext()
  const { userContextActions } = useDataContext()
  const { toastActions } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<ResponseSearchUsers[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [blockEvents, setBlockEvents] = useState(false)
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1200)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUserAccount = async (id: User['id']) => {
    setBlockEvents(true)
    const user = await getUser(id)
    if (user) {
      userContextActions.cUpdateManagedUser(user)

      // Simulated delay to not be too fast
      setTimeout(() => {
        contextUsersActions.cToggleUserAccount()
        setBlockEvents(false)
      }, 1000)
    } else {
      setBlockEvents(false)
      toastActions.showToast({
        title: 'Error on Load User',
        description: "Sorry, we couldn't load this user.Please try again",
      })
    }
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [results])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearch = async (term: string): Promise<ResponseSearchUsers[]> => {
    const formattedTerm = await formatInput(term)

    if (!formattedTerm.trim()) return []

    try {
      const response = (await searchUserByTerm(formattedTerm)) as Response<
        ResponseSearchUsers[]
      >
      return response.data || []
    } catch (error) {
      console.error('Error on searchUserByTerm:', error)
      return []
    }
  }

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchTerm) {
        setIsSearching(true)
        setBlockEvents(true)
        const data = await handleSearch(debouncedSearchTerm)
        setTimeout(() => {
          setIsSearching(false)
          setResults(data)
          setBlockEvents(false)
        }, 1000)
      }
    }

    if (debouncedSearchTerm) {
      fetchResults()
    } else {
      setResults([])
    }
  }, [debouncedSearchTerm])

  return (
    <div className="cursor-default overflow-auto px-8">
      <form onSubmit={(e) => e.preventDefault()}>
        <div
          className={`inline-flex w-full items-center gap-3 ${blockEvents && 'pointer-events-none opacity-50'}`}
        >
          <Search className="text-dark600 stroke-1 opacity-70" size={30} />
          <input
            className="py-7 text-[16px]"
            value={searchTerm}
            onChange={handleChange}
            disabled={isSearching || blockEvents}
            ref={inputRef}
            maxLength={50}
          />
        </div>
        <hr className="w-full border-neutral-200" />

        <div>
          <ul
            className={`flex flex-col gap-3 py-7 ${blockEvents && 'pointer-events-none opacity-50'}`}
          >
            {isSearching ? (
              <SearchUsersSkeleton />
            ) : results?.length > 0 ? (
              results.map((item: ResponseSearchUsers, index: number) => (
                <li
                  key={index}
                  className="hover:bg-light600 flex items-center gap-3 hover:cursor-pointer"
                  onClick={() => {
                    handleUserAccount(item.userId)
                  }}
                >
                  <div className="bg-dark600 flex aspect-square w-[48px] items-center justify-center p-3 px-3.5 text-[16px] font-[500] text-white!">
                    {item.firstName[0]}
                    {item.lastName[0]}
                  </div>
                  <div className="pt-[3px] pr-4">
                    <h4 className="text-[16px] leading-4">
                      {item.firstName} {item.lastName}
                    </h4>
                    <p className="truncate text-[14px]">{item.email}</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="flex h-full items-center justify-center gap-3">
                <p className="text-[16px]">No results found</p>
              </li>
            )}
          </ul>
        </div>
      </form>
    </div>
  )
}
