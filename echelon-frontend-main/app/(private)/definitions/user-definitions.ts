import { nullable, z } from 'zod'

// Regexes
const nameRegex = /^[A-ZÀ-Ÿ][a-zà-ÿ]*(?: [A-ZÀ-Ÿ][a-zà-ÿ]*)*$/

// Schemas
const uuidSchema = z.string().uuid()
const nameSchema = z.string().regex(nameRegex, 'Invalid Name')

// -----------------------------------------------------------

// User Schema
export const userSchema = z.object({
  id: uuidSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  email: z.string().email(),
  location: z.object({
    name: nameSchema.nullable(),
    id: uuidSchema.nullable(),
  }),
  access: z.object({ name: nameSchema, id: uuidSchema }),
  useCaseTeams: z
    .array(z.object({ name: nameSchema, id: uuidSchema }))
    .or(z.array(z.never()).length(0)),
  status: z.enum(['Activated', 'Deactivated', 'Pending Activation']),
  banned: z.boolean(),
  provider: z.enum(['Email', 'SSO']),
})

// User Type
export type User = z.infer<typeof userSchema>
// Use in all services functions validation

// Cookied User Data Schema
export const userJwtSchema = z.object({
  aal: z.string(),
  amr: z.array(
    z.object({
      method: z.string(),
      timestamp: z.number(),
    }),
  ),
  app_metadata: z.object({
    provider: z.string(),
    providers: z.array(z.string()),
  }),
  aud: z.string(),
  email: z.string(),
  exp: z.number(),
  iat: z.number(),
  is_anonymous: z.boolean(),
  iss: z.string(),
  phone: z.string(),
  profile: z.object({
    access_id: uuidSchema,
    access_name: z.string(),
    first_name: z.string(),
    last_name: z.string(),
  }),
  role: z.string(),
  session_id: uuidSchema,
  sub: z.string(),
  use_case_teams: z.array(
    z.object({
      name: z.string(),
      use_case_team_id: z.string(),
    }),
  ),
  user_id: uuidSchema,
  user_metadata: z.record(z.string(), z.never()),
  user_permissions: z.array(z.never()),
})

export type UserJWT = z.infer<typeof userJwtSchema>

// -----------------------------------------------------------

// User Submit Schema
export const userUpdateSchema = z.object({
  id: uuidSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  locationId: uuidSchema.or(nullable(uuidSchema)),
  accessId: uuidSchema,
  useCaseTeamIds: z.array(uuidSchema).or(z.array(z.never()).length(0)),
})

export type UserUpdateForm = z.infer<typeof userUpdateSchema>

// -----------------------------------------------------------

// User Add Schema
export const userAddSchema = z.object({
  email: z.string().email(),
  firstName: nameSchema,
  lastName: nameSchema,
  locationId: uuidSchema.nullable().or(z.string().length(0)),
  useCaseTeamIds: z.array(uuidSchema).optional(),
  accessId: uuidSchema,
  isSSO: z.boolean(),
})

export type UserAddForm = z.infer<typeof userAddSchema>

// -----------------------------------------------------------

// Use Case Team Schema
export const useCaseTeamSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
})

export type UseCaseTeam = z.infer<typeof useCaseTeamSchema>

// -----------------------------------------------------------

// Access Schema
export const accessSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  description: z.string().optional(),
})

export type Access = z.infer<typeof accessSchema>

// -----------------------------------------------------------

// Location SUPABASE Schema
export const locationSchema = z.object({
  id: uuidSchema,
  city: z.string().regex(/^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)*$/),
  state: z.string().regex(/^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)*$/),
  country: z.string().regex(/^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)*$/),
})

export type Location = z.infer<typeof locationSchema>

// -----------------------------------------------------------