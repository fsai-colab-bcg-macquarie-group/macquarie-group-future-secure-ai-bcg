import { useEffect, useMemo, useState } from 'react'
import { TValues } from './internal/types'

// ⚠️ To do: verify if this is necessary
import { usePermissions } from '@contexts/permissions-context'
// ⚠️

// Functions
import { BuildForm, GetUserProfile, UpdateUser } from './internal/functions'

// Components
import SecondaryBtn from '../../buttons/secondary-btn'
import PrimaryBtn from '../../buttons/primary-btn'
import FeedbackModal from '@ui/sidebar/nav/users/search-users/manage-user/feedback-modal'
import ConfirmOverlay from '@ui/sidebar/nav/users/search-users/manage-user/confirm-modal'
import ResetPasswordOverlay from '@ui/sidebar/nav/users/search-users/manage-user/overlay-subordinate-reset-password'
import ManageUserSkeleton from '@components/forms/edit-form/internal/skeleton'
import PrimaryInput from '../../inputs/primary-input'
import GeoFilterableDropdown from '../../dropdowns/dropdown-geo-filterable'
import AccessSelector from '../../dropdowns/access-selector/main'
import FilterableMultiSelectDropdown from '../../dropdowns/dropdown-filterable-multi-select'
import { dynamicButtons } from './internal/objects'
import Pencil from '@assets/svg/Pencil.svg'

// Values Hook
import { valuesHook } from './internal/values'
import Image from 'next/image'

// ====================================================================================================

export default function EditUserForm() {
  // ⚠️ Permissions Hook created by Samuel (To do: verify if this is necessary)
  const { hasPermission } = usePermissions()
  // ⚠️

  // Values Hook - This state values can changed on interactions
  const values = valuesHook()
  // Statics values obtained on build form
  const [statics, setStatics] = useState<TValues>()
  // Build the form instance
  const buildFormInstance = new BuildForm()

  // First render, build the form and call all necessary functions to render the form
  useEffect(() => {
    const onLoad = async () => {
      await buildFormInstance.build({
        loggedUser: values.loggedUser,
        managedUser: values.managedUser,
      })

      setStatics(buildFormInstance)
      values.formCallBacks.resetForm()
    }
    onLoad()
  }, [])

  // ====================================================================================================

  // Handlers

  // Rebuild the form
  const rebuildForm = async () => {
    // Reset all necessary states
    setStatics(undefined)

    const getProfileInstance = new GetUserProfile()
    const profile = await getProfileInstance.get(values.managedUser.email)

    if (!profile) return
    // Refresh the managed user context
    values.refreshManagedUserContext(profile)

    values.setMode('view')

    // Build the form instance again
    await buildFormInstance.build({
      loggedUser: values.loggedUser,
      managedUser: values.managedUser,
    })

    values.formCallBacks.resetForm()
    setStatics(buildFormInstance)
  }

  // Client Handlers to call classes functions
  const handleUpdateUser = async () => {
    // Adjust submitting state
    values.setIsSubmitting(true)
    const CreateUpdateInstance = new UpdateUser()
    await CreateUpdateInstance.update(values.formData)

    // If the user is updated successfully
    if (CreateUpdateInstance.success) {
      values.setMode('view')
      values.triggerToast.showToast({
        title: 'Success',
        description: 'User updated successfully',
      })

      // Rebuild the form instance
      rebuildForm()
      // Adjust submitting state
      values.setIsSubmitting(false)

      // If the user is not updated for some reason
    } else {
      values.triggerToast.showToast({
        title: 'Error',
        description: CreateUpdateInstance.error,
      })
      // Adjust submitting state
      values.setIsSubmitting(false)
    }
  }

  // ====================================================================================================

  // Callbacks

  // Callback handlers to Activate and Deactivate User within overlay
  const ActDeactCallbacks = {
    setFluxToEdit: () => values.setFlux('edit'),
    rebuildForm: () => rebuildForm(),
  }
  // ====================================================================================================

  // Dynamic Buttons for CTA differents combinations depending on the ManagedUser state
  const CTAButtons = useMemo(() => {
    if (!statics) return null

    return dynamicButtons(
      statics.loggedUser.profile.access_name,
      statics.managedUser,
      statics.loggedUser,
      values.setFlux,
    )
  }, [
    statics?.loggedUser?.profile?.access_name,
    statics?.managedUser,
    statics?.loggedUser,
    values.flux,
    values.setFlux,
  ])

  // ====================================================================================================

  // If the form is not built, show the skeleton
  if (!statics || !CTAButtons) return <ManageUserSkeleton />

  return (
    <div
      className={`relative flex h-full max-h-full flex-col ${
        values.isSubmitting && 'pointer-events-none opacity-70'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex max-h-fit min-h-fit items-center justify-between px-8 py-4">
          <section className="inline-flex max-w-[380px] items-center justify-between gap-3 truncate">
            {/* // TODO: Add ellipsis to the name */}
            <div className="bg-dark600 flex aspect-square w-[48px] items-center justify-center p-3 px-3.5 font-sans text-[16px] font-semibold text-white">
              {statics.managedUser?.firstName[0]}
              {statics.managedUser?.lastName[0]}
            </div>
            <div className="pt-[5px]">
              <h4 className="text-dark600 font-sans text-[16px] leading-4 font-semibold">
                {statics.managedUser?.firstName} {statics.managedUser?.lastName}
              </h4>
              <p className="text-[14px]">{statics.managedUserState}</p>
            </div>
          </section>
          {(statics.loggedUser.profile.access_name ===
            'Platform Administrator' ||
            statics.loggedUser.profile.access_name ===
              'Commercial Administrator') &&
            statics.managedUser?.email !== statics.loggedUser?.email && (
              <>
                {hasPermission('user.update') && values.mode === 'view' && (
                  <div
                    onClick={() => {
                      values.setMode('edit')
                    }}
                    className={`py-2 pl-2 hover:cursor-pointer ${
                      values.isSubmitting && 'pointer-events-none'
                    }`}
                  >
                    <Image
                      src={Pencil}
                      alt="Pencil"
                      width={26}
                      height={26}
                      className="hover:text-dark600 opacity-70 transition-all duration-300 hover:opacity-100"
                    />
                  </div>
                )}
              </>
            )}
        </div>

        <hr className="mx-8 border-neutral-200" />
        <div className={`flex h-full flex-1 flex-col overflow-hidden px-8`}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
            className={`${values.isSubmitting && 'pointer-events-none opacity-70'} h-full overflow-hidden overflow-x-hidden overflow-y-auto pt-10`}
          >
            <div className="flex h-full flex-col overflow-hidden overflow-x-hidden overflow-y-auto">
              <section className="flex flex-col gap-7">
                <PrimaryInput
                  placeholder="Email address or username"
                  type="email"
                  value={values.formData.email}
                  readOnly={
                    statics.disabledFields.email || values.mode === 'view'
                  }
                  disabled={
                    statics.disabledFields.email && values.mode !== 'view'
                  }
                  maxLength={60}
                />
                <PrimaryInput
                  placeholder="First Name"
                  type="text"
                  value={values.formData.firstName}
                  readOnly={
                    statics.disabledFields.firstName || values.mode === 'view'
                  }
                  disabled={
                    statics.disabledFields.firstName && values.mode !== 'view'
                  }
                  callback={values.formCallBacks.setFormFirstName}
                  maxLength={50}
                />
                <PrimaryInput
                  placeholder="Last Name"
                  type="text"
                  value={values.formData.lastName}
                  readOnly={
                    statics.disabledFields.lastName || values.mode === 'view'
                  }
                  disabled={
                    statics.disabledFields.lastName && values.mode !== 'view'
                  }
                  callback={values.formCallBacks.setFormLastName}
                  maxLength={50}
                />
                <div className="-mt-[10px]">
                  <GeoFilterableDropdown
                    placeholder="Location"
                    value={values.managedUser.location}
                    options={values.locations.map((location) => ({
                      id: location.id || '',
                      name: `${location.city}, ${location.state}, ${location.country}`,
                    }))}
                    callbacks={values.geoCallbacks}
                    readOnly={
                      statics.disabledFields.location || values.mode === 'view'
                    }
                    disabled={
                      statics.disabledFields.location && values.mode !== 'view'
                    }
                  />
                </div>
              </section>

              <section className="flex flex-col gap-8 py-10 pb-8">
                <AccessSelector
                  placeholder="Set Access"
                  options={statics.accessOptions}
                  callback={values.accessCallbacks}
                  value={values.formData.access.name}
                  disabled={
                    statics.disabledFields.access || values.mode === 'view'
                  }
                />

                {values.addingWorkerOrManager && (
                  <FilterableMultiSelectDropdown
                    placeholder="Assign Teams"
                    options={statics.useCaseTeamsOptions}
                    value={values.formData.useCaseTeams}
                    callback={values.formCallBacks.setFormUseCaseTeams}
                    maxTags={statics.maxTags}
                    disabled={
                      statics.disabledFields.useCaseTeams ||
                      values.mode === 'view'
                    }
                  />
                )}
              </section>
            </div>
          </form>
          <div className="pointer-events-none absolute bottom-[100px] z-50 h-10 w-[calc(100%-63px)] bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Botões de ação e Componentes de Fluxo*/}
        {/* Botões de ação e Componentes de Fluxo*/}
        {/* Botões de ação e Componentes de Fluxo*/}
        <div className="h-full max-h-[101px] px-7.5 py-7">
          {values.mode === 'view' ? (
            <div className="inline-flex w-full justify-end">
              {CTAButtons[statics.managedUserState]?.secondary.component}
              {CTAButtons[statics.managedUserState]?.primary.component}
            </div>
          ) : (
            <div className="inline-flex w-full justify-end">
              <div
                onClick={() => {
                  if (!values.isSubmitting) {
                    rebuildForm()
                  }
                }}
              >
                <SecondaryBtn text={'Cancel'} disabled={values.isSubmitting} />
              </div>
              <div
                onClick={() => {
                  !values.isSubmitting &&
                    values.formChanged() &&
                    values.isFormFilled() &&
                    handleUpdateUser()
                }}
              >
                <PrimaryBtn
                  text={values.isSubmitting ? 'Saving...' : 'Done'}
                  disabled={
                    values.isSubmitting ||
                    !values.formChanged() ||
                    !values.isFormFilled()
                  }
                  className="ml-4"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlays and Modals */}
      {/* Overlays and Modals */}
      {/* Overlays and Modals */}
      {values.flux === 'activate' && (
        <ConfirmOverlay
          model="activate"
          callback={ActDeactCallbacks}
          userId={statics.managedUser.id}
        />
      )}
      {values.flux === 'deactivate' && (
        <ConfirmOverlay
          model="deactivate"
          callback={ActDeactCallbacks}
          userId={statics.managedUser.id}
        />
      )}
      {values.flux === 'resendActivation' && (
        <FeedbackModal
          userId={statics.managedUser.id}
          email={statics.managedUser.email}
          callback={() => values.setFlux('edit')}
        />
      )}
      {values.flux === 'resetPassword' && (
        <ResetPasswordOverlay callback={() => values.setFlux('edit')} />
      )}
    </div>
  )
}
