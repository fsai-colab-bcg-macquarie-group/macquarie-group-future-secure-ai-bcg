import { Inject, Injectable } from '@nestjs/common'
import {
    IEMailNotificationService,
    IMailProvider,
    ITemplateService,
} from '../interfaces/notification'
import { env } from 'src/config/env'
import { formatRemainingTime } from 'src/utils'
import { ISendInviteUserSSO } from '../interfaces/notification/i-send-invite-user-sso'
import path from 'path'
import fs from 'fs'

@Injectable()
export class EmailNotificationService implements IEMailNotificationService {
    constructor(
        @Inject('IMailProvider')
        private readonly emailProvider: IMailProvider,
        @Inject('ITemplateService')
        private readonly templateService: ITemplateService,
    ) {}

    async sendInviteUserSSO({
        email,
        code,
        expiresAt,
    }: ISendInviteUserSSO): Promise<void> {
        let content: string
        const unixTimestamp = Math.floor(new Date(expiresAt).getTime() / 1000)
        const timeSecondsToHour = formatRemainingTime(
            Number(env.TIME_EXPIRATION_CONFIRMED_EMAIL),
        )

        try {
            content = await this.templateService.fetchTemplate(
                env.MAILER_TEMPLATES_CONFIRMATION_RESET_PWD,
            )
        } catch (error) {
            const templatePath = path.join(
                process.cwd(),
                'email-template/activation-user.html',
            )
            content = fs.readFileSync(templatePath, 'utf8')
        }

        const subject = 'Account Activation Request'
        const url = `${env.SITE_URL}/third-party#access_token=${code}&refresh_token=${unixTimestamp}&expires_in=${env.TIME_EXPIRATION_CONFIRMED_EMAIL}&type=invite-sso`
        const body = content
            .replaceAll('{{ .ConfirmationURL }}', url)
            .replaceAll(
                '{{ .ExpirationTime }}',
                timeSecondsToHour.split(' and ')[0],
            )
            .replaceAll('{{ .SupportEmail }}', env.SUPPORT_EMAIL)
        console.log('Invite user SSO url: ', url)
        await this.emailProvider.sendMail(email, subject, body)
    }

    async sendPasswordResetConfirmation(email: string): Promise<void> {
        let content: string
        try {
            content = await this.templateService.fetchTemplate(
                env.MAILER_TEMPLATES_CONFIRMATION_RESET_PWD,
            )
        } catch (error) {
            const templatePath = path.join(
                process.cwd(),
                'email-template/confirm-reset-password.html',
            )
            content = fs.readFileSync(templatePath, 'utf8')
        }

        const subject = 'Your Password Has Been Reset'
        const body = content.replaceAll(
            '{{ .SupportEmail }}',
            env.SUPPORT_EMAIL,
        )
        await this.emailProvider.sendMail(email, subject, body)
    }
}
