import { Test, TestingModule } from '@nestjs/testing';
import { TTSService } from '../src/modules/sensei/tts.service';

// ── Mock external dependencies ──────────────────────────────────────────────
jest.mock('google-tts-api', () => ({
    getAudioBase64: jest.fn(),
}));

jest.mock('fs/promises', () => ({
    readFile: jest.fn(),
    unlink: jest.fn(),
}));

jest.mock('child_process', () => ({
    exec: jest.fn(),
}));

jest.mock('util', () => ({
    promisify: (fn: any) => fn,  // returns the mock fn itself
}));

import * as googleTTS from 'google-tts-api';
import * as fs from 'fs/promises';

// The exec mock used by execAsync (after promisify)
const mockExecAsync = jest.fn();
jest.mock('child_process', () => ({
    exec: (...args: any[]) => mockExecAsync(...args),
}));

describe('TTSService', () => {
    let service: TTSService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TTSService],
        }).compile();

        service = module.get<TTSService>(TTSService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAudioBase64', () => {
        describe('with Google TTS (default / non-Neural voice)', () => {
            it('should return base64 audio via Google TTS when voice is "google-translate"', async () => {
                const fakeBase64 = 'AAAA/google-base64==';
                (googleTTS.getAudioBase64 as jest.Mock).mockResolvedValue(fakeBase64);

                const result = await service.getAudioBase64('こんにちは');

                expect(googleTTS.getAudioBase64).toHaveBeenCalledWith('こんにちは', {
                    lang: 'ja',
                    slow: false,
                    host: 'https://translate.google.com',
                    timeout: 10000,
                });
                expect(result).toBe(`data:audio/mpeg;base64,${fakeBase64}`);
            });

            it('should use Google TTS when non-Neural voice is explicitly passed', async () => {
                const fakeBase64 = 'BBBB/google-base64==';
                (googleTTS.getAudioBase64 as jest.Mock).mockResolvedValue(fakeBase64);

                const result = await service.getAudioBase64('日本語', 'google-translate');

                expect(googleTTS.getAudioBase64).toHaveBeenCalled();
                expect(result).toBe(`data:audio/mpeg;base64,${fakeBase64}`);
            });
        });

        describe('with Edge TTS (Neural voice)', () => {
            it('should fall back to Google TTS when Edge TTS fails for a Neural voice', async () => {
                // Edge TTS will fail (exec throws)
                mockExecAsync.mockRejectedValue(new Error('edge-tts not found'));

                // Google TTS fallback succeeds
                const fallbackBase64 = 'CCCC/fallback-base64==';
                (googleTTS.getAudioBase64 as jest.Mock).mockResolvedValue(fallbackBase64);

                const result = await service.getAudioBase64('テスト', 'ja-JP-NanamiNeural');

                // Google TTS should have been called as fallback
                expect(googleTTS.getAudioBase64).toHaveBeenCalled();
                expect(result).toBe(`data:audio/mpeg;base64,${fallbackBase64}`);
            });
        });

        describe('error handling', () => {
            it('should propagate Google TTS errors when it throws', async () => {
                (googleTTS.getAudioBase64 as jest.Mock).mockRejectedValue(
                    new Error('Google TTS rate limited'),
                );

                await expect(service.getAudioBase64('エラー')).rejects.toThrow(
                    'Google TTS rate limited',
                );
            });
        });
    });
});
