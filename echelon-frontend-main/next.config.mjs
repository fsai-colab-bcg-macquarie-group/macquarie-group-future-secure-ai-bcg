/** @type {import('next').NextConfig} */


const customLogoHost =
  process.env.NEXT_PUBLIC_CUSTOM_PARTNER_LOGO?.startsWith('https://')
    ? {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_CUSTOM_PARTNER_LOGO).hostname,
        port: '',
        pathname: '**', // Allow all paths for the custom logo
      }
    : undefined;


const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: customLogoHost ? [customLogoHost] : [],
  },
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        poll: true,
      };
    }
    return config;
  },
  env: {
    ENV_API: process.env.ENV_API,
    NEXT_PUBLIC_ENV_API: process.env.NEXT_PUBLIC_ENV_API,
    SIGN_IN_METHOD: process.env.SIGN_IN_METHOD,
    NEXT_PUBLIC_SIGN_IN_METHOD: process.env.NEXT_PUBLIC_SIGN_IN_METHOD,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    ENVIRONMENT: process.env.ENVIRONMENT,
    NEXT_PUBLIC_CUSTOM_PARTNER_LOGO: process.env.NEXT_PUBLIC_CUSTOM_PARTNER_LOGO,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    NEXT_PUBLIC_IFRAME_DETERMINISTIC_URL: process.env.NEXT_PUBLIC_IFRAME_DETERMINISTIC_URL,
    NEXT_PUBLIC_IFRAME_AI_FLOWS_URL: process.env.NEXT_PUBLIC_IFRAME_AI_FLOWS_URL,
    NEXT_PUBLIC_IFRAME_FLOW_SEE_URL: process.env.NEXT_PUBLIC_IFRAME_FLOW_SEE_URL,
    NEXT_PUBLIC_ALLOWED_DOMAINS: process.env.NEXT_PUBLIC_ALLOWED_DOMAINS,
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS,
    NEXT_PUBLIC_USE_CASE_TEAMS_MAX_TAGS: process.env.NEXT_PUBLIC_USE_CASE_TEAMS_MAX_TAGS,
    USE_CASE_TEAMS_MAX_TAGS: process.env.USE_CASE_TEAMS_MAX_TAGS,
    ENABLE_AD_SEARCH: process.env.ENABLE_AD_SEARCH,
    NEXT_PUBLIC_ENABLE_FLOW_TELL: process.env.NEXT_PUBLIC_ENABLE_FLOW_TELL
  },
};

export default nextConfig;
