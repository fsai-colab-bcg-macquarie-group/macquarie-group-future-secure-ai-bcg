import { PermissionProps } from './types'

// Helper function to compare objects
export const objectsEqual = (obj1: any, obj2: any) => {
  // If both are null or undefined, they are equal
  if (obj1 === obj2) return true
  // If only one is null or undefined, they are different
  if (obj1 == null || obj2 == null) return false
  // Check if they are objects
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2
  // Compare IDs and names for simple entity objects (location, access)
  if ('id' in obj1 && 'name' in obj1 && 'id' in obj2 && 'name' in obj2) {
    return obj1.id === obj2.id && obj1.name === obj2.name
  }
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

// Helper function to compare arrays of objects
export const arraysEqual = (array1: any[], array2: any[]) => {
  if (array1.length !== array2.length) return false
  // Sort the arrays by id to ensure consistency
  const sortedArray1 = [...array1].sort((a, b) => a.id.localeCompare(b.id))
  const sortedArray2 = [...array2].sort((a, b) => a.id.localeCompare(b.id))
  return JSON.stringify(sortedArray1) === JSON.stringify(sortedArray2)
}

// Verify if the field is permitted
export async function Permission({
  loggedUserAccess,
  managedAccess,
  managedProvider,
  field,
}: PermissionProps): Promise<boolean> {
  const deniedFields =
    deniedFieldsMap[loggedUserAccess]?.[managedAccess]?.[managedProvider]

  if (deniedFields?.includes(field)) {
    return false
  }

  // Permitted by default if there is no configuration
  return true
}

// ===================================================================================

// Denied Fields Map
export const deniedFieldsMap: {
  [userAccess: string]: {
    [managedAccess: string]: {
      [provider in PermissionProps['managedProvider']]?: PermissionProps['field'][]
    }
  }
} = {
  'Platform Administrator': {
    'Platform Administrator': {
      Email: ['email'],
      SSO: ['email', 'firstName', 'lastName'],
    },
    'Commercial Administrator': {
      Email: ['email'],
      SSO: ['email', 'firstName', 'lastName'],
    },
    'AI Worker Manager': {
      Email: ['email', 'firstName', 'lastName', 'location'],
      SSO: ['email', 'firstName', 'lastName', 'location'],
    },
    'AI Worker Designer': {
      Email: ['email'],
      SSO: ['email', 'firstName', 'lastName'],
    },
  },

  'Commercial Administrator': {
    'Platform Administrator': {
      Email: ['email', 'firstName', 'lastName', 'location'],
      SSO: ['email', 'firstName', 'lastName', 'location'],
    },
    'Commercial Administrator': {
      Email: ['email'],
      SSO: ['email', 'firstName', 'lastName'],
    },
    'AI Worker Manager': {
      Email: ['email'],
      SSO: ['email', 'firstName', 'lastName'],
    },
    'AI Worker Designer': {
      Email: ['email', 'firstName', 'lastName', 'location', 'useCaseTeams'],
      SSO: ['email', 'firstName', 'lastName', 'location', 'useCaseTeams'],
    },
  },
}

// All Form Fields
export const allFields: PermissionProps['field'][] = [
  'email',
  'firstName',
  'lastName',
  'location',
  'access',
  'useCaseTeams',
]
