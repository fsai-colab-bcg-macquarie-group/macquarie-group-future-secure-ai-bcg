import { useState, useReducer, useEffect } from 'react'
import {
  FormData,
  ReducerActions,
  TAccess,
  TUseCaseTeam,
  TUser,
  TLocation,
} from './types'

import { useNavigationContext } from '@contexts/context-navigation'
import { useDataContext } from '@contexts/context-user-data'
import { useToast } from '@contexts/context-toast'

import { searchLocationByTerm } from '@services/user-query-service'

// ===================================================================================

export const valuesHook = () => {
  // User context data
  const { userContextWatchers, userContextActions } = useDataContext()
  const userData = userContextWatchers.cUserData
  const LoggedUserAccess = userData.profile.access_name

  // Navigation context data
  const { contextUsersActions } = useNavigationContext()
  const { toastActions } = useToast()

  // Form interaction states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [addingWorkerOrManager, setAddingWorkerOrManager] = useState(false)
  const [onSuccess, setOnSuccess] = useState(false)

  // Values for custom components (Provisory)
  const [locations, setLocations] = useState<TLocation[]>([])

  // ===================================================================================

  // Form initial state
  const initialFormState: FormData = {
    email: '',
    firstName: '',
    lastName: '',
    locationId: null,
    useCaseTeamIds: [],
    access: { name: '', id: '' },
    isSSO: false,
  }

  // Form reducer
  function formReducer(state: FormData, action: ReducerActions): FormData {
    switch (action.type) {
      case 'SET_FIELD':
        return { ...state, [action.field]: action.value }
      case 'SET_MULTIPLE_FIELDS':
        return { ...state, ...action.fields }
      case 'RESET':
        return initialFormState
      default:
        return state
    }
  }

  // Form data
  const [formData, dispatch] = useReducer(formReducer, initialFormState)

  // ===================================================================================

  // Handlers

  // Handle to open user account component
  const handleOpenUserAccount = async (email: string) => {
    const GetUserProfileInstance = new GetUserProfile()
    const userProfile = await GetUserProfileInstance.get(email)

    if (!userProfile) {
      return
    }

    try {
      userContextActions.cUpdateManagedUser(userProfile)
      contextUsersActions.cToggleAddingUsers()
      contextUsersActions.cToggleSearchUsers()
      contextUsersActions.cToggleUserAccount()
    } catch {
      toastActions.showToast({
        title: 'Something went wrong',
        description: 'User not found or unauthorized',
      })
    }
  }

  // Callbacks
  const formCallBacks = {
    setFormEmail: (value: TUser['email']) => {
      dispatch({ type: 'SET_FIELD', field: 'email', value })
    },
    setFormFirstName: (value: TUser['firstName']) => {
      dispatch({ type: 'SET_FIELD', field: 'firstName', value })
    },
    setFormLastName: (value: TUser['lastName']) => {
      dispatch({ type: 'SET_FIELD', field: 'lastName', value })
    },
    setFormLocation: (value: TLocation['id']) => {
      dispatch({ type: 'SET_FIELD', field: 'locationId', value })
    },
    setFormAccess: (value: TAccess) => {
      dispatch({ type: 'SET_FIELD', field: 'access', value })
    },
    setFormUseCaseTeams: (value: TUseCaseTeam[]) => {
      const idsArray = value.map((option) => option.id)
      dispatch({ type: 'SET_FIELD', field: 'useCaseTeamIds', value: idsArray })
    },
    setFormSSO: (value: boolean | null) => {
      dispatch({ type: 'SET_FIELD', field: 'isSSO', value })
    },
    resetForm: () => {
      dispatch({ type: 'RESET' })
    },
  }

  const emailCallbacks = {
    setFormEmail: formCallBacks.setFormEmail,
    setFormFirstName: formCallBacks.setFormFirstName,
    setFormLastName: formCallBacks.setFormLastName,
    setFormIsSSO: formCallBacks.setFormSSO,
    openManageUserAccount: (email: string) => handleOpenUserAccount(email),
  }

  // Fetch locations
  const fetchLocations = async (term: string) => {
    const locations = await searchLocationByTerm(term)
    setLocations(locations.data)
  }

  const geoCallbacks = {
    fetchLocations,
    setFormLocation: formCallBacks.setFormLocation,
  }

  const accessCallbacks = {
    setFormAccess: formCallBacks.setFormAccess,
  }

  // ===================================================================================

  // Validations
  const IsFormFilled = () => {
    return (
      formData.email.length > 0 &&
      formData.firstName.length > 0 &&
      formData.lastName.length > 0 &&
      ((addingWorkerOrManager && formData.useCaseTeamIds.length > 0) ||
        !addingWorkerOrManager) &&
      formData.access.id.length > 0 &&
      formData.isSSO !== null
    )
  }

  const IsAddingSSO = (searchAD: boolean) => {
    return formData.isSSO && searchAD
  }

  // ===================================================================================

  // Toast actions
  const triggerToast = {
    showToast: ({
      title,
      description,
    }: {
      title: string
      description: string
    }) => {
      toastActions.showToast({ title, description })
    },
  }

  // Interface navigation actions
  const UInavigation = {
    cToggleAddingUsers: () => {
      contextUsersActions.cToggleAddingUsers()
    },
  }

  // ===================================================================================

  // Effects

  // Watch changes in access.name and update addingWorkerOrManager state
  useEffect(() => {
    const isWorkerOrManager =
      formData.access.name === 'AI Worker Designer' ||
      formData.access.name === 'AI Worker Manager'

    setAddingWorkerOrManager(isWorkerOrManager)
  }, [formData.access.name])

  // ===================================================================================

  const values = {
    // States
    isSubmitting,
    setIsSubmitting,
    isLoading,
    setIsLoading,
    addingWorkerOrManager,
    setAddingWorkerOrManager,
    onSuccess,
    setOnSuccess,

    // Form
    formData,
    dispatch,
    locations,
    setLocations,

    // Callbacks
    formCallBacks,
    emailCallbacks,
    geoCallbacks,
    accessCallbacks,

    // Validations
    IsFormFilled,
    IsAddingSSO,

    // Actions
    triggerToast,
    UInavigation,

    // User info
    userData,
    LoggedUserAccess,
  }

  return values
}
