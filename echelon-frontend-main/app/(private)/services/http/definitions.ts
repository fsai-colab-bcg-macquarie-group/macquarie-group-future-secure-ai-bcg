export const API_ROUTES = {
  AUTH: {
    VERIFY_EMAIL: 'auth/verify-email',
    LOGIN: 'auth',
    REFRESH_TOKEN: 'auth/refresh-token',
    SSO_URL: 'auth/sso-url',
    LOG_SSO_LOGIN: 'auth/log-sso-login',
    RESET_PASSWORD_BY_EMAIL: 'auth/reset-password-by-email',
    RESET_PASSWORD: 'auth/reset-password',
    ACTIVE_EMAIL_SSO: 'auth/confirmation-email',
    SIGN_OUT: 'auth/sign-out',
    MFA_ENROLL: 'auth/mfa/enroll',
    MFA_VERIFY: 'auth/mfa/verify',
    MFA_UNENROLL: 'auth/mfa/unenroll',
    MFA_LIST: 'auth/mfa/list-factors',
    MFA_CHALLENGE_VERIFY: 'auth/mfa/challenge-verify',
    MFA_CHECK_AUTHENTICATOR_ASSURANCE_LEVEL:
      'auth/mfa/authenticator-assurance-level',
    MFA_VERIFY_CHALLENGE: 'auth/mfa/challenge',
    MFA_REMOVE_UNVERIFIED_FACTORS: 'auth/mfa/remove-unverified-factors',
  },
  LOGGER: {
    SSO_LOGIN: 'logger/login-sso',
  },
  USERS: {
    GET_PROFILE: 'users/profile',
    UPDATE_PROFILE: 'users/update-profile',
    UPDATE_PASSWORD: 'users/update-password',
    ADD_USER: 'users/',
    VIEW_USER_PROFILE: 'users/',
    ACCESS_USER: 'access/',
  },
  USER_QUERY: {
    SEARCH_LOCATION_BY_TERM: 'locations/search/',
    GET_PERMITTED_ACCESS: 'access/',
    GET_USE_CASE_TEAMS: 'use-case-teams/',
    GET_AD_USERS: 'directory/users',
    SEARCH_USERS_BY_TERM: 'users/search-user/',
    GET_USE_CASE_TEAMS_MEMBERS_COUNT: 'use-case-teams/members-count',
    GET_USE_CASE_TEAM_BY_ID: 'use-case-teams/',
    ADD_USE_CASE_TEAM: 'use-case-teams/',
    RESET_SUBORDINATE_PASSWORD: 'auth/subordinate-password-reset',
    RESEND_ACTIVATION: 'auth/send-link-activate-user',
    ACTIVATE_USER: 'users/activate',
    DEACTIVATE_USER: 'users/deactivate',
  },
  DEPARTMENTS: {
    GET_DEPARTMENTS: 'departments',
  },
  SEARCH: {
    SEARCH_USERS: 'users/search-user',
  },
  ENTERPRISE_DIRECTORY: {
    USERS: 'directory/users',
  },
  ROLES: {
    GET_ROLES_BY_USER: 'roles/available/for-user',
    GET_ROLE_PERMISSIONS: 'roles/role-permissions',
  },
  USE_CASE_TEAMS: {
    GET: 'use-case-teams',
    UPDATE: 'use-case-teams'
  },
} as const
