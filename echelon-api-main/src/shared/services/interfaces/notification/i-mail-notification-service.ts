import { ISendInviteUserSSO } from './i-send-invite-user-sso'

export interface IEMailNotificationService {
    sendPasswordResetConfirmation(email: string): Promise<void>
    sendInviteUserSSO({
        email,
        code,
        expiresAt,
    }: ISendInviteUserSSO): Promise<void>
}
