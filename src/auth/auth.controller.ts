import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService, TokenResponse } from './auth.service';
import { TokenRequestDto } from './dto/token-request.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('api')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('token')
    @ApiOperation({ summary: 'Obtenir un token d\'authentification' })
    @ApiBody({
        type: TokenRequestDto,
        description: 'Email pour générer le token',
        examples: {
            exemple1: {
                summary: 'Exemple d\'email',
                value: { email: 'user@example.com' }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Token généré avec succès',
        schema: {
            example: { token: 'Bearer a1b2c3d4e5f6...' }
        }
    })
    @ApiResponse({ status: 400, description: 'Email invalide' })
    async getToken(@Body() tokenRequest: TokenRequestDto): Promise<TokenResponse> {
        return this.authService.generateToken(tokenRequest.email);
    }
}