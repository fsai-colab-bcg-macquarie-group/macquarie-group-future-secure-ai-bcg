import { useState, useEffect } from 'react'
import Pencil from '@/app/(private)/assets/svg/Pencil.svg'

import PrimaryBtn from '@components/buttons/primary-btn'
import SecondaryBtn from '@components/buttons/secondary-btn'
import PrimaryInput from '@components/inputs/primary-input'

import { useDataContext } from '@contexts/context-user-data'
import { useNavigationContext } from '@contexts/context-navigation'
import { useToast } from '@contexts/context-toast'
import { TmanagedUseCaseTeam, TProfile } from '@contexts/types'

import { updateUseCaseTeam } from '@services/use-case-teams-service'
import { UseCaseTeamDTO } from './types'
import Image from 'next/image'
// ==================================================================

export default function ManageUseCaseTeam() {
  const { userContextWatchers, userContextActions } = useDataContext()
  const { contextUsersActions } = useNavigationContext()
  const { toastActions } = useToast()

  const [team, setTeam] = useState<TmanagedUseCaseTeam | null>(null)
  const [profile, setProfile] = useState<TProfile | {}>({})
  const [editMode, setEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
  })

  // ✅ Fix for btn done to be active only after some change ✅  ===================
  const [initialFormData, setInitialFormData] = useState({
    name: '',
    owner: '',
  })
  const [hasChanged, setHasChanged] = useState(false)

  const loadInitialFormData = () => {
    if (!userContextWatchers.cManagedUseCaseTeam) return
    const uctData = {
      name: userContextWatchers?.cManagedUseCaseTeam?.name || '',
      owner: `${userContextWatchers?.cManagedUseCaseTeam?.ownerFirstName} ${userContextWatchers?.cManagedUseCaseTeam?.ownerLastName}`,
    }
    setInitialFormData(uctData)
    setFormData(uctData)
  }

  useEffect(() => {
    loadInitialFormData()
  }, [])

  useEffect(() => {
    if (initialFormData.name !== formData.name) return setHasChanged(true)
    if (initialFormData.name === formData.name) return setHasChanged(false)
  }, [formData])
  // ====================================================================================

  const allowedProfiles = ['Commercial Administrator', 'Platform Administrator']

  useEffect(() => {
    setTeam(userContextWatchers.cManagedUseCaseTeam)
    setProfile(userContextWatchers.cUserData?.profile as TProfile)
  }, [])

  if (!team) {
    return (
      <div className="flex h-full w-screen max-w-[80vw] flex-col items-center justify-center">
        <p>No use case team selected</p>
      </div>
    )
  }

  // Separate members by access type
  const managerMembers = team.members.filter(
    (member) => member.accessName === 'AI Worker Manager',
  )

  const designerMembers = team.members.filter(
    (member) => member.accessName === 'AI Worker Designer',
  )

  // render members
  // If the member doesn't have a name, render only the email
  const renderMember = (member: TmanagedUseCaseTeam['members'][0]) => (
    <li key={member.userId} className="flex items-center gap-3">
      <div className="bg-dark600 flex aspect-square w-[48px] items-center justify-center p-3 px-3.5 text-[16px] font-[600] text-white">
        {member.firstName[0]}
        {member.lastName[0]}
      </div>
      <div className="pt-[3px] pr-4">
        <h4 className="text-[16px] leading-4">
          {member.firstName} {member.lastName}
        </h4>
        <p className="truncate text-[14px]">{member.email}</p>
      </div>
    </li>
  )

  const onSubmit = async () => {
    setIsLoading(true)

    try {
      const body = createRequestBody()
      const updatedUseCaseTeam = await updateUseCaseTeam(body)

      if (updatedUseCaseTeam.success) {
        handleSuccess()
      } else {
        handleError()
      }
    } catch (error) {
      console.error('Error updating use case team:', error)
      handleError()
    } finally {
      setIsLoading(false)
    }
  }

  const createRequestBody = (): UseCaseTeamDTO => ({
    id: team.id,
    ownerId: team.ownerId,
    name: formData.name,
  })

  const handleSuccess = () => {
    userContextActions.cUpdateManagedUseCaseTeam({
      ...userContextWatchers.cManagedUseCaseTeam,
      name: formData.name,
    } as TmanagedUseCaseTeam)

    setTeam({
      ...userContextWatchers.cManagedUseCaseTeam,
      name: formData.name,
    } as TmanagedUseCaseTeam)

    toastActions.showToast({
      title: 'Success',
      description: 'Use case team updated successfully',
    })

    setEditMode(!editMode)
  }

  const handleError = () => {
    toastActions.showToast({
      title: 'Error',
      description: 'Failed to update use case team',
    })
  }

  const resetFormData = () => {
    setFormData({
      name: userContextWatchers?.cManagedUseCaseTeam?.name || '',
      owner: `${userContextWatchers?.cManagedUseCaseTeam?.ownerFirstName} ${userContextWatchers?.cManagedUseCaseTeam?.ownerLastName}`,
    })
  }

  const validateProfileHasUseCaseTeam = () => {
    if (
      'access_name' in profile &&
      allowedProfiles.includes(profile.access_name)
    ) {
      return true
    }
    return false
  }

  return (
    <>
      {team && (
        <div
          className={`flex h-full w-screen max-w-[80vw] flex-col items-start justify-start overflow-y-auto`}
        >
          <div className="inline-flex h-fit w-full items-center justify-between px-7 py-[23px]">
            <h1 className="text-dark600 text-[20px] font-bold whitespace-nowrap">
              {team.name}
            </h1>
            {!editMode && validateProfileHasUseCaseTeam() && (
              <button type="button" onClick={() => setEditMode(!editMode)}>
                <Image
                  src={Pencil}
                  alt="Pencil"
                  width={26}
                  height={26}
                  className="hover:text-dark600 opacity-70 transition-all duration-300 hover:opacity-100"
                />
              </button>
            )}
          </div>
          <hr className="mx-[26px] mt-1 w-[calc(100%-52px)] border-neutral-200" />
          <div className="mx-6.5 mt-[23px] max-h-[700px] max-w-[90%] min-w-[95%]">
            <section className="flex max-h-[100%] min-w-full flex-row py-8">
              <div className="min-w-1/2">
                <section className="space-y-8">
                  <p className="text-[16px] font-normal">Details</p>
                  <div className="flex flex-col gap-8">
                    <PrimaryInput
                      placeholder="Use Case Team Name"
                      disabled={!editMode}
                      value={formData.name}
                      maxLength={50}
                      callback={(value) => {
                        setFormData({ ...formData, name: value })
                      }}
                    />
                    <PrimaryInput
                      placeholder="Owner"
                      readOnly={true}
                      value={`${team.ownerFirstName} ${team.ownerLastName}`}
                      maxLength={50}
                    />
                  </div>
                </section>
              </div>
              <div className="relative flex max-h-[80vh] min-w-1/2 flex-col gap-4">
                <p className="text-[16px] font-normal">Members</p>
                <div className="max-h-[calc(70vh-80px)] overflow-y-auto">
                  <section className="relative pb-4">
                    <div className="flex flex-col gap-8">
                      {/* AI Worker Managers section */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-row items-center gap-4">
                          <h3 className="text-dark300 text-[15px] font-[500] whitespace-nowrap">
                            AI Worker Manager
                          </h3>
                          <hr className="w-full border-neutral-200" />
                        </div>
                        <div className="flex flex-col gap-4">
                          {managerMembers.length > 0 ? (
                            managerMembers.map(renderMember)
                          ) : (
                            <p className="text-dark200 text-[14px] italic">
                              No managers found
                            </p>
                          )}
                        </div>
                      </div>

                      {/* AI Worker Designers section */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-row items-center gap-4">
                          <h3 className="text-dark300 text-[15px] font-[500] whitespace-nowrap">
                            AI Worker Designer
                          </h3>
                          <hr className="w-full border-neutral-200" />
                        </div>
                        <div className="flex flex-col gap-4">
                          {designerMembers.length > 0 ? (
                            designerMembers.map(renderMember)
                          ) : (
                            <p className="text-dark200 text-[14px] italic">
                              No designers found
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 h-10 w-full bg-gradient-to-t from-white to-transparent" />
                  </section>
                </div>
              </div>
              <div className="absolute right-8 bottom-8 left-0 inline-flex justify-end gap-2">
                {editMode && (
                  <div
                    onClick={() => {
                      setEditMode(!editMode)
                      resetFormData()
                    }}
                  >
                    <SecondaryBtn text="Cancel" />
                  </div>
                )}
                <div
                  onClick={() => {
                    editMode && validateProfileHasUseCaseTeam()
                      ? onSubmit()
                      : contextUsersActions.cToggleUseCaseTeamManagement()
                  }}
                >
                  <PrimaryBtn
                    text={editMode ? 'Done' : 'Close'}
                    disabled={isLoading || (editMode && !hasChanged)}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  )
}
