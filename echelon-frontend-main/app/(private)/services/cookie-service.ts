'use server'

// Native cookies module from next
import { cookies } from 'next/headers'

// Sets a cookie with name and value
export async function setCookie(name: string, value: string) {
  const cookieStore = await cookies()
  cookieStore.set(name, value, { path: '/' })
}

// Get the cookie with the given name
export async function getCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(name)
  return cookie?.value || null
}

// Delete the cookie with the given name
export async function deleteCookie(name: string) {
  const cookieStore = await cookies()
  cookieStore.delete(name)
}

// Delete all cookies
export async function deleteAllCookies() {
  const cookieStore = await cookies()
  cookieStore.getAll().forEach((cookie) => cookieStore.delete(cookie.name))
}
