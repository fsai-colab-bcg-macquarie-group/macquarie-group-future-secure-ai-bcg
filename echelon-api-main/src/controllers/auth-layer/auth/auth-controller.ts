import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    NotFoundException,
    Post,
    Query,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger'
import {
    AuthenticationUserRequest,
    ConfirmationEmailRequest,
    EmailRequest,
    MFAChallengeRequest,
    MFAChallengeVerifyRequest,
    MFAEnrollRequest,
    MFAUnenrollRequest,
    MFAVerifyRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SelectUserByIdRequest,
    VerifyEmailRequest,
} from 'src/domain/auth-layer/auth/request'

import { IAuthCustomRequest } from 'src/controllers/http-helpers'
import { HttpResponse, ok } from 'src/controllers/http-helpers/http-response'
import { SubordinateResetPasswordRequest } from 'src/domain/auth-layer/auth/request/subordinate-reset-password'
import {
    AuthenticatorAssuranceLevelResponse,
    AuthUserResponse,
    MFAChallengeResponse,
    MFAChallengeVerifyResponse,
    MFAEnrollResponse,
    MFAListResponse,
    MFARemoveUnverifiedFactorsResponse,
    MFAUnenrollResponse,
    MFAVerifyResponse,
    RefreshTokenResponse,
    ResetPasswordResponse,
    SelectByEmailResponse,
} from 'src/domain/auth-layer/auth/response'
import { IAuthenticationService } from 'src/domain/interfaces/services/auth-layer/auth'
import { IUserService } from 'src/domain/interfaces/services/auth-layer/users'
import { AuthGuard } from 'src/middleware/auth-guard'
import { IHeaderMetadata } from 'src/repository/logger/auth-layer/auth/i-log-login-data'
import { throwHttpException } from 'src/utils'
import { ILoggerService } from 'src/shared/services/interfaces/i-logger-service'
import { IHistoryService } from 'src/services/auth-layer/history/i-history-service'
import { ActionsType, InvitationType } from 'src/domain/auth-layer/auth/enum'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        @Inject('IAuthenticationService')
        private readonly authService: IAuthenticationService,
        @Inject('IUserService')
        private readonly userService: IUserService,
        @Inject('ILoggerService')
        private readonly logger: ILoggerService,
        @Inject('IHistoryService')
        private readonly historyService: IHistoryService,
    ) {}

    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'API is running' })
    @ApiResponse({
        status: 500,
        description: 'An unexpected error occurred. Please try again later.',
    })
    @Get('health-check')
    @HttpCode(HttpStatus.OK)
    async healthCheck(): Promise<HttpResponse<string>> {
        try {
            this.logger.log('Route:[health-check], Message: [Api is running]')
            return ok('Api is running')
        } catch (error) {
            this.logger.error(`[AuthController GET health-check]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: AuthenticationUserRequest })
    @ApiResponse({
        status: 200,
        description: 'User authenticated successfully',
        type: AuthUserResponse,
    })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid login credentials',
    })
    @ApiResponse({
        status: 429,
        description: 'Locked account after {N} attempts',
        content: {
            'application/json': {
                schema: {
                    example: {
                        statusCode: 429,
                        message:
                            'Your account is still locked. Please try again after {N} minutes',
                        error: 'Too Many Requests',
                    },
                },
            },
        },
    })
    @Post()
    @HttpCode(HttpStatus.OK)
    async login(
        @Req() req: any,
        @Body() loginData: AuthenticationUserRequest,
        @Body('headerData') headerData?: IHeaderMetadata,
    ): Promise<HttpResponse<AuthUserResponse>> {
        this.logger.log('Route:[login], Message: [Authenticating user]')
        const ip =
            headerData?.ip ||
            req.ip ||
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress
        const device = headerData?.device || req.headers['user-agent']
        const browser = headerData?.browser || req.headers['user-agent']

        const userAuthenticated = await this.authService.authenticate(
            { ip, device, browser },
            loginData,
        )
        if (!userAuthenticated) {
            throwHttpException(
                'Authentication failed',
                'Unauthorized',
                HttpStatus.UNAUTHORIZED,
            )
        }
        return ok(userAuthenticated)
    }

    @ApiOperation({ summary: 'Verify email existence' })
    @ApiBody({ type: VerifyEmailRequest })
    @ApiResponse({
        status: 200,
        description: 'Email verified',
        type: SelectByEmailResponse,
    })
    @ApiResponse({
        status: 400,
        description: 'Email not found',
        content: {
            'application/json': {
                schema: {
                    example: {
                        statusCode: 400,
                        message: 'Email not found',
                        error: 'Bad Request',
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(
        @Body() { email, allUsers = false }: VerifyEmailRequest,
    ): Promise<HttpResponse<SelectByEmailResponse>> {
        try {
            this.logger.log(`[MESSAGE]: Finding User BY ID, `)
            const userId = await this.userService.selectByEmail(email, allUsers)
            if (!userId) {
                throw new NotFoundException(`Email not found !`)
            }

            return ok({ user_id: userId })
        } catch (error: any) {
            this.logger.error(`[AuthController POST verify-email]: ${error}`)

            throwHttpException(
                error.response.message,
                error.response.statusCode,
            )
        }
    }

    // @Post('magic-link')
    // @HttpCode(HttpStatus.OK)
    // async sendMagicLink(
    //     @Body() { email }: EmailRequest,
    // ): Promise<HttpResponse<string>> {
    //     try {
    //         const success =
    //             await this.authService.authenticateWithMagicLink(email)
    //         if (!success) {
    //             throw new BadRequestException('Failed to send email')
    //         }
    //         return ok('Email send successfully')
    //     } catch (error) {

    //         throwHttpException(
    //             'An unexpected error occurred. Please try again later.',
    //             'Internal Server Error',
    //             HttpStatus.INTERNAL_SERVER_ERROR,
    //         )
    //     }
    // }

    @ApiOperation({ summary: 'Refresh access token' })
    @ApiBody({ type: RefreshTokenRequest })
    @ApiResponse({
        status: 200,
        description: 'Token refreshed successfully',
        type: RefreshTokenResponse,
    })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Body() { refreshToken }: RefreshTokenRequest,
    ): Promise<HttpResponse<RefreshTokenResponse>> {
        try {
            this.logger.log(
                'Route:[refresh-token], Message: [Refreshing access token]',
            )
            const session = await this.authService.refreshToken(refreshToken)
            if (!session) {
                throw new UnauthorizedException('Invalid refresh token')
            }
            return ok({
                accessToken: session.accessToken,
                refreshToken: session.refreshToken,
            })
        } catch (error) {
            this.logger.error(`[AuthController POST refresh-token]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Initiate password reset by email' })
    @ApiBody({ type: EmailRequest })
    @ApiResponse({ status: 200, description: 'Reset email sent successfully' })
    @ApiResponse({ status: 400, description: 'Failed to send email' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('reset-password-by-email')
    @HttpCode(HttpStatus.OK)
    async resetPasswordByEmail(
        @Body() { email }: EmailRequest,
    ): Promise<HttpResponse<string>> {
        try {
            this.logger.log(
                'Route:[reset-password-by-email], Message: [Initiating password reset by email]',
            )
            const success = await this.authService.resetPasswordForEmail(email)

            if (!success) {
                throw new BadRequestException('Failed to send email')
            }

            return ok('Email send successfully')
        } catch (error) {
            this.logger.error(
                `[AuthController POST reset-password-by-email]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Reset password with token' })
    @ApiBody({ type: ResetPasswordRequest })
    @ApiResponse({
        status: 200,
        description: 'Password reset successfully',
        content: {
            'application/json': {
                schema: {
                    example: {
                        passwordReset: true,
                        emailSend: true,
                        message: 'Password updated successfully',
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Failed to update password' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body()
        {
            password,
            confirmPassword,
            accessToken,
            refreshToken,
        }: ResetPasswordRequest,
    ): Promise<HttpResponse<ResetPasswordResponse>> {
        try {
            this.logger.log(
                'Route:[reset-password], Message: [Resetting user password]',
            )
            const { passwordReset, emailSend } =
                await this.authService.resetPassword({
                    password,
                    confirmPassword,
                    accessToken,
                    refreshToken,
                })
            if (!passwordReset) {
                throw new BadRequestException('Failed to update password')
            }

            return ok({
                emailSend,
                passwordReset,
                message: 'Password updated successfully',
            })
        } catch (error) {
            this.logger.error(`[AuthController POST reset-password]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Reset password for subordinate user' })
    @ApiBody({ type: SubordinateResetPasswordRequest })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
        type: UnauthorizedException,
        content: {
            'application/json': {
                schema: {
                    example: {
                        statusCode: 401,
                        message: 'Unauthorized',
                        error: 'Unauthorized',
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('subordinate-password-reset')
    async subordinatePasswordReset(
        @Body() requestData: SubordinateResetPasswordRequest,
    ): Promise<HttpResponse<boolean>> {
        try {
            this.logger.log(
                'Route:[subordinate-password-reset], Message: [Resetting subordinate password]',
            )
            const result =
                await this.authService.resetPasswordForSubordinate(requestData)
            return ok(result)
        } catch (error) {
            this.logger.error(
                `[AuthController POST subordinate-password-reset]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Get SSO URL' })
    @ApiQuery({ name: 'domain', required: false, description: 'SSO domain' })
    @ApiResponse({ status: 200, description: 'SSO URL retrieved successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('sso-url')
    @HttpCode(HttpStatus.OK)
    async getSSOUrl(
        @Query('domain') ssoDomain?: string,
    ): Promise<HttpResponse<{ url: string }>> {
        try {
            this.logger.log('Route:[sso-url], Message: [Getting SSO URL]')
            const url = await this.authService.getSSOUrl(ssoDomain)
            return ok(url)
        } catch (error) {
            this.logger.error(`[AuthController POST sso-url]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Confirm email with code' })
    @ApiBody({ type: ConfirmationEmailRequest })
    @ApiResponse({
        status: 200,
        description: 'Email confirmed successfully',
        content: {
            'application/json': {
                schema: {
                    example: {
                        statusCode: 200,
                        message:
                            "Your account has been successfully activated! You can now log in using your organization's Single Sign - On(SSO).",
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Activation link expired',
        content: {
            'application/json': {
                schema: {
                    example: {
                        statusCode: 401,
                        message:
                            'Your activation link has expired. Please request a new activation link to proceed.',
                        error: 'Unauthorized',
                    },
                },
            },
        },
    })
    @Post('confirmation-email')
    @HttpCode(HttpStatus.OK)
    async confirmationEmail(
        @Body() { code }: ConfirmationEmailRequest,
    ): Promise<HttpResponse<string>> {
        this.logger.log(
            'Route:[confirmation-email], Message: [Confirming email]',
        )
        const IsValidTime = await this.authService.confirmationEmail({ code })

        if (!IsValidTime) {
            throw new UnauthorizedException(
                `Your activation link has expired. Please request a new activation link to proceed.`,
            )
        }

        return ok(
            "Your account has been successfully activated! You can now log in using your organization's Single Sign - On(SSO).",
        )
    }

    @ApiOperation({ summary: 'Sign out user' })
    @ApiResponse({ status: 200, description: 'Successfully logged out.' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
        type: UnauthorizedException,
        content: {
            'application/json': {
                schema: {
                    example: {
                        statusCode: 401,
                        message: 'Unauthorized',
                        error: 'Unauthorized',
                    },
                },
            },
        },
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post('sign-out')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<string>> {
        try {
            this.logger.log('Route:[sign-out], Message: [Logging out user]')
            await this.authService.signOut({
                userId: req.user.user_id,
                sessionId: req.user.session_id,
            })
            return ok('Successfully logged out.')
        } catch (error) {
            this.logger.error(`[AuthController POST sign-out]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Send new activation link' })
    @ApiBody({ type: SelectUserByIdRequest })
    @ApiResponse({
        status: 200,
        description: 'Activation link sent successfully',
    })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
        type: UnauthorizedException,
        content: {
            'application/json': {
                schema: {
                    example: {
                        statusCode: 401,
                        message: 'Unauthorized',
                        error: 'Unauthorized',
                    },
                },
            },
        },
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('send-link-activate-user')
    async sendNewActivateLink(
        @Body() { userId }: SelectUserByIdRequest,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<string>> {
        try {
            this.logger.log(
                'Route:[send-link-activate-user], Message: [Sending new activation link]',
            )
            const isEmailSend = await this.authService.generateActivateLink({
                userId: userId,
                token: req.authToken,
            })
            if (!isEmailSend) {
                throw new BadRequestException('Failed to send email')
            }

            const historyData = {
                description: `User ${req.user.email} resend activation link`,
                user_id: req.user.user_id,
                email: req.user.email,
                action: ActionsType.RESEND_ACTIVATION_LINK,
                success: true,
                profile: `ID:${req.user.profile.access_id} - ${req.user.profile.access_name}`,
                metadata: {
                    user_resend_id: userId,
                    invitation: InvitationType.ACTIVATED,
                },
            }
            await this.historyService.createHistory(historyData)

            return ok('New activation link sent successfully')
        } catch (error) {
            this.logger.error(
                `[AuthController POST send-link-activate-user]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Enroll MFA' })
    @ApiBody({ type: MFAEnrollRequest })
    @ApiResponse({
        status: 200,
        description: 'MFA enrolled successfully',
        type: MFAEnrollResponse,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
        type: UnauthorizedException,
        content: {
            'application/json': {
                schema: {
                    example: {
                        statusCode: 401,
                        message: 'Unauthorized',
                        error: 'Unauthorized',
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Failed to enroll MFA' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post('mfa/enroll')
    @HttpCode(HttpStatus.OK)
    async enrollMFA(
        @Body() data: MFAEnrollRequest,
    ): Promise<HttpResponse<MFAEnrollResponse>> {
        try {
            this.logger.log('Route:[mfa/enroll], Message: [Enrolling MFA]')
            const response = await this.authService.enrollMFA(data)
            if (!response) {
                throw new BadRequestException('Failed to enroll MFA')
            }
            return ok(response)
        } catch (error) {
            this.logger.error(`[AuthController POST mfa/enroll]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Verify MFA' })
    @ApiBody({ type: MFAVerifyRequest })
    @ApiResponse({
        status: 200,
        description: 'MFA verified successfully',
        type: MFAVerifyResponse,
    })
    @ApiResponse({ status: 400, description: 'Failed to verify MFA' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post('mfa/verify')
    @HttpCode(HttpStatus.OK)
    async verifyMFA(
        @Body() data: MFAVerifyRequest,
    ): Promise<HttpResponse<MFAVerifyResponse>> {
        try {
            this.logger.log('Route:[mfa/verify], Message: [Verifying MFA]')
            const response = await this.authService.verifyMFA(data)
            if (!response) {
                throw new BadRequestException('Failed to verify MFA')
            }
            return ok(response)
        } catch (error) {
            this.logger.error(`[AuthController POST mfa/verify]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Unenroll MFA' })
    @ApiBody({ type: MFAUnenrollRequest })
    @ApiResponse({
        status: 200,
        description: 'MFA unenrolled successfully',
        type: MFAUnenrollResponse,
    })
    @ApiResponse({ status: 400, description: 'Failed to unenroll MFA' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post('mfa/unenroll')
    @HttpCode(HttpStatus.OK)
    async unenrollMFA(
        @Body() data: MFAUnenrollRequest,
    ): Promise<HttpResponse<MFAUnenrollResponse>> {
        try {
            this.logger.log('Route:[mfa/unenroll], Message: [Unenrolling MFA]')
            const response = await this.authService.unenrollMFA(data)
            if (!response) {
                throw new BadRequestException('Failed to unenroll MFA')
            }

            return ok(response)
        } catch (error) {
            this.logger.error(`[AuthController POST mfa/unenroll]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Create MFA challenge' })
    @ApiBody({ type: MFAChallengeRequest })
    @ApiResponse({
        status: 200,
        description: 'MFA challenge created successfully',
        type: MFAChallengeResponse,
    })
    @ApiResponse({ status: 400, description: 'Failed to create MFA challenge' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post('mfa/challenge')
    @HttpCode(HttpStatus.OK)
    async createMFAChallenge(
        @Body() data: MFAChallengeRequest,
    ): Promise<HttpResponse<MFAChallengeResponse>> {
        try {
            this.logger.log(
                'Route:[mfa/challenge], Message: [Creating MFA challenge]',
            )
            const response = await this.authService.createMFAChallenge(data)
            if (!response) {
                throw new BadRequestException('Failed to create MFA challenge')
            }

            return ok(response)
        } catch (error) {
            this.logger.error(`[AuthController POST mfa/challenge]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Verify MFA challenge' })
    @ApiBody({ type: MFAChallengeVerifyRequest })
    @ApiResponse({
        status: 200,
        description: 'MFA challenge verified successfully',
        type: MFAChallengeVerifyResponse,
    })
    @ApiResponse({ status: 400, description: 'Failed to verify MFA challenge' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post('mfa/challenge-verify')
    @HttpCode(HttpStatus.OK)
    async challengeVerifyMFA(
        @Req() req: any,
        @Body() data: MFAChallengeVerifyRequest,
        @Req() reqAuth: IAuthCustomRequest,
    ): Promise<HttpResponse<MFAChallengeVerifyResponse>> {
        this.logger.log(
            'Route:[mfa/challenge-verify], Message: [Verifying MFA challenge]',
        )
        const ipAddress =
            req.headers['x-forwarded-for'] ??
            req.ip ??
            req.connection.remoteAddress
        try {
            const response = await this.authService.challengeVerifyMFA(data, {
                ipAddress,
                token: reqAuth.authToken,
            })
            if (!response) {
                throw new BadRequestException('Failed to verify MFA challenge')
            }
            return ok(response)
        } catch (error) {
            this.logger.error(
                `[AuthController POST mfa/challenge-verify]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Check authenticator assurance level' })
    @ApiResponse({
        status: 200,
        description: 'Assurance level checked successfully',
        type: AuthenticatorAssuranceLevelResponse,
    })
    @ApiResponse({
        status: 400,
        description: 'Failed to check authenticator assurance level',
    })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post('mfa/authenticator-assurance-level')
    @HttpCode(HttpStatus.OK)
    async checkAuthenticatorAssuranceLevel(): Promise<
        HttpResponse<AuthenticatorAssuranceLevelResponse>
    > {
        try {
            this.logger.log(
                'Route:[mfa/authenticator-assurance-level], Message: [Checking authenticator assurance level]',
            )
            const response =
                await this.authService.checkAuthenticatorAssuranceLevel()
            if (!response) {
                throw new BadRequestException(
                    'Failed to check authenticator assurance level',
                )
            }
            return ok(response)
        } catch (error) {
            this.logger.error(
                `[AuthController POST mfa/authenticator-assurance-level]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
    @ApiOperation({ summary: 'List MFA factors' })
    @ApiResponse({
        status: 200,
        description: 'MFA factors listed successfully',
        type: MFAListResponse,
    })
    @ApiResponse({ status: 400, description: 'Failed to list MFA factors' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post('mfa/list-factors')
    @HttpCode(HttpStatus.OK)
    async listMFAFactors(): Promise<HttpResponse<MFAListResponse>> {
        try {
            this.logger.log(
                'Route:[mfa/list-factors], Message: [Listing MFA factors]',
            )
            const response = await this.authService.listMFAFactors()
            if (!response) {
                throw new BadRequestException('Failed to list MFA factors')
            }
            return ok(response)
        } catch (error) {
            this.logger.error(
                `[AuthController POST mfa/list-factors]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Remove unverified MFA factors' })
    @ApiResponse({
        status: 200,
        description: 'Unverified factors removed successfully',
        type: MFARemoveUnverifiedFactorsResponse,
    })
    @ApiResponse({
        status: 400,
        description: 'Failed to remove unverified factors',
    })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post('mfa/remove-unverified-factors')
    @HttpCode(HttpStatus.OK)
    async removeUnverifiedFactors(): Promise<
        HttpResponse<MFARemoveUnverifiedFactorsResponse>
    > {
        try {
            this.logger.log(
                'Route:[mfa/remove-unverified-factors], Message: [Removing unverified MFA factors]',
            )
            const response = await this.authService.removeUnverifiedFactors()
            if (!response) {
                throw new BadRequestException(
                    'Failed to remove unverified factors',
                )
            }
            return ok(response)
        } catch (error) {
            this.logger.error(
                `[AuthController POST mfa/remove-unverified-factors]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
