import { AMREntry, Factor, User } from '@supabase/supabase-js'
import { ApiProperty } from '@nestjs/swagger'

export class TOTPDetails {
    @ApiProperty({
        description: 'QR code for TOTP setup',
        example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    })
    qr_code: string

    @ApiProperty({
        description: 'Secret key for TOTP setup',
        example: 'JBSWY3DPEHPK3PXP',
    })
    secret: string

    @ApiProperty({
        description: 'URI for TOTP setup',
        example:
            'otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example',
    })
    uri: string
}

export class MFAEnrollResponse {
    @ApiProperty({
        description: 'Factor ID',
        example: 'totp_factor_123456',
    })
    id: string

    @ApiProperty({
        description: 'Factor type',
        example: 'totp',
    })
    type: 'totp'

    @ApiProperty({
        description: 'TOTP details',
        type: TOTPDetails,
    })
    totp: TOTPDetails

    @ApiProperty({
        description: 'User-friendly name for the factor',
        example: 'My Authenticator App',
        required: false,
    })
    friendly_name?: string
}

export class MFAVerifyResponse {
    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    access_token: string

    @ApiProperty({
        description: 'Token type',
        example: 'bearer',
    })
    token_type: string

    @ApiProperty({
        description: 'Token expiration time in seconds',
        example: 3600,
    })
    expires_in: number

    @ApiProperty({
        description: 'JWT refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    refresh_token: string

    @ApiProperty({
        description: 'User information',
        example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00.000Z',
        },
    })
    user: User
}

export class MFAUnenrollResponse {
    @ApiProperty({
        description: 'Factor ID that was unenrolled',
        example: 'totp_factor_123456',
    })
    id: string
}

export class MFAChallengeVerifyResponse {
    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    access_token: string

    @ApiProperty({
        description: 'Token type',
        example: 'bearer',
    })
    token_type: string

    @ApiProperty({
        description: 'Token expiration time in seconds',
        example: 3600,
    })
    expires_in: number

    @ApiProperty({
        description: 'JWT refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    refresh_token: string

    @ApiProperty({
        description: 'User information',
        example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00.000Z',
        },
    })
    user: User
}

export class AMREntryClass {
    @ApiProperty({
        description: 'Authentication method',
        example: 'password',
    })
    method: string

    @ApiProperty({
        description: 'Timestamp when the method was used',
        example: '2023-01-01T00:00:00.000Z',
    })
    timestamp: string
}

export class AuthenticatorAssuranceLevelResponse {
    @ApiProperty({
        description: 'Current authentication assurance level',
        example: 'aal1',
    })
    currentLevel: string

    @ApiProperty({
        description: 'Next possible authentication assurance level',
        example: 'aal2',
    })
    nextLevel: string

    @ApiProperty({
        description: 'Current authentication methods used',
        type: [AMREntryClass],
    })
    currentAuthenticationMethods: AMREntry[]
}

export class MFAChallengeResponse {
    @ApiProperty({
        description: 'Challenge ID',
        example: 'challenge_123456',
    })
    id: string

    @ApiProperty({
        description: 'Challenge type',
        example: 'totp',
    })
    type: string

    @ApiProperty({
        description: 'Challenge expiration timestamp',
        example: 1672531200,
    })
    expires_at: number
}

export class FactorObject {
    @ApiProperty({ example: 'factor_id' })
    id: string

    @ApiProperty({ example: 'My Auth Factor' })
    friendly_name?: string

    @ApiProperty({ example: 'totp', enum: ['totp', 'phone'] })
    factor_type: 'totp' | 'phone'

    @ApiProperty({ example: 'verified', enum: ['verified', 'unverified'] })
    status: 'verified' | 'unverified'

    @ApiProperty({ example: '2024-01-01T00:00:00Z' })
    created_at: string

    @ApiProperty({ example: '2024-01-01T00:00:00Z' })
    updated_at: string
}

export class MFAListResponse {
    @ApiProperty({
        description: 'All MFA factors',
        type: [FactorObject],
    })
    all: Factor[]

    @ApiProperty({
        description: 'TOTP factors',
        type: [FactorObject],
    })
    totp: Factor[]

    @ApiProperty({
        description: 'Phone factors',
        type: [FactorObject],
    })
    phone: Factor[]
}

export class MFARemoveUnverifiedFactorsResponse {
    @ApiProperty({
        description: 'Whether the operation was successful',
        example: true,
    })
    success: boolean

    @ApiProperty({
        description: 'Message describing the result',
        example: 'All unverified factors have been removed',
    })
    message: string
}
