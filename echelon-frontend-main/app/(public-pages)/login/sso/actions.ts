'use server'

import { LoginMethodType } from '@enum/login-method-type'

export async function getLoginMethodFromEnv(): Promise<string> {
  const method = process.env.SIGN_IN_METHOD || LoginMethodType.BOTH
  return method.toLowerCase().toString()
}

export const isLoginMethodIncluded = async (methods: any[]) => {
  const loginMethod = await getLoginMethodFromEnv()

  const input =
    loginMethod !== undefined
      ? loginMethod.replace(/\s+/g, '')
      : LoginMethodType.BOTH

  return methods.includes(input)
}
