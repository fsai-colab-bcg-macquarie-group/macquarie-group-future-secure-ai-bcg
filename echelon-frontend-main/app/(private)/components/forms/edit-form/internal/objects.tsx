import { TUser, TFlux, TUserJWT } from './types'
import SecondaryBtn from '../../../buttons/secondary-btn'
import PrimaryBtn from '../../../buttons/primary-btn'

export const dynamicButtons = (
  userAccess: TUserJWT['profile']['access_name'],
  managedUser: TUser,
  loggedUser: TUserJWT,
  setFlux: (flux: TFlux) => void,
) => {
  return {
    Activated: {
      primary: {
        component: (
          <div onClick={() => setFlux('deactivate')}>
            {userAccess === 'Platform Administrator' &&
              managedUser?.email !== loggedUser?.email && (
                <PrimaryBtn text={'Deactivate User'} />
              )}
          </div>
        ),
      },
      secondary: {
        component: (
          <div onClick={() => setFlux('resetPassword')}>
            {managedUser.provider !== 'SSO' && (
              <>
                {userAccess === 'Platform Administrator' &&
                  managedUser.email === loggedUser.email && (
                    <PrimaryBtn text={'Reset Password'} className="ml-4" />
                  )}

                {userAccess === 'Commercial Administrator' &&
                  managedUser.email === loggedUser.email && (
                    <PrimaryBtn text={'Reset Password'} className="ml-4" />
                  )}
              </>
            )}
          </div>
        ),
      },
    },
    Deactivated: {
      primary: {
        component: (
          <div onClick={() => setFlux('activate')}>
            {userAccess === 'Platform Administrator' &&
              managedUser?.email !== loggedUser?.email && (
                <PrimaryBtn text={'Activate User'} className="ml-4" />
              )}
          </div>
        ),
      },
      secondary: {
        component: null,
      },
    },
    'Pending Activation': {
      primary: {
        component: (
          <div onClick={() => setFlux('deactivate')}>
            {userAccess === 'Platform Administrator' &&
              managedUser.email !== loggedUser.email && (
                <PrimaryBtn text={'Deactivate User'} className="ml-4" />
              )}
          </div>
        ),
      },
      secondary: {
        component: (
          <div onClick={() => setFlux('resendActivation')}>
            {userAccess === 'Platform Administrator' &&
              managedUser.email !== loggedUser.email && (
                <SecondaryBtn text={'Resend Activation'} className="ml-4" />
              )}
          </div>
        ),
      },
    },
  }
}
