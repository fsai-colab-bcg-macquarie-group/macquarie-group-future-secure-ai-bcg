import { Controller, Get, HttpStatus, Inject, Query } from '@nestjs/common'
import { ok } from 'src/controllers/http-helpers/http-response'
import { Public } from 'src/decorators/public-decorator'
import IDirectoryUserService from 'src/domain/interfaces/services/auth-layer/directory-user/i-directory-user-service'
import { LoggerService } from 'src/logger/logger.service'
import { throwHttpException } from 'src/utils'

@Controller('directory')
export class DirectoryUserController {
    constructor(
        @Inject('IDirectoryUserService')
        private readonly directoryUserService: IDirectoryUserService,
        private readonly logger: LoggerService,
    ) {}

    @Get('users')
    @Public()
    async getUser(@Query('search') textFilter?: string) {
        try {
            this.logger.log('Route:[get], Message: [Getting user list]')
            const findedUsers =
                await this.directoryUserService.getUserList(textFilter)

            return ok(findedUsers)
        } catch (error) {
            this.logger.error('[DirectoryUserController GET]: ', {
                error: String(error),
            })
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
