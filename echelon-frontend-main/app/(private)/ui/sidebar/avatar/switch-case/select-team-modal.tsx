import PrimaryBtn from '@components/buttons/primary-btn'
import SecondaryBtn from '@components/buttons/secondary-btn'
import FilterableDropdown from '@components/dropdowns/dropdown-filterable'
import { getUserFromCookies } from '@services/user-service'

import { setCookie } from '@services/cookie-service'
import { Loader, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDataContext } from '@/app/(private)/contexts/context-user-data'

type UseCaseTeam = {
  name: string
  use_case_team_id: string
}

export default function SwitchTeamConfirmOverlay({
  setIsSelected,
}: {
  setIsSelected: (isSelected: boolean) => void
}) {
  return (
    <div className="fixed top-0 left-0 z-[9000] flex min-h-screen min-w-screen place-items-center items-center justify-center border bg-light700">
      <ConfirmModal setIsSelected={setIsSelected} />
    </div>
  )
}

function ConfirmModal({
  setIsSelected,
}: {
  setIsSelected: (isSelected: boolean) => void
}) {
  const { userContextWatchers, userContextActions } = useDataContext()

  const [settingTeam, setSettingTeam] = useState(false)
  const [teams, setTeams] = useState<UseCaseTeam[]>([])
  const [selectedTeam, setSelectedTeam] = useState<UseCaseTeam | null>(
    userContextWatchers.cSelectedTeam || null,
  )

  useEffect(() => {
    const fetchTeams = async () => {
      const teams = await Promise.all(
        (await getUserFromCookies())?.use_case_teams?.map(
          (team: UseCaseTeam) => {
            return team
          },
        ),
      )

      setTeams(teams)
    }
    fetchTeams()
  }, [])

  const handleConfirm = async () => {
    if (settingTeam) return
    setSettingTeam(true)
    if (selectedTeam) {
      await setCookie('selected_team_id', selectedTeam.use_case_team_id)
      userContextActions.cUpdateSelectedTeam({
        name: selectedTeam.name,
        use_case_team_id: selectedTeam.use_case_team_id,
      })
      setIsSelected(false)
    }
  }

  if (!teams.length)
    return (
      <div className="anim_reveal_to_bottom relative z-30 flex w-[580px] items-center justify-center bg-white px-6 py-16">
        <Loader className="animate-spin" size={28} />
      </div>
    )

  return (
    <div className="anim_reveal_to_bottom relative z-30 w-[580px] bg-white p-6 pt-8">
      <button
        className="absolute top-3 right-3"
        type="button"
        onClick={() => {
          if (settingTeam) return
          setIsSelected(false)
        }}
      >
        <X className="stroke-1 text-fsai_Foreground" size={28} />
      </button>
      <section className="pb-8">
        <h4 className="my-2 mb-7 font-sans text-xl font-medium">
          Switch Use Case Team
        </h4>
        <FilterableDropdown
          placeholder="Select Use Case Team"
          options={teams.map((team) => ({
            title: team.name,
          }))}
          callback={(teamName) => {
            const team = teams.find((team) => team.name === teamName)
            setSelectedTeam(team || null)
          }}
          disabled={settingTeam}
          value={selectedTeam?.name}
        />
      </section>
      <section className="flex gap-4">
        <div onClick={() => setIsSelected(false)}>
          <SecondaryBtn text="Cancel" disabled={settingTeam} />
        </div>
        <div onClick={() => handleConfirm()}>
          <PrimaryBtn
            text={settingTeam ? 'Setting team...' : 'Continue'}
            disabled={settingTeam || !selectedTeam}
          />
        </div>
      </section>
    </div>
  )
}
