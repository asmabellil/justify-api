import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should generate a token', () => {
        const result = service.generateToken('test@example.com');
        expect(result.token).toBeDefined();
        expect(result.token.startsWith('Bearer ')).toBeTruthy();
    });

    it('should validate a generated token', () => {
        const { token } = service.generateToken('test@example.com');
        expect(service.validateToken(token)).toBeTruthy();
        expect(service.validateToken('invalid-token')).toBeFalsy();
    });
});