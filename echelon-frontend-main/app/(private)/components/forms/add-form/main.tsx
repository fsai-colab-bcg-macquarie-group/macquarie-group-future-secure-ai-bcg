import { useEffect, useState } from 'react'
import { formProps, TValues } from './internal/types'

// Functions
import { BuildForm, CreateUser } from './internal/functions'

// Components
import AddUsersFormSkeleton from './internal/skeleton'
import PrimaryInputEmailFilterable from '@components/inputs/primary-input-email-filterable/primary-input-email-filterable'
import PrimaryInput from '@components/inputs/primary-input'
import GeoFilterableDropdown from '@components/dropdowns/dropdown-geo-filterable'
import AccessSelector from '@/app/(private)/components/dropdowns/access-selector/main'
import FilterableMultiSelectDropdown from '@components/dropdowns/dropdown-filterable-multi-select'
import SecondaryBtn from '@components/buttons/secondary-btn'
import PrimaryBtn from '@components/buttons/primary-btn'
import AddUsersConfirmOverlay from '@ui/sidebar/nav/users/add-users/confirm-modal'

// Values Hook
import { valuesHook } from './internal/values'

// ==========================================================================================================================

export default function AddUserForm({ data, callbacks }: formProps) {
  // Values Hook
  const values = valuesHook()

  const [states, setStates] = useState<TValues>()

  // First render, build the form and call all necessary functions to render the form
  useEffect(() => {
    const onLoad = async () => {
      const buildFormInstance = new BuildForm()
      await buildFormInstance.build(values.userData)

      setStates(buildFormInstance)
    }
    onLoad()
  }, [])

  // ====================================================================================================

  // Handle to execute create user instance
  const handleCreateUser = async () => {
    // Adjust submitting state
    values.setIsSubmitting(true)
    const CreateUserInstance = new CreateUser()
    await CreateUserInstance.create(values.formData)

    // If the user is created successfully
    if (CreateUserInstance.success) {
      // Adjust submitting state
      values.setIsSubmitting(false)

      values.setOnSuccess(true)

      // If the user is not created for some reason
    } else {
      // Adjust submitting state
      values.setIsSubmitting(false)

      values.triggerToast.showToast({
        title: 'Error',
        description: CreateUserInstance.error,
      })
    }
  }

  // ====================================================================================================

  if (!states) return <AddUsersFormSkeleton />

  return (
    <div className="relative flex h-full flex-col px-8">
      <form
        onSubmit={(e) => e.preventDefault()}
        className={`${!states && 'pointer-events-none'} flex h-full flex-col`}
      >
        <div className="py-6">
          <h2 className="text-dark600 m-0 font-sans text-[20px] font-semibold">
            Add a new user account
          </h2>
          <p className="text-dark600 font-sans text-[16px] font-normal">
            Enter their details below to create an account
          </p>
        </div>

        <section className="flex h-full flex-1 flex-col overflow-hidden">
          <div className="-mt-1 h-full overflow-hidden overflow-x-hidden overflow-y-auto">
            <section className="flex flex-col gap-9">
              <div className="relative">
                <PrimaryInputEmailFilterable
                  placeholder="Email address or username"
                  options={[]}
                  callbacks={values.emailCallbacks}
                  value={values.formData.email}
                  disabled={values.isSubmitting || values.isLoading}
                  maxLength={50}
                />

                {!states.isADSearchEnabled && (
                  <section className="right-0 mt-6 flex flex-col gap-2">
                    <p className="text-gray1300 font-sans text-[14px] font-normal">
                      Account Type
                    </p>

                    <div>
                      <div className="flex flex-row gap-5">
                        <div
                          className="flex items-center gap-1 hover:cursor-pointer"
                          onClick={() => {
                            values.formCallBacks.setFormSSO(false)
                          }}
                        >
                          <div className="border-gray800 flex h-4.5 w-4.5 items-center justify-center border-[1.5px]">
                            <div
                              className={`${!values.formData.isSSO ? 'bg-gray800' : 'bg-white'} h-[10px] w-[10px] items-center justify-center`}
                            />
                          </div>
                          <span className="text-text_Normal pl-2 text-[14px] font-normal">
                            Non SSO
                          </span>
                        </div>

                        <div
                          className="flex items-center gap-1 pl-2 hover:cursor-pointer"
                          onClick={() => {
                            values.formCallBacks.setFormSSO(true)
                          }}
                        >
                          <div className="border-gray800 flex h-4.5 w-4.5 items-center justify-center border-[1.5px]">
                            <div
                              className={`${values.formData.isSSO ? 'bg-gray800' : 'bg-white'} flex h-[10px] w-[10px] items-center justify-center`}
                            />
                          </div>
                          <span className="text-text_Normal pl-2 text-[14px] font-normal">
                            SSO
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              <PrimaryInput
                placeholder="First Name"
                type="text"
                value={values.formData.firstName}
                callback={values.formCallBacks.setFormFirstName}
                readOnly={values.IsAddingSSO(states.isADSearchEnabled)}
                disabled={values.isSubmitting || values.isLoading}
                maxLength={50}
                onInput={(e) => {
                  values.formCallBacks.setFormFirstName(e.target.value)
                }}
                trim={false}
              />
              <PrimaryInput
                placeholder="Last Name"
                type="text"
                value={values.formData.lastName}
                callback={values.formCallBacks.setFormLastName}
                readOnly={values.IsAddingSSO(states.isADSearchEnabled)}
                disabled={values.isSubmitting || values.isLoading}
                onInput={(e) => {
                  values.formCallBacks.setFormLastName(e.target.value)
                }}
                maxLength={50}
                trim={false}
              />
              <div className="-mt-[10px]">
                <GeoFilterableDropdown
                  placeholder="Location"
                  options={values.locations.map((location) => ({
                    id: location.id || '',
                    name: `${location.city}, ${location.state}, ${location.country}`,
                  }))}
                  callbacks={values.geoCallbacks}
                  disabled={values.isSubmitting || values.isLoading}
                  maxLength={50}
                />
              </div>
            </section>

            <section className="flex flex-col gap-8 py-10 pb-8">
              <AccessSelector
                placeholder="Set Access"
                options={states.accessOptions}
                value={values.formData.access.name}
                callback={values.accessCallbacks}
                disabled={values.isSubmitting || values.isLoading}
              />

              {values.addingWorkerOrManager && (
                <div onClick={(e) => e.stopPropagation()}>
                  <FilterableMultiSelectDropdown
                    placeholder="Assign Use Case Team"
                    options={states.useCaseTeamsOptions}
                    callback={values.formCallBacks.setFormUseCaseTeams}
                    maxTags={states.maxTags}
                    value={values.formData.useCaseTeamIds}
                    disabled={values.isSubmitting || values.isLoading}
                  />
                </div>
              )}
            </section>
            <div className="pointer-events-none absolute bottom-[100px] z-50 h-10 w-[calc(100%-63px)] bg-gradient-to-t from-white to-transparent" />
          </div>
        </section>

        <div className="h-full max-h-[101px] py-7">
          <section className="inline-flex w-full justify-end">
            <div
              onClick={(e) => {
                e.preventDefault()
                values.UInavigation.cToggleAddingUsers()
                values.formCallBacks.resetForm()
              }}
            >
              <SecondaryBtn
                text={'Cancel'}
                disabled={values.isSubmitting || values.isLoading}
              />
            </div>
            <div onClick={handleCreateUser}>
              <PrimaryBtn
                text={values.isSubmitting ? 'Adding...' : 'Add User'}
                disabled={
                  !values.IsFormFilled() ||
                  values.isSubmitting ||
                  values.isLoading
                }
                className="ml-4"
              />
            </div>
          </section>
        </div>
      </form>

      {values.onSuccess && (
        <AddUsersConfirmOverlay
          setOnSuccess={values.setOnSuccess}
          email={values.formData.email}
          clearFormData={values.formCallBacks.resetForm}
        />
      )}
    </div>
  )
}
