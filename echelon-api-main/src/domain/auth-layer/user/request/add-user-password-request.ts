import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsPositive, Min, IsEmail } from 'class-validator'

export class AddUserPasswordRequest {
    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @Min(1)
    id: number | string
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string
    @ApiProperty()
    @IsNotEmpty()
    password: string
    @ApiProperty()
    @IsNotEmpty()
    confirm_password: string
}
