import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum FactorType {
    TOTP = 'totp',
    PHONE = 'phone',
}

export class MFAEnrollRequest {
    @ApiProperty({
        description: 'Type of MFA factor',
        enum: FactorType,
        example: FactorType.TOTP,
    })
    @IsString()
    @IsNotEmpty()
    factorType: FactorType

    @ApiProperty({
        description: 'Friendly name for the MFA factor',
        example: 'My Phone',
    })
    @IsString()
    @IsNotEmpty()
    friendlyName: string
}

export class MFAVerifyRequest {
    @ApiProperty({
        description: 'ID of the MFA factor to verify',
        example: 'factor_123',
    })
    @IsString()
    @IsNotEmpty()
    factorId: string

    @ApiProperty({
        description: 'ID of the verification challenge',
        example: 'challenge_456',
    })
    @IsString()
    @IsNotEmpty()
    challengeId: string

    @ApiProperty({
        description: 'Verification code',
        example: '123456',
    })
    @IsString()
    @IsNotEmpty()
    code: string
}

export class MFAUnenrollRequest {
    @ApiProperty({
        description: 'ID of the MFA factor to unenroll',
        example: 'factor_123',
    })
    @IsString()
    @IsNotEmpty()
    factorId: string
}

export class MFAChallengeVerifyRequest {
    @ApiProperty({
        description: 'ID of the MFA factor to verify',
        example: 'factor_123',
    })
    @IsString()
    @IsNotEmpty()
    factorId: string

    @ApiProperty({
        description: 'Verification code',
        example: '123456',
    })
    @IsString()
    @IsNotEmpty()
    code: string
}

export class MFAChallengeRequest {
    @ApiProperty({
        description: 'ID of the MFA factor to challenge',
        example: 'factor_123',
    })
    @IsString()
    @IsNotEmpty()
    factorId: string
}

export class MFAListRequest {}
