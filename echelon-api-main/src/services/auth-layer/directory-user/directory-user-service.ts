import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { env } from 'process'
import { GetDirectoryUserResponse } from 'src/domain/auth-layer/directory-user/response/get-directory-user-response'
import IDirectoryUserService from 'src/domain/interfaces/services/auth-layer/directory-user/i-directory-user-service'
import { HttpClientResponse } from 'src/shared/domains/http-client/http-client-response'
import { IHttpClientService } from 'src/shared/services/interfaces/i-http-service'
import JwtUtils from 'src/utils/jwt-utils'

@Injectable()
export default class ActiveDirectoryUserService
    implements IDirectoryUserService
{
    static accessToken = ''
    constructor(
        @Inject('IHttpClientService')
        private readonly httpClient: IHttpClientService,
    ) {}

    async getUserList(
        textFilter?: string,
    ): Promise<GetDirectoryUserResponse[] | null> {
        try {
            await this.validateToken()

            let retryAttempts = 0

            while (retryAttempts < 3) {
                const res = await this.fetchUsers(textFilter)

                if (res.statusCode === HttpStatus.OK) return res.body.value

                if (res.statusCode === HttpStatus.UNAUTHORIZED)
                    ActiveDirectoryUserService.accessToken =
                        await this.generateAccessToken()

                retryAttempts++
            }

            return null
        } catch (error) {
            console.log('[DirectoryUserService getUserList]: ', error)
            return null
        }
    }

    async getUserByEmail(
        email: string,
    ): Promise<GetDirectoryUserResponse | null> {
        try {
            await this.validateToken()

            let retryAttempts = 0

            while (retryAttempts < 3) {
                const res = await this.fetchUserByEmail(email)
                if (res.statusCode === HttpStatus.NOT_FOUND) return null
                if (res.statusCode === HttpStatus.OK) return res.body

                if (res.statusCode === HttpStatus.UNAUTHORIZED)
                    ActiveDirectoryUserService.accessToken =
                        await this.generateAccessToken()

                retryAttempts++
            }

            return null
        } catch (error) {
            console.log('[DirectoryUserService getUserByEmail]: ', error)
            return null
        }
    }

    private async fetchUsers(textFilter?: string): Promise<
        HttpClientResponse<{
            value: GetDirectoryUserResponse[]
        }>
    > {
        const filter = `"givenName:${textFilter}" OR "mail:${textFilter}" OR "surname:${textFilter}" OR "displayName:${textFilter}"`

        const res = await this.httpClient.get<{
            value: GetDirectoryUserResponse[]
        }>(
            env.ENTERPRISE_DIRECTORY_USER_API_URL! +
                `${textFilter && `&%24search=${encodeURIComponent(filter)}`}`,
            {
                Authorization: `Bearer ${ActiveDirectoryUserService.accessToken}`,
                ConsistencyLevel: 'eventual',
            },
        )

        return res
    }
    private async fetchUserByEmail(
        email: string,
    ): Promise<HttpClientResponse<GetDirectoryUserResponse | null>> {
        try {
            const res =
                await this.httpClient.get<GetDirectoryUserResponse | null>(
                    env.ENTERPRISE_DIRECTORY_USER_BY_EMAIL_API_URL! +
                        `${email}`,
                    {
                        Authorization: `Bearer ${ActiveDirectoryUserService.accessToken}`,
                        ConsistencyLevel: 'eventual',
                    },
                )
            return res
        } catch (error) {
            console.log('[DirectoryUserService fetchUserByEmail]: ', error)
            return {
                statusCode: HttpStatus.NOT_FOUND,
                body: null,
            }
        }
    }

    private async validateToken(): Promise<void> {
        if (!ActiveDirectoryUserService.accessToken) {
            ActiveDirectoryUserService.accessToken =
                await this.generateAccessToken()
            return
        }

        let exp: number

        try {
            const obj = JwtUtils.getJwtTokenPayload(
                ActiveDirectoryUserService.accessToken,
            )
            exp = obj.exp
        } catch (ex) {
            ActiveDirectoryUserService.accessToken =
                await this.generateAccessToken()
            return
        }

        const expireDate = new Date(exp * 1000)
        const now = new Date()

        if (expireDate.getTime() > now.getTime()) return

        ActiveDirectoryUserService.accessToken =
            await this.generateAccessToken()
    }

    private async generateAccessToken() {
        const response = await this.httpClient.post<{ access_token: string }>(
            `https://login.microsoftonline.com/${env.AD_TENANT_ID}/oauth2/v2.0/token`,
            new URLSearchParams({
                client_id: env.AD_APPLICATION_ID!,
                scope: 'https://graph.microsoft.com/.default',
                grant_type: 'client_credentials',
                client_secret: env.AD_CLIENT_SECRET!,
            }),
            undefined,
            'application/x-www-form-urlencoded; charset=UTF-8',
        )
        return response.body.access_token
    }
}
