import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBody,
    ApiResponse,
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiBearerAuth,
    ApiExcludeEndpoint,
} from '@nestjs/swagger'
import { IAuthCustomRequest } from 'src/controllers/http-helpers'
import { HttpResponse, ok } from 'src/controllers/http-helpers/http-response'
import { ResetPasswordRequest } from 'src/domain/auth-layer/auth/request'
import {
    AddUserRequest,
    FiltersSelectAllUsersRequest,
    SearchUserRequest,
    UpdateUserRequest,
} from 'src/domain/auth-layer/user/request'
import {
    FiltersSelectAllUsersResponse,
    PersistenceAddUserResponse,
    PersistenceUpdateUserResponse,
    UpdatePasswordResponse,
} from 'src/domain/auth-layer/user/response'
import { FilterSelectUserResponse } from 'src/domain/auth-layer/user/response/filter-select-user-response'
import { IUserService } from 'src/domain/interfaces/services/auth-layer/users'
import { AuthGuard } from 'src/middleware/auth-guard'
import { MessageGeneratorApiResponse } from 'src/shared/domains/generics/message-generator-api-response'
import { DataManagerController } from '../generic/data-manager-controller'
import { throwHttpException } from 'src/utils'
import { ILoggerService } from 'src/shared/services/interfaces/i-logger-service'
import { IHistoryService } from 'src/services/auth-layer/history/i-history-service'
import {
    ActionsType,
    InvitationType,
    StatusType,
} from 'src/domain/auth-layer/auth/enum'
@ApiTags('Users')
@Controller('users')
export class UsersController extends DataManagerController<
    AddUserRequest,
    PersistenceAddUserResponse,
    UpdateUserRequest,
    PersistenceUpdateUserResponse,
    FilterSelectUserResponse,
    FiltersSelectAllUsersResponse,
    FiltersSelectAllUsersRequest
> {
    constructor(
        @Inject('IUserService')
        private readonly userService: IUserService,
        @Inject('ILoggerService')
        private readonly logger: ILoggerService,
        @Inject('IHistoryService')
        private readonly historyService: IHistoryService,
    ) {
        super('User')
    }

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({
        description:
            MessageGeneratorApiResponse.bodyDescriptionCreatedMessage(
                'UseCaseTeam',
            ),
        type: AddUserRequest,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User created successfully',
        type: PersistenceAddUserResponse,
    })
    @ApiResponse({ status: 400, description: 'User not created' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post()
    async post(
        @Body() data: AddUserRequest,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<PersistenceAddUserResponse>> {
        try {
            this.logger.log('Route:[post], Message: [Creating new user]')
            const userCreated = await this.userService.add(data, req.authToken)

            if (!userCreated) {
                throw new BadRequestException('User not created')
            }

            const historyData = {
                description: `User ${userCreated.email} created`,
                user_id: req.user.user_id,
                email: req.user.email,
                action: ActionsType.CREATE_USER,
                success: true,
                profile: `ID:${req.user.profile.access_id} - ${req.user.profile.access_name}`,
                metadata: {
                    user_created_id: userCreated.userId,
                    email: userCreated.email,
                    invitation: InvitationType.PENDING,
                },
            }

            await this.historyService.createHistory(historyData)

            return ok(userCreated)
        } catch (error) {
            this.logger.error(`[UsersController POST]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Post('update-password')
    @ApiOperation({ summary: 'Update user password' })
    @ApiBody({ type: ResetPasswordRequest })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password updated successfully',
        type: UpdatePasswordResponse,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Failed to update password',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred. Please try again later.',
    })
    @HttpCode(HttpStatus.OK)
    async updatePassword(
        @Body()
        {
            password,
            confirmPassword,
            accessToken,
            refreshToken,
        }: ResetPasswordRequest,
    ): Promise<HttpResponse<UpdatePasswordResponse>> {
        try {
            this.logger.log(
                'Route:[update-password], Message: [Updating user password]',
            )
            let passwordUpdate: boolean = false
            const userUpdated = await this.userService.updatePassword({
                password,
                confirmPassword,
                accessToken,
                refreshToken,
            })

            if (!userUpdated?.id) {
                throw new BadRequestException('Failed update password')
            }

            const historyData = {
                description: `User ${userUpdated.email} updated password`,
                user_id: userUpdated.id,
                email: userUpdated.email || '',
                action: ActionsType.UPDATE_USER_PASSWORD,
                success: true,
                profile: ``,
                metadata: {
                    invitation: InvitationType.ACTIVATED,
                    email_confirmed_at: userUpdated.email_confirmed_at,
                },
            }
            await this.historyService.createHistory(historyData)

            passwordUpdate = true
            return ok({
                passwordUpdate: passwordUpdate,
                message: 'Password created successfully',
            })
        } catch (error) {
            this.logger.error(`[UsersController UPDATE PASSWORD]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Update user profile' })
    @ApiBody({ type: UpdateUserRequest })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User profile updated successfully',
        type: PersistenceUpdateUserResponse,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'User not updated',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred. Please try again later.',
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Put('update-profile')
    async put(
        @Body() data: UpdateUserRequest,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<PersistenceUpdateUserResponse>> {
        try {
            this.logger.log('Route:[put], Message: [Updating user]')

            const userUpdated = await this.userService.update(
                data,
                req.authToken,
            )

            if (!userUpdated) {
                throw new BadRequestException('User not updated')
            }

            const historyData = {
                description: `User ${req.user.email} updated profile to ${userUpdated.email}`,
                user_id: req.user.user_id,
                email: req.user.email,
                action: ActionsType.UPDATE_USER_PROFILE,
                success: true,
                profile: `ID:${req.user.profile.access_id} - ${req.user.profile.access_name}`,
                metadata: {
                    status: StatusType.SUCCESS,
                    user_updated_id: userUpdated.userId,
                },
            }
            await this.historyService.createHistory(historyData)

            return ok(userUpdated)
        } catch (error) {
            this.logger.error(`[UsersController PUT]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiExcludeEndpoint()
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get()
    async getAll(
        @Body() _filters: FiltersSelectAllUsersRequest,
    ): Promise<HttpResponse<FiltersSelectAllUsersResponse[] | null>> {
        try {
            this.logger.log('Route:[getAll], Message: [Getting all users]')
            // const users = await this.userService.selectAll(filters)
            // return ok(users)
            throw new Error('Method not implemented.')
        } catch (error) {
            this.logger.error(`[UsersController GET ALL]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User retrieved successfully',
        type: FilterSelectUserResponse,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred. Please try again later.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed (uuid is expected)',
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async get(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<FilterSelectUserResponse>> {
        try {
            this.logger.log('Route:[get], Message: [Getting user by ID]')
            const user = await this.userService.select({
                id,
                token: req.authToken,
            })
            if (!user) {
                throw new NotFoundException('User not found')
            }
            return ok(user)
        } catch (error) {
            this.logger.error(`[UsersController GET]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Search for users' })
    @ApiParam({
        name: 'search',
        description: 'Search User by name or email',
        type: SearchUserRequest,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Search results retrieved successfully',
        type: [FilterSelectUserResponse],
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred. Please try again later.',
    })
    @ApiOperation({ summary: 'Search for users' })
    @ApiParam({
        name: 'search',
        description: 'Search users by name or email',
        type: String,
        example: 'john',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Search results retrieved successfully',
        type: [FilterSelectUserResponse],
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred. Please try again later.',
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get('search-user/:search')
    async search(
        @Param('search') term: SearchUserRequest,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<FilterSelectUserResponse[]>> {
        try {
            this.logger.log('Route:[search-user], Message: [Searching users]')
            const result = await this.userService.searchUser(
                term,
                req.authToken,
            )
            return ok(result)
        } catch (error) {
            this.logger.error(`[UsersController SEARCH]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Activate user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User activated successfully',
        schema: {
            example: {
                data: 'User: username activated',
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred. Please try again later.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed (uuid is expected)',
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Put('activate/:id')
    async activate(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<string>> {
        try {
            this.logger.log('Route:[activate], Message: [Activating user]')
            const result = await this.userService.activate(id, req.authToken)
            if (!result) {
                throw new NotFoundException(`User not found!`)
            }
            return ok(`User: ${result} activated`)
        } catch (error) {
            this.logger.error(`[UsersController ACTIVATE]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiOperation({ summary: 'Deactivate user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User deactivated successfully',
        schema: {
            example: {
                data: 'User: username deactivated',
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'An unexpected error occurred. Please try again later.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed (uuid is expected)',
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Put('deactivate/:id')
    async delete(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<string>> {
        try {
            this.logger.log('Route:[deactivate], Message: [Deactivating user]')
            const result = await this.userService.delete(id, req.authToken)
            if (!result) {
                throw new NotFoundException(`User not found!`)
            }
            return ok(`User: ${result} deactivated`)
        } catch (error) {
            this.logger.error(`[UsersController DEACTIVATE]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
