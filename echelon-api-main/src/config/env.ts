import { configDotenv } from 'dotenv'
import { LoginMethodType } from 'src/domain/auth-layer/auth/enum'

configDotenv()

export const env = {
    PORT: process.env.PORT || 3010,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    SIGN_IN_METHOD:
        (process.env.SIGN_IN_METHOD as LoginMethodType | undefined) ||
        LoginMethodType.BOTH,
    MAX_FAILED_LOGIN_ATTEMPTS: process.env.MAX_FAILED_LOGIN_ATTEMPTS || 4,
    FAILED_LOGIN_LOCK_DURATION:
        process.env.FAILED_LOGIN_LOCK_DURATION || '1 hour',
    DEFAULT_DOMAIN_PROVIDER_SSO: process.env.DEFAULT_DOMAIN_PROVIDER_SSO,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    MAILER_TEMPLATES_RESET_PASSWORD:
        process.env.MAILER_TEMPLATES_RESET_PASSWORD!,
    MAILER_TEMPLATES_CONFIRMATION_RESET_PWD:
        process.env.MAILER_TEMPLATES_CONFIRMATION_RESET_PWD!,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL!,
    SITE_URL: process.env.SITE_URL,
    TIME_EXPIRATION_CONFIRMED_EMAIL:
        process.env.TIME_EXPIRATION_CONFIRMED_EMAIL || '3600',
    MAILER_TEMPLATES_INVITE: process.env.MAILER_TEMPLATES_INVITE!,
    ENTERPRISE_DIRECTORY_USER_API_URL:
        process.env.ENTERPRISE_DIRECTORY_USER_API_URL!,
    AD_TENANT_ID: process.env.AD_TENANT_ID!,
    AD_APPLICATION_ID: process.env.AD_APPLICATION_ID!,
    AD_CLIENT_SECRET: process.env.AD_CLIENT_SECRET!,
    ENTERPRISE_DIRECTORY_USER_BY_EMAIL_API_URL:
        process.env.ENTERPRISE_DIRECTORY_USER_BY_EMAIL_API_URL!,
}
