import { IsNotEmpty } from 'class-validator'

export class AddWorkerRequest {
    @IsNotEmpty()
    name: string
    @IsNotEmpty()
    description: string
}
