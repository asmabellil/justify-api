import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenRequestDto {
    @ApiProperty({
        description: 'Adresse email de l\'utilisateur',
        example: 'user@example.com',
        format: 'email'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}