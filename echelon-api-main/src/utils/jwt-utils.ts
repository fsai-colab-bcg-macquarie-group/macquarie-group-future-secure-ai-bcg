import jwt, { SignOptions } from 'jsonwebtoken'

export interface IJwtTokenPayload {
    code: string
    secret: string
    expiresIn: number
}

export interface IJwtTokenVerify {
    token: string
    secret: string
}

export default class JwtUtils {
    static getJwtTokenPayload(token: string) {
        const splittedToken = token.split('.')
        if (splittedToken.length < 3) throw new Error('Invalid JWT token')

        const payloadBase64 = splittedToken[1]

        const rawPayload = Buffer.from(payloadBase64, 'base64').toString(
            'ascii',
        )

        if (!payloadBase64)
            throw new Error('Payload part of the token is missing or invalid.')

        return JSON.parse(rawPayload)
    }

    static generateJWTToken({
        code,
        secret,
        expiresIn,
    }: IJwtTokenPayload): string {
        const options: SignOptions = { expiresIn: expiresIn }
        const token = jwt.sign({ code: code }, secret, options)

        return token
    }

    static verifyJWTToken({ token, secret }: IJwtTokenVerify): string | null {
        try {
            const decoded = jwt.verify(token, secret) as jwt.JwtPayload

            return decoded.code ?? null
        } catch (error) {
            console.error('[JWT Verification Error:]', error)
            return null
        }
    }

    static decodeJWTToken(token: string) {
        const decoded = jwt.decode(token)
        return decoded
    }
}
