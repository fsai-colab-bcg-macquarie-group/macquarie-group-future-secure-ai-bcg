import { IsNotEmpty } from 'class-validator'

export class FilterSelectWorldStateCitiesRequest {
    @IsNotEmpty()
    id: number | string
    token?: string
}
