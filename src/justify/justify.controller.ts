import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JustifyService } from './justify.service';
import type { Request } from 'express';

@ApiTags('Justify')
@Controller('api')
export class JustifyController {
    constructor(private readonly justifyService: JustifyService) { }

    @Post('justify')
    @ApiBearerAuth('bearer-token')
    @ApiOperation({
        summary: 'Justifier un texte',
        description: 'Justifie le texte fourni en lignes de 80 caractères maximum. Limite de 80 000 mots par jour par token.'
    })
    @ApiConsumes('text/plain')
    @ApiBody({
        description: 'Texte à justifier (format text/plain)',
        schema: {
            type: 'string',
            example: 'Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n\'avais pas le temps de me dire: "Je m\'endors."'
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Texte justifié avec succès',
        schema: {
            type: 'string',
            example: 'Longtemps,  je  me  suis  couché  de  bonne heure. Parfois, à peine ma\nbougie  éteinte,  mes  yeux  se  fermaient  si  vite  que je n\'avais pas le\ntemps de me dire: "Je m\'endors."'
        }
    })
    @ApiResponse({ status: 400, description: 'Texte invalide ou mot dépassant 80 caractères' })
    @ApiResponse({ status: 401, description: 'Token manquant ou invalide' })
    @ApiResponse({ status: 402, description: 'Limite de 80 000 mots par jour dépassée (Payment Required)' })
    async justify(
        @Body() text: string,
        @Req() request: Request,
    ): Promise<string> {
        // Get token from the request (set by AuthGuard)
        const token = request.headers['authorization'] as string;

        if (!token) {
            throw new Error('Token is required');
        }

        return this.justifyService.justifyText(text, token);
    }
}