import { Injectable, Scope, Inject } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable({ scope: Scope.REQUEST }) // Ensure request-scoped service
export class AuthenticatedToken {
    private token: string | null = null

    constructor(@Inject(REQUEST) private readonly request: Request) {
        this.token = this.extractTokenFromHeader(this.request)
    }

    getToken(): string {
        return this.token || ''
    }

    private extractTokenFromHeader(request: Request): string | null {
        const [type, token] = request.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : null
    }
}
