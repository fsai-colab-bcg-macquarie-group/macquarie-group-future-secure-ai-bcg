import { objectToCamel } from 'src/utils/caseConverter'

export class UserModel {
    id: string
    firstName: string
    lastName: string
    email: string
    location: {
        name: string
        id: string
    }
    access: { name: string; id: string }
    useCaseTeams?: string[]
    status: 'Activated' | 'Deactivated' | 'Pending Activation'
    banned: boolean
    provider: 'Email' | 'SSO'

    static async fromSelectUserResponse(request: any): Promise<UserModel> {
        const newData = objectToCamel(request)
        return {
            id: newData.id,
            firstName: newData.firstName,
            lastName: newData.lastName,
            email: newData.email,
            location: {
                name: newData.location.id
                    ? newData.location.city +
                      ', ' +
                      newData.location.state +
                      ', ' +
                      newData.location.country
                    : '',
                id: newData.location.id,
            },
            access: { name: newData.access.name, id: newData.access.id },
            useCaseTeams: newData.useCaseTeams,
            status: (() => {
                if (newData.deletedAt) {
                    return 'Deactivated'
                }
                return newData.emailConfirmedAt
                    ? 'Activated'
                    : 'Pending Activation'
            })(),
            banned: !!newData.bannedUntil,
            provider: newData.isSsoUser ? 'SSO' : 'Email',
        }
    }
}
