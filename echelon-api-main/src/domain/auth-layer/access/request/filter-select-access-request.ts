import { IsNotEmpty } from 'class-validator'

export class FilterSelectAccessHierarchyRequest {
    @IsNotEmpty()
    id: number
}
