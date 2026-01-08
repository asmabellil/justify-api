import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class JustifyService {
    private readonly MAX_LINE_LENGTH = 80;
    private readonly DAILY_WORD_LIMIT = 80000;
    private wordCounts = new Map<string, { date: Date; count: number }>();

    justifyText(text: string, token: string): string {
        // Extraire le token depuis "Bearer <token>"
        const cleanToken = this.extractToken(token);

        this.checkRateLimit(cleanToken, text);

        const paragraphs = text.split('\n\n');
        const justifiedParagraphs = paragraphs.map(paragraph =>
            this.justifyParagraph(paragraph.trim())
        );

        return justifiedParagraphs.join('\n\n');
    }

    private extractToken(authHeader: string): string {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new BadRequestException('Invalid authorization header');
        }
        return authHeader.substring(7); // Remove "Bearer "
    }

    private justifyParagraph(paragraph: string): string {
        if (!paragraph) return '';

        const words = paragraph.split(/\s+/).filter(word => word.length > 0);

        if (words.length === 0) return '';

        const lines: string[] = [];
        let currentLine: string[] = [];
        let currentLength = 0;

        for (const word of words) {
            if (word.length > this.MAX_LINE_LENGTH) {
                throw new BadRequestException(
                    `Word "${word}" exceeds maximum line length of ${this.MAX_LINE_LENGTH} characters`
                );
            }

            // Check if adding this word would exceed the line length
            const spaceNeeded = currentLine.length > 0 ? 1 : 0;
            const potentialLength = currentLength + spaceNeeded + word.length;

            if (potentialLength > this.MAX_LINE_LENGTH) {
                if (currentLine.length === 0) {
                    currentLine.push(word);
                    lines.push(this.createJustifiedLine(currentLine));
                    currentLine = [];
                    currentLength = 0;
                } else {
                    lines.push(this.createJustifiedLine(currentLine));
                    currentLine = [word];
                    currentLength = word.length;
                }
            } else {
                currentLine.push(word);
                currentLength += spaceNeeded + word.length;
            }
        }

        if (currentLine.length > 0) {
            lines.push(currentLine.join(' '));
        }

        return lines.join('\n');
    }

    private createJustifiedLine(words: string[]): string {
        if (words.length === 1) {
            return words[0].padEnd(this.MAX_LINE_LENGTH, ' ');
        }

        const totalSpacesNeeded = this.MAX_LINE_LENGTH -
            words.reduce((sum, word) => sum + word.length, 0);

        const gaps = words.length - 1;
        const baseSpaces = Math.floor(totalSpacesNeeded / gaps);
        const extraSpaces = totalSpacesNeeded % gaps;

        let justifiedLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const spaces = baseSpaces + (i <= extraSpaces ? 1 : 0);
            justifiedLine += ' '.repeat(spaces) + words[i];
        }

        return justifiedLine;
    }

    private checkRateLimit(token: string, text: string): void {
        const today = new Date();
        const todayKey = today.toDateString();
        const wordCount = this.countWords(text);

        if (!this.wordCounts.has(token)) {
            this.wordCounts.set(token, {
                date: today,
                count: wordCount
            });
            return;
        }

        const userData = this.wordCounts.get(token)!;

        // Reset counter if it's a new day
        if (userData.date.toDateString() !== todayKey) {
            userData.date = today;
            userData.count = wordCount;
            return;
        }

        const newWordCount = userData.count + wordCount;

        // Check if exceeding daily limit
        if (newWordCount > this.DAILY_WORD_LIMIT) {
            throw new HttpException(
                'Payment Required',
                HttpStatus.PAYMENT_REQUIRED
            );
        }

        // Update count
        userData.count = newWordCount;
    }

    private countWords(text: string): number {
        if (!text || text.trim().length === 0) return 0;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }
}