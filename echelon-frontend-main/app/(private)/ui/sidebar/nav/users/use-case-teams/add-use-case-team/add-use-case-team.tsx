import { useEffect, useReducer, useState } from 'react'
import PrimaryBtn from '@/app/(private)/components/buttons/primary-btn'
import SecondaryBtn from '@/app/(private)/components/buttons/secondary-btn'
import PrimaryInput from '@/app/(private)/components/inputs/primary-input'
// import AddUsersConfirmOverlay from './confirm-modal' 
import { useNavigationContext } from '@/app/(private)/contexts/context-navigation'
import { useDataContext } from '@/app/(private)/contexts/context-user-data'
import { useToast } from '@contexts/context-toast'
import { addUseCaseTeam } from '@services/user-query-service'
import { Loader } from 'lucide-react'
import AddTeamConfirmOverlay from './confirm-modal'

// Define a new type for the use case team form
type UseCaseTeamFormDataType = {
  owner: string
  useCaseTeamName: string
}

// Define the initial state
const initialFormState: UseCaseTeamFormDataType = {
  owner: '',
  useCaseTeamName: '',
}

// Define the action type
type FormAction = {
  type: 'SET_FIELD'
  field: keyof UseCaseTeamFormDataType
  value: string
}

// Define the reducer
function formReducer(
  state: UseCaseTeamFormDataType,
  action: FormAction,
): UseCaseTeamFormDataType {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    default:
      return state
  }
}

export default function AddUsersForm() {
  const { toastActions } = useToast()
  const { userContextWatchers } = useDataContext()
  const { contextUsersActions } = useNavigationContext()
  const [onSuccess, setOnSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, dispatch] = useReducer(formReducer, initialFormState)

  useEffect(() => {
    if (userData) {
      dispatch({
        type: 'SET_FIELD',
        field: 'owner',
        value: `${userData?.profile.first_name} ${userData?.profile.last_name}`,
      })
    }
  }, [])

  // ************** Handle Create User **************
  const handleCreateUseCaseTeam = async () => {
    setIsSubmitting(true)

    // Ensure ownerId is not undefined
    if (!userData?.profile.access_id) {
      toastActions.showToast({
        title: 'Owner not found',
        description: 'Unable to add use case team',
      })
      setIsSubmitting(false)
      return
    }

    const formDataToSubmit = {
      ownerId: userData.user_id,
      name: formData.useCaseTeamName
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      description: 'description is not required',
    }
    const response = await addUseCaseTeam(formDataToSubmit)
    console.log('response', response)
    
    setIsSubmitting(false)

    if (response?.success) {
      return setOnSuccess(true)
    }

    toastActions.showToast({
      title: 'Error',
      description: 'An error occurred while creating the team.',
    })
  }

  // ************** Form Callbacks **************
  const formCallBacks = {
    setFormUseCaseTeamName: (value: string) => {
      dispatch({ type: 'SET_FIELD', field: 'useCaseTeamName', value })
    },
  }

  //validate FormData
  const validateFormData = () => {
    return formData.useCaseTeamName.length > 0
  }

  // ************** User Data **************
  const userData = userContextWatchers.cUserData
  //   const userIsDesignerOrManager =
  //     userData?.profile.access_name != 'AI Worker Designer' &&
  //     userData?.profile.access_name != 'AI Worker Manager'

  if (formData.owner.length < 1) {
    return (
      <div className="flex h-full w-screen max-w-[80vw] flex-col items-center justify-center opacity-60">
        <span>
          <Loader className="animate-spin text-fsai_Foreground_Default" size={38} />
        </span>
      </div>
    )
  }

  return (
    <div className="w-[111%] overflow-auto px-8">
      <form>
        <div className="mb-3 py-6">
          <h2 className="m-0 text-[20px] font-[600]">
            Add a new Use Case Team
          </h2>
          <p className="text-[16px] font-[400] text-gray1500">
            Enter User Case Team details below
          </p>
        </div>

        <div>
          <section className="flex flex-col gap-9">
            <PrimaryInput
              placeholder="Owner"
              value={`${formData.owner}`}
              readOnly={true}
            />
            <PrimaryInput
              placeholder="Use Case Team Name"
              type="text"
              callback={formCallBacks.setFormUseCaseTeamName}
              disabled={isSubmitting}
              maxLength={50}
              trim={false}
            />
          </section>
        </div>

        <div className="absolute right-6.5 bottom-0 mb-3 inline-flex w-full justify-end gap-4 py-4">
          <div onClick={() => contextUsersActions.cToggleAddUseCaseTeam()}>
            <SecondaryBtn text={'Cancel'} disabled={isSubmitting} />
          </div>
          <div onClick={handleCreateUseCaseTeam}>
            <PrimaryBtn
              text={isSubmitting ? 'Adding...' : 'Add use Case Team'}
              disabled={!validateFormData() || isSubmitting}
            />
          </div>
        </div>
      </form>

      {onSuccess && (
        <AddTeamConfirmOverlay
          //   setOnSuccess={setOnSuccess}
          email={formData.useCaseTeamName}
          finish={() => contextUsersActions.cToggleAddUseCaseTeam()}
        />
      )}
    </div>
  )
}
