'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { redirect } from 'next/navigation'

import { useDataContext } from '@contexts/context-user-data'
import { TuserJwtData } from '@contexts/types'

import PrimaryBtn from '@components/buttons/primary-btn'
import FilterableDropdown from '@components/dropdowns/dropdown-filterable'

import { setCookie } from '@services/cookie-service'
import { getUserFromCookies } from '@services/user-service'

import LogoRow from '@assets/FSAI_Logo_Row.svg'

import Logo from '@assets/svg/fsai-logo-sidebar.svg'
import PartnerLogo from '../../assets/icons/partner-logo'

type UseCaseTeam = {
  name: string
  use_case_team_id: string
}

export default function ChooseTeam() {
  const { userContextActions } = useDataContext()

  const [selectedTeam, setSelectedTeam] = useState<UseCaseTeam | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useCaseTeams, setUseCaseTeams] = useState<
    {
      title: string
      description?: string
    }[]
  >([])

  const [userJwtData, setUserJwtData] = useState<TuserJwtData | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserFromCookies()
      setUserJwtData(data)
    }
    loadUserData()
  }, [])

  useEffect(() => {
    const verifyTeams = async () => {
      if (userJwtData?.use_case_teams?.length) {
        setUseCaseTeams(
          userJwtData.use_case_teams.map((team) => ({
            title: team.name,
          })),
        )

        if (userJwtData.use_case_teams.length <= 1) {
          const team = userJwtData.use_case_teams[0]
          await setCookie('selected_team_id', team.use_case_team_id)
          redirect('/')
        }
      } else if (userJwtData) {
        setSelectedTeam({ name: 'No teams found', use_case_team_id: '0' })
        await setCookie('selected_team_id', '0')
        redirect('/')
      }
    }

    if (userJwtData) {
      verifyTeams()
    }
  }, [userJwtData])

  const handleConfirm = async () => {
    setIsSubmitting(true)
    if (selectedTeam) {
      await setCookie('selected_team_id', selectedTeam.use_case_team_id)
      userContextActions.cUpdateSelectedTeam({
        name: selectedTeam.name,
        use_case_team_id: selectedTeam.use_case_team_id,
      })
    }
    redirect('/')
  }

  const handleSelectUseCaseTeam = (teamName: string) => {
    const team = userJwtData?.use_case_teams?.find(
      (team) => team.name === teamName,
    )

    setSelectedTeam(team || null)
  }

  return (
    <>
      {useCaseTeams.length > 1 ? (
        <div className="flex max-w-screen min-w-screen flex-col items-center justify-start pt-[20vh]">
          <section
            className={`shadow-primary flex flex-col gap-8 bg-white px-7 py-8 ${
              isSubmitting && 'pointer-events-none'
            }`}
          >
            <Image
              src={LogoRow}
              alt="icon"
              width={100}
              height={100}
              style={{ width: '100%', height: 'auto' }}
              className="max-w-[116px]"
            />

            <div className="w-full place-items-center">
              <PartnerLogo width={120} />
            </div>

            <FilterableDropdown
              placeholder="Select Use Case Team"
              options={useCaseTeams}
              callback={(teamName) => handleSelectUseCaseTeam(teamName)}
              disabled={false}
            />

            <div className="w-full place-items-center" onClick={handleConfirm}>
              <PrimaryBtn
                text={isSubmitting ? 'Processing...' : 'Continue'}
                disabled={!selectedTeam || isSubmitting}
                className="text-center!"
              />
            </div>
          </section>
        </div>
      ) : (
        <div className="flex h-screen w-screen items-center justify-center">
          <Image
            src={Logo}
            alt="icon"
            width={100}
            height={100}
            style={{ width: '100%', height: 'auto' }}
            className="max-w-[100px] animate-pulse"
          />
        </div>
      )}
    </>
  )
}
