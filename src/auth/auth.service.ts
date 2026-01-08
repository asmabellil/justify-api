import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface TokenResponse {
    token: string;
}

@Injectable()
export class AuthService {
    private tokens = new Map<string, { email: string; createdAt: Date }>();

    generateToken(email: string): TokenResponse {
        // Create a simple token (in production, use JWT)
        const token = `Bearer ${crypto.randomBytes(32).toString('hex')}`;
        this.tokens.set(token, { email, createdAt: new Date() });

        // Cleanup old tokens (simplified)
        this.cleanupOldTokens();

        return { token };
    }

    validateToken(token: string): boolean {
        return this.tokens.has(token);
    }

    private cleanupOldTokens(): void {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        for (const [token, data] of this.tokens.entries()) {
            if (data.createdAt < oneDayAgo) {
                this.tokens.delete(token);
            }
        }
    }
}