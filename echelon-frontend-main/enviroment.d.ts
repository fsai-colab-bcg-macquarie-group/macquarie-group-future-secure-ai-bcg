declare namespace NodeJS {
  export interface ProcessEnv {
    readonly ENV_API: string;
    readonly ENABLE_AD_SEARCH: string;
    readonly NEXT_PUBLIC_ENV_API: string;
    readonly SIGN_IN_METHOD: string;
    readonly NEXT_PUBLIC_SIGN_IN_METHOD: string;
    readonly NEXT_PUBLIC_SUPABASE_URL: string;
    readonly ENVIRONMENT: string;
    readonly NEXT_PUBLIC_CUSTOM_PARTNER_LOGO: string;
    readonly NEXT_PUBLIC_SUPPORT_EMAIL: string;
  }
}