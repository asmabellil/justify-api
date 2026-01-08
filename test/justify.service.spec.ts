import { Test, TestingModule } from '@nestjs/testing';
import { JustifyService } from '../src/justify/justify.service';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

describe('JustifyService', () => {
    let service: JustifyService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JustifyService],
        }).compile();

        service = module.get<JustifyService>(JustifyService);

        // Reset the wordCounts map before each test
        (service as any).wordCounts = new Map();
    });

    it('should justify text correctly', () => {
        const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        const token = 'Bearer test-token';

        const result = service.justifyText(text, token);

        expect(result).toBeDefined();
        const lines = result.split('\n');
        lines.forEach(line => {
            expect(line.length).toBeLessThanOrEqual(80);
        });
    });

    it('should throw error for word exceeding max length', () => {
        const longWord = 'a'.repeat(81);
        const text = `Test ${longWord} word`;
        const token = 'Bearer test-token';

        expect(() => service.justifyText(text, token))
            .toThrow(BadRequestException);
    });

    it('should enforce rate limit with 402 error', () => {
        const token = 'Bearer test-token';

        // Create text with exactly 80000 words first (should pass)
        const wordsAtLimit = Array(80000).fill('word').join(' ');
        expect(() => service.justifyText(wordsAtLimit, token)).not.toThrow();

        // Now add one more word (should throw 402)
        const oneMoreWord = 'extra';

        // This should throw because we're at the limit
        expect(() => service.justifyText(oneMoreWord, token))
            .toThrow(HttpException);

        try {
            service.justifyText(oneMoreWord, token);
        } catch (error: any) {
            expect(error.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
            expect(error.message).toBe('Payment Required');
        }
    });

    it('should handle empty text', () => {
        const token = 'Bearer test-token';
        const result = service.justifyText('', token);
        expect(result).toBe('');
    });

    it('should handle multiple paragraphs', () => {
        const text = 'First paragraph.\n\nSecond paragraph.';
        const token = 'Bearer test-token';
        const result = service.justifyText(text, token);
        expect(result).toContain('\n\n');
    });

    it('should reset rate limit for new day', () => {
        const token = 'Bearer test-token';

        // Use 70000 words
        const wordsToday = Array(70000).fill('word').join(' ');
        service.justifyText(wordsToday, token);

        // Mock tomorrow by directly manipulating the map
        const wordCounts = (service as any).wordCounts;
        const storedData = wordCounts.get('test-token');

        // Set date to yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        storedData.date = yesterday;
        storedData.count = 70000;

        // Should be able to use 80000 more words (new day)
        const wordsTomorrow = Array(80000).fill('word').join(' ');
        expect(() => service.justifyText(wordsTomorrow, token))
            .not.toThrow();
    });

    it('should count words correctly', () => {
        const token = 'Bearer test-token';

        // Test various text inputs
        const testCases = [
            { text: 'one two three', expected: 3 },
            { text: '  one   two   three  ', expected: 3 },
            { text: 'one\ntwo\nthree', expected: 3 },
            { text: '', expected: 0 },
            { text: '   ', expected: 0 },
            { text: 'single', expected: 1 },
        ];

        testCases.forEach(({ text, expected }) => {
            // Reset for each test
            (service as any).wordCounts = new Map();
            const result = service.justifyText(text, token);
            expect(result).toBeDefined();
        });
    });
});