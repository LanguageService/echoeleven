import { GoogleGenAI, Modality } from "@google/genai";
import { elevenLabsService } from "./elevenlabs.js";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "default_key",
});

const USE_ELEVENLABS_TTS = true;

const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'zh': 'Chinese',
  'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic', 'hi': 'Hindi', 'pt': 'Portuguese',
  'ru': 'Russian', 'it': 'Italian', 'rw': 'Kinyarwanda', 'sw': 'Swahili', 'am': 'Amharic',
  'yo': 'Yoruba', 'ha': 'Hausa', 'ig': 'Igbo'
};

const getLanguageName = (code: string) => LANGUAGE_NAMES[code] || code;

interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

function parseMimeType(mimeType: string): WavConversionOptions {
  const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
  const [_, format] = fileType.split('/');

  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
    bitsPerSample: 16, // Default for L16
    sampleRate: 24000, // Default from Gemini
  };

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map(s => s.trim());
    if (key === 'rate') {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
}

function createWavHeader(dataLength: number, options: WavConversionOptions): Buffer {
  const { numChannels, sampleRate, bitsPerSample } = options;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

function convertToWav(rawData: string, mimeType: string): Buffer {
  const options = parseMimeType(mimeType);
  const buffer = Buffer.from(rawData, 'base64');
  const wavHeader = createWavHeader(buffer.length, options);
  return Buffer.concat([wavHeader, buffer]);
}

export class SpeechService {
  async audioToTranslatedText(audioBuffer: Buffer, sourceLanguage: string, targetLanguage: string, model: string = 'gemini-2.5-flash', selectedLanguages?: { source: string; target: string }): Promise<{ translatedText: string; detectedSourceLanguage?: string; targetLanguage: string; duration: number }> {
    try {
      console.log('🚀 SPEECH SERVICE - Converting audio directly to translated text using Gemini...');
      console.log('sourceLanguage:', sourceLanguage);
      console.log('targetLanguage:', targetLanguage);
      console.log('selectedLanguages:', selectedLanguages);
      
      // Convert audio buffer to base64
      const base64Audio = audioBuffer.toString('base64');

      // Prepare the prompt for direct audio-to-translation
      let prompt: string;
      if (sourceLanguage === 'auto') {
        // For auto mode, we don't know which language is being spoken
        // Just tell Gemini to translate to the other language from the pair
        if (selectedLanguages) {
          const lang1 = getLanguageName(selectedLanguages.source);
          const lang2 = getLanguageName(selectedLanguages.target);
          
          prompt = `You are a translator. Listen to this audio. If the speech is ${lang1}, output the ${lang2} translation. If the speech is ${lang2}, output the ${lang1} translation. Do not transcribe or output the same language you hear - only translate to the opposite language.`;
          console.log('Generated prompt:', prompt);
        } else {
          // Fallback - just translate to the specified target language
          console.log('No selectedLanguages provided, using fallback');
          const targetName = getLanguageName(targetLanguage);
          prompt = `Listen to this audio and translate it to ${targetName}. Provide only the translation, no other text. Do not transcribe - only translate.`;
          console.log('Fallback prompt:', prompt);
        }
      } else {
        const sourceName = getLanguageName(sourceLanguage);
        const targetName = getLanguageName(targetLanguage);
        prompt = `Translate this ${sourceName} audio directly to ${targetName}. Provide only the ${targetName} translation, no other text. Do not transcribe - only translate.`;
      }

      const contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio,
          },
        },
      ];

      const startTime = performance.now();
      const response = await gemini.models.generateContent({
        model: model,
        contents: contents,
      });
      const duration = performance.now() - startTime;
      const translatedText = response.text?.trim();

      if (!translatedText) {
        throw new Error('No translation returned from Gemini');
      }

      console.log('Direct audio translation successful:', translatedText);

      // For auto-detect, determine source and target languages based on result
      let detectedSourceLanguage: string | undefined;

      if (sourceLanguage === 'auto') {
        // For auto mode, we need to detect the source language from the original audio
        // For now, we'll return the target language as specified
        detectedSourceLanguage = undefined; // Could implement language detection later
        // targetLanguage is already passed as parameter
      } else {
        // targetLanguage is already passed as parameter
      }

      return { translatedText, detectedSourceLanguage, targetLanguage, duration };
    } catch (error) {
      console.error('Direct audio translation error:', error);
      throw new Error('Failed to translate audio directly. Please try again.');
    }
  }

  async speechToText(audioBuffer: Buffer, language: string, model: string = 'gemini-2.5-flash', selectedLanguages?: { source: string; target: string }): Promise<{ text: string; detectedLanguage?: string; duration: number; langDetectDuration: number }> {
    try {
      console.log('Converting speech to text using Gemini...');
      
      // Convert audio buffer to base64
      const base64Audio = audioBuffer.toString('base64');

      // Prepare the prompt based on language
      let languagePrompt: string;
      if (language === 'auto') {
        if (selectedLanguages) {
          const lang1 = getLanguageName(selectedLanguages.source);
          const lang2 = getLanguageName(selectedLanguages.target);
          languagePrompt = `Generate a transcript of this speech. The audio contains either ${lang1} or ${lang2}. Please transcribe it accurately in the detected language.`;
        } else {
          languagePrompt = 'Generate a transcript of this speech. Please transcribe it accurately in the detected language.';
        }
      } else {
        const langName = getLanguageName(language);
        languagePrompt = `Generate a transcript of this ${langName} speech.`;
      }

      const contents = [
        { text: languagePrompt },
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio,
          },
        },
      ];

      const startTime = performance.now();
      const response = await gemini.models.generateContent({
        model: model,
        contents: contents,
      });
      let duration = performance.now() - startTime;
      const transcript = response.text?.trim();

      if (!transcript) {
        throw new Error('No transcript returned from Gemini');
      }

      console.log('Transcription successful:', transcript);

      // For auto-detect, try to determine the language of the transcribed text
      let detectedLanguage: string | undefined;
      let langDetectDuration = 0;
      if (language === 'auto') {
        if (selectedLanguages) {
          const langDetectResult = await this.detectLanguage(transcript, selectedLanguages);
          detectedLanguage = langDetectResult.language;
          langDetectDuration = langDetectResult.duration;
        }
        console.log('Detected language:', detectedLanguage);
      }

      return { text: transcript, detectedLanguage, duration, langDetectDuration };
    } catch (error) {
      console.error('Speech-to-text error:', error);
      throw new Error('Failed to transcribe audio. Please check your audio input and try again.');
    }
  }

  private async detectLanguage(text: string, languages: { source: string; target: string }): Promise<{ language: string | undefined, duration: number }> {
    try {
      const startTime = performance.now();
      const lang1Name = getLanguageName(languages.source);
      const lang2Name = getLanguageName(languages.target);
      const lang1Code = languages.source;
      const lang2Code = languages.target;

      const prompt = `Analyze this text and determine if it's written in ${lang1Name} or ${lang2Name}. Respond with only "${lang1Code}" for ${lang1Name} or "${lang2Code}" for ${lang2Name}. Do not add any other text or markdown.

Text: "${text}"`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ text: prompt }],
      });
      const duration = performance.now() - startTime;

      const result = response.text?.trim().toLowerCase();
      if (result === lang1Code || result === lang2Code) {
        return { language: result, duration };
      }
      
      console.warn(`Language detection failed to identify between ${lang1Code} and ${lang2Code}. Result was: ${result}`);
      return { language: undefined, duration };
    } catch (error) {
      console.error('Language detection error:', error);
      return { language: undefined, duration: 0 };
    }
  }

  async textToSpeech(text: string, language: string, voiceName: string = 'Rachel', clonedVoiceId?: string): Promise<{ audioBuffer: Buffer; duration: number }> {
    if (USE_ELEVENLABS_TTS) {
      return this.textToSpeechElevenLabs(text, language, voiceName, clonedVoiceId);
    }
    return this.textToSpeechGemini(text, language, voiceName);
  }

  private async textToSpeechElevenLabs(text: string, language: string, voiceName: string = 'Rachel', clonedVoiceId?: string): Promise<{ audioBuffer: Buffer; duration: number }> {
    try {
      console.log(`[ElevenLabs TTS] Generating speech for text: "${text.substring(0, 50)}..." in language: ${language}`);
      console.log(`[ElevenLabs TTS] Using voice: ${voiceName}, clonedVoiceId: ${clonedVoiceId || 'none'}`);
      
      const result = await elevenLabsService.textToSpeech(text, voiceName, 'eleven_v3', clonedVoiceId);
      
      console.log(`[ElevenLabs TTS] Audio generated successfully, size: ${result.audioBuffer.length} bytes`);
      return result;
    } catch (error) {
      console.error('[ElevenLabs TTS] Error:', error);
      throw new Error('Failed to synthesize speech with ElevenLabs. Please try again.');
    }
  }

  private async textToSpeechGemini(text: string, language: string, voiceName: string = 'Zephyr'): Promise<{ audioBuffer: Buffer; duration: number }> {
    const GEMINI_VOICES: Record<string, string> = {
      "Rachel": "Zephyr",
      "Drew": "Aoede",
      "Paul": "Algieba",
      "Sarah": "Iapetus",
      "Charlie": "Sulafat",
      "George": "Achird",
      "Emily": "Autonoe",
      "Liam": "Puck",
      "Josh": "Kore",
      "James": "Charon",
      "Brian": "Schedar",
      "Daniel": "Enceladus",
      "Grace": "Despina",
      "Adam": "Umbriel"
    };
    
    try {
      console.log(`[Gemini TTS] Generating speech for text: "${text}" in language: ${language}`);
      
      const geminiVoice = GEMINI_VOICES[voiceName] || 'Zephyr';
      console.log(`[Gemini TTS] Using voice: ${voiceName} -> ${geminiVoice}`);
      
      const config = {
        temperature: 1,
        responseModalities: ['audio' as const],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: geminiVoice,
            }
          }
        },
      };

      const contents = [{
        role: 'user' as const,
        parts: [{ text }],
      }];

      console.log('[Gemini TTS] Sending TTS request...');
      const startTime = performance.now();
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        config,
        contents,
      });
      const duration = performance.now() - startTime;
      
      console.log('[Gemini TTS] Received response');
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No candidates found in Gemini TTS response');
      }

      const candidate = response.candidates[0];
      
      if (!candidate.content || !candidate.content.parts) {
        throw new Error(`TTS generation failed: ${candidate.finishReason || 'Unknown reason'}`);
      }

      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || '';
          const data = part.inlineData.data;
          
          let audioBuffer: Buffer;
          if (mimeType.includes('L16') || mimeType.includes('pcm')) {
            audioBuffer = convertToWav(data, mimeType);
          } else if (mimeType.includes('wav')) {
            audioBuffer = Buffer.from(data, 'base64');
          } else {
            audioBuffer = convertToWav(data, mimeType);
          }
          
          console.log('[Gemini TTS] Audio generated successfully, size:', audioBuffer.length);
          return { audioBuffer, duration };
        }
      }

      throw new Error('No audio data generated by Gemini TTS service');
    } catch (error) {
      console.error('[Gemini TTS] Error:', error);
      throw new Error('Failed to synthesize speech. Please try again.');
    }
  }

  async cloneVoice(audioBuffer: Buffer, voiceName: string = 'User Voice'): Promise<{ voiceId: string; voiceName: string }> {
    return elevenLabsService.cloneVoice(audioBuffer, voiceName);
  }
}

export const speechService = new SpeechService();
