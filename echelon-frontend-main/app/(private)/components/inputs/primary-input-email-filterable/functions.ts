import getDomainsFromEnv from '@services/user-service'
import { verifyEmail } from '@services/auth-service'
import { emailIsValid } from '@utils/is-email-regex'
import { AdUser } from './types'
import { searchAdUsers } from '@services/user-query-service'
import { isAdSearchEnabled } from '@services/user-query-service'

// ----------- Check if email already exists -----------------------------
export async function verifyEmailExists(
  email: string,
): Promise<boolean | null> {
  try {
    return await verifyEmail(email, true)
  } catch (error) {
    console.error('Error on verify email:', error)
    return null
  }
}
// ------------------------------------------------------------------------

// ----------- Verify if the email domain is allowed ----------------------
export async function verifyDomain(email: string): Promise<boolean> {
  const allowedDomains = await getDomainsFromEnv()

  const emailDomain = email.split('@')[1]
  if (!emailDomain) {
    return false
  }

  return allowedDomains.some((allowedDomain: string) => {
    const cleanDomain = allowedDomain.replace('@', '').toLowerCase().trim()
    return cleanDomain === emailDomain.toLowerCase().trim()
  })
}
// ------------------------------------------------------------------------

// ----------- Process the typed term --------------------------------------
export async function processTerm(
  term: string,
  setErrorEmailExist: (value: boolean) => void,
  setErrorDomain: (value: boolean) => void,
  setOptionsAndOpenDropdown: (options: AdUser[]) => void,
  setErrorTermType: (value: boolean) => void,
) {
  if (!term) return
  const isADSearchEnabled: boolean = await isAdSearchEnabled()
  const isTermEmail = emailIsValid(term)

  if (isTermEmail) {
    const isValidDomain = await verifyDomain(term)
    if (!isValidDomain) return setErrorDomain(true)

    const emailExists = await verifyEmailExists(term)
    if (emailExists) return setErrorEmailExist(true)

    if (isADSearchEnabled) {
      const { data: adUsers } = await searchAdUsers(term)
      if (adUsers && adUsers.length > 0) {
        setOptionsAndOpenDropdown(adUsers)
      }
      return term
    }

    return term
  } else {
    if (isADSearchEnabled) {
      const { data: adUsers } = await searchAdUsers(term)
      setOptionsAndOpenDropdown(adUsers)
      return
    }
    setErrorTermType(true)
  }
}
