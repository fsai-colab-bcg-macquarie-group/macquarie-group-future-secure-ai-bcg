'use server only'

import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { extractTokenInfo } from '@services/jwt-service'

// Types
type Route = {
  path: string
  requiresAuth: boolean
  isPublic: boolean
}

type AppRoutes = {
  [key: string]: string
}

// Constants
const ROUTES: AppRoutes = {
  LOGIN: '/login',
  MFA_VALIDATE: '/mfa-validate',
  CHOOSE_TEAM: '/choose-team',
  HOME: '/',
  FORGOT_PASSWORD: '/forgot-password',
  THIRD_PARTY: '/third-party',
  RESET_PASSWORD: '/reset-password',
}

export const validIframeNames = [
  'fsai-flow',
  'flow-gen',
  'flow-see',
  'flow-tell',
]

// Public routes
const PUBLIC_ROUTES: Route[] = [
  { path: ROUTES.LOGIN, requiresAuth: false, isPublic: true },
  { path: ROUTES.FORGOT_PASSWORD, requiresAuth: false, isPublic: true },
  { path: ROUTES.THIRD_PARTY, requiresAuth: false, isPublic: true },
  { path: ROUTES.RESET_PASSWORD, requiresAuth: false, isPublic: true },
]

const redirectTo = (request: NextRequest, path?: string): NextResponse =>
  path
    ? NextResponse.redirect(new URL(path, request.url))
    : NextResponse.next({ request })

const handleMFAValidation = async (
  request: NextRequest,
  user: any,
): Promise<NextResponse> => {
  const isSSOUser = user?.aal === 'aal1' && user?.amr[0]?.method === 'sso/saml'

  // If user is SSO, we can skip the MFA validation step or If MFA is already validated, proceed to team selection
  if (isSSOUser) {
    return redirectTo(request, ROUTES.CHOOSE_TEAM)
  }

  // Stay on MFA validation page if not validated
  return NextResponse.next()
}

const buildUser = async (token: string) => {
  const user = await extractTokenInfo(token)
  return user
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value as string
  const isPublic = PUBLIC_ROUTES.some((route) => route.path === pathname)
  const isAuthenticated = !!token
  const user = token ? await buildUser(token) : (null as any)
  let isMFAUserUnverified: boolean =
    user?.aal === 'aal1' && user?.amr[0]?.method === 'password'
  const isStaticAsset =
    pathname.match(/\.(js|css|svg|png|jpg|jpeg|woff|woff2|ttf|eot)$/) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static')

  // 🔒 user not authenticated trying to access protected route → redirect to /login
  if (!token && !isPublic && !isStaticAsset) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 🔐 user authenticated trying to access public route → redirect to /
  if (isAuthenticated && isPublic) {
    console.log(
      'user authenticated trying to access public route → redirect to /',
    )
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is not MFA verified, redirect to MFA_VALIDATE
  if (process.env.IS_MFA_ENABLED === 'true') {
    if (token && isMFAUserUnverified) {
      if (pathname !== ROUTES.MFA_VALIDATE) {
        return redirectTo(request, ROUTES.MFA_VALIDATE)
      }
      // While redirect to MFA_VALIDATE
      return NextResponse.next()
    }
  }

  // After validate MFA, redirect to choose team
  if (
    token &&
    !request.cookies.get('selected_team_id')?.value &&
    pathname !== ROUTES.CHOOSE_TEAM
  ) {
    return redirectTo(request, ROUTES.CHOOSE_TEAM)
  }

  // Handle MFA Validation Flow
  if (pathname === ROUTES.MFA_VALIDATE) {
    return handleMFAValidation(request, user)
  }

  if (validIframeNames.includes(pathname.slice(1))) {
    return NextResponse.rewrite(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.css|.*\\.js).*)',
  ],
}
