import nodemailer, { Transporter } from 'nodemailer'
import { IMailProvider } from '../services/interfaces/notification'
import { env } from 'src/config/env'

export class MailProvider implements IMailProvider {
    private transporter: Transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: parseInt(env.SMTP_PORT || '0', 10),
            secure: false, // true for 465, false for other ports
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        })
    }

    async sendMail(to: string, subject: string, body: string): Promise<void> {
        await this.transporter.sendMail({
            from: env.SMTP_FROM,
            to,
            subject,
            html: body,
        })
    }
}
