import {
  FormData,
  ReducerActions,
  TUser,
  TUseCaseTeam,
  TAccess,
  TLocation,
  TMode,
  TFlux,
} from './types'

import { useEffect, useReducer, useState } from 'react'

import { useNavigationContext } from '@contexts/context-navigation'
import { useDataContext } from '@contexts/context-user-data'
import { useToast } from '@contexts/context-toast'

import { searchLocationByTerm } from '@services/user-query-service'

import { arraysEqual, objectsEqual } from './helpers'

// ==================================================================================

export const valuesHook = () => {
  // User context data
  const { userContextWatchers, userContextActions } = useDataContext()
  const loggedUser = userContextWatchers.cUserData
  const managedUser = userContextWatchers.cManagedUser

  // Navigation context data
  const { contextUsersActions } = useNavigationContext()
  const { toastActions } = useToast()

  // Form interaction states
  const [mode, setMode] = useState<TMode>('view')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [addingWorkerOrManager, setAddingWorkerOrManager] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  // UI Flux Actions
  const [flux, setFlux] = useState<TFlux>('edit')

  // Values for custom components (Provisory)
  const [locations, setLocations] = useState<TLocation[]>([])

  // ===================================================================================

  // Form initial state
  const initialFormState: FormData = {
    id: managedUser.id,
    email: managedUser.email,
    firstName: managedUser.firstName,
    lastName: managedUser.lastName,
    locationId: managedUser.location.id,
    useCaseTeams: managedUser.useCaseTeams,
    access: managedUser.access,
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

  const refreshManagedUserContext = (managedUser: TUser) => {
    userContextActions.cUpdateManagedUser(managedUser)
  }

  // Callbacks
  const formCallBacks = {
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
      dispatch({ type: 'SET_FIELD', field: 'useCaseTeams', value })
    },
    resetForm: () => {
      dispatch({ type: 'RESET' })
    },
  }

  // Functions to fetch locations
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

  // Verify if the form has changed
  const formChanged = () => {
    if (mode != 'edit') return

    return (
      formData.firstName !== initialFormState.firstName ||
      formData.lastName !== initialFormState.lastName ||
      formData.email !== initialFormState.email ||
      formData.locationId !== initialFormState.locationId ||
      !objectsEqual(formData.access, initialFormState.access) ||
      !arraysEqual(formData.useCaseTeams, initialFormState.useCaseTeams)
    )
  }

  // Verify if the form is valid filled
  const isFormFilled = () => {
    return (
      formData.email.length > 0 &&
      formData.firstName.length > 0 &&
      formData.lastName.length > 0 &&
      ((addingWorkerOrManager && formData.useCaseTeams.length > 0) ||
        !addingWorkerOrManager) &&
      formData.access.id.length > 0
    )
  }

  // ===================================================================================

  //Actions

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

  // Values
  const values = {
    // States
    mode,
    setMode,
    isSubmitting,
    setIsSubmitting,
    isLoading,
    setIsLoading,
    addingWorkerOrManager,
    setAddingWorkerOrManager,
    resetKey,
    setResetKey,

    // Form
    formData,
    dispatch,
    locations,
    setLocations,

    // Callbacks
    formCallBacks,
    geoCallbacks,
    accessCallbacks,

    // Validations
    isFormFilled,
    formChanged,

    // Actions
    triggerToast,
    contextUsersActions,

    // User info
    managedUser,
    loggedUser,

    //UI
    flux,
    setFlux,

    // Handlers
    refreshManagedUserContext,
  }

  return values
}
