export enum FailureReasonType {
    EMAIL = 'incorrect email',
    LOCKED = 'account locked',
    PASSWORD = 'incorrect password',
}

export enum UserAccountStatus {
    LOCKED = 'locked',
    UNLOCKED = 'unlocked',
}

export enum ActionsType {
    LOGIN = 'login',
    LOGOUT = 'logout',
    FORGOT_PASSWORD = 'forgot_password',
    RESET_PASSWORD = 'reset_password',
    UPDATE_USER_PROFILE = 'update_user_profile',
    CREATE_USER = 'create_user',
    UPDATE_USER_PASSWORD = 'update_user_password',
    RESEND_ACTIVATION_LINK = 'resend_activation_link',
}

export enum StatusType {
    SUCCESS = 'success',
    FAILED = 'failed',
}

export enum InvitationType {
    ACTIVATED = 'activated',
    DEACTIVATED = 'deactivated',
    PENDING = 'pending',
}
