import { IsNotEmpty } from 'class-validator'

export class UpdateWorkerRequest {
    @IsNotEmpty()
    id: number | string
    @IsNotEmpty()
    name: string
    description: string
    updated_at: Date
}
