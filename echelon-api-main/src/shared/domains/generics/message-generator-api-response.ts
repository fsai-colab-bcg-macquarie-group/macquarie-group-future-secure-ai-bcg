import { HttpStatus } from '@nestjs/common'

export class MessageGeneratorApiResponse {
    static message(entityName: string, status: HttpStatus): string {
        switch (status) {
            case HttpStatus.CREATED:
                return this.validSuccessfullyCreatedMessage(entityName)
            case HttpStatus.OK:
                return this.validSuccessfullyUpdatedMessage(entityName)
            case HttpStatus.BAD_REQUEST:
                return this.invalidDataMessage(entityName)
            case HttpStatus.UNAUTHORIZED:
                return this.invalidUnauthorizedAccessMessage(entityName)
            case HttpStatus.NOT_FOUND:
                return this.invalidNotFoundMessage(entityName)
            case HttpStatus.INTERNAL_SERVER_ERROR:
                return this.invalidInternalErrorMessage(entityName)
            // case HttpStatus.OK:
            // return this.requiredDataMessage(entityName)
            // case HttpStatus.BAD_REQUEST:
            // return this.badRequestDataMessage(entityName)
            case HttpStatus.FORBIDDEN:
                return this.forbiddenAccessMessage(entityName)
            default:
                return ''
        }
    }

    static bodyDescriptionCreatedMessage(entityName: string): string {
        return `Data required to create a ${entityName}.`
    }

    static bodyDescriptionUpdatedMessage(entityName: string): string {
        return `Data required to update a ${entityName}.`
    }

    private static forbiddenAccessMessage(entityName: string): string {
        return `Access denied. You do not have permission to perform this action. ${entityName}.`
    }

    private static badRequestDataMessage(entityName: string): string {
        return `Invalid request. Please check the provided data and try again. ${entityName}.`
    }
    private static requiredDataMessage(entityName: string): string {
        return `Request processed successfully. ${entityName}.`
    }

    private static invalidDataMessage(entityName: string): string {
        return `Invalid data sent. ${entityName}`
    }

    private static validSuccessfullyCreatedMessage(entityName: string): string {
        return `${entityName} created successfully.`
    }

    private static validSuccessfullyUpdatedMessage(entityName: string): string {
        return `${entityName} updated successfully.`
    }

    private static invalidInternalErrorMessage(entityName: string): string {
        return `${entityName} Internal server error.`
    }

    private static invalidUnauthorizedAccessMessage(
        entityName: string,
    ): string {
        return `Unauthorized access ${entityName}.`
    }

    private static invalidNotFoundMessage(entityName: string): string {
        return `${entityName} not found.`
    }
}
