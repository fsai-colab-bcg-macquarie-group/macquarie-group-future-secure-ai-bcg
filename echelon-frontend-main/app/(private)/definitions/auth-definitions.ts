import { z } from 'zod'

const commonPasswords = [
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'password1',
  'password123',
  'admin',
  '123456789',
  '1234567',
]

export const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type EmailSchema = z.infer<typeof emailSchema>

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must include at least one uppercase letter (A-Z)',
    })
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must include at least one lowercase letter (a-z)',
    })
    .refine((val) => /[0-9]/.test(val), {
      message: 'Password must contain at least one numeric character (0-9)',
    })
    .refine((val) => !commonPasswords.includes(val.toLowerCase()), {
      message: 'Password is too common, please choose another password',
    }),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const passwordResetSchema = z
  .object({
    password: loginSchema.shape.password,
    confirmPassword: z
      .string()
      .min(8, 'Password must contain at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Your password does not match',
    path: ['confirmPassword'],
  })

export type PasswordResetSchema = z.infer<typeof passwordResetSchema>

export const userProfileSchema = z.object({
  username: z.string().email('Please enter a valid email address').trim(),
  departmentId: z.string().uuid('Please enter a valid department.').default(''),
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
})

export type UserProfileSchema = z.infer<typeof userProfileSchema>
