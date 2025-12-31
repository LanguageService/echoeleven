import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

let elevenlabs: ElevenLabsClient | null = null;

function getElevenLabsClient(): ElevenLabsClient {
  if (!elevenlabs) {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured. Please add your ElevenLabs API key.');
    }
    elevenlabs = new ElevenLabsClient({
      apiKey: ELEVENLABS_API_KEY,
    });
  }
  return elevenlabs;
}

const ELEVENLABS_VOICES: Record<string, string> = {
  "Rachel": "21m00Tcm4TlvDq8ikWAM",
  "Drew": "29vD33N1CtxCmqQRPOHJ",
  "Clyde": "2EiwWnXFnvU5JabPnv8n",
  "Paul": "5Q0t7uMcjvnagumLfvZi",
  "Domi": "AZnzlk1XvdvUeBnXmlld",
  "Dave": "CYw3kZ02Hs0563khs1Fj",
  "Fin": "D38z5RcWu1voky8WS1ja",
  "Sarah": "EXAVITQu4vr4xnSDxMaL",
  "Antoni": "ErXwobaYiN019PkySvjV",
  "Thomas": "GBv7mTt0atIp3Br8iCZE",
  "Charlie": "IKne3meq5aSn9XLyUdCD",
  "George": "JBFqnCBsd6RMkjVDRZzb",
  "Emily": "LcfcDJNUP1GQjkzn1xUU",
  "Elli": "MF3mGyEYCl7XYWbV9V6O",
  "Callum": "N2lVS1w4EtoT3dr4eOWO",
  "Patrick": "ODq5zmih8GrVes37Dizd",
  "Harry": "SOYHLrjzK2X1ezoPC6cr",
  "Liam": "TX3LPaxmHKxFdv7VOQHJ",
  "Dorothy": "ThT5KcBeYPX3keUQqHPh",
  "Josh": "TxGEqnHWrfWFTfGW9XjX",
  "Arnold": "VR6AewLTigWG4xSOukaG",
  "Charlotte": "XB0fDUnXU5powFXDhCwa",
  "Alice": "Xb7hH8MSUJpSbSDYk0k2",
  "Matilda": "XrExE9yKIg1WjnnlVkGX",
  "James": "ZQe5CZNOzWyzPSCn5a3c",
  "Joseph": "Zlb1dXrM653N07WRdFW3",
  "Jeremy": "bVMeCyTHy58xNoL34h3p",
  "Michael": "flq6f7yk4E4fJM5XTYuZ",
  "Ethan": "g5CIjZEefAph4nQFvHAz",
  "Chris": "iP95p4xoKVk53GoZ742B",
  "Gigi": "jBpfuIE2acCO8z3wKNLl",
  "Freya": "jsCqWAovK2LkecY7zXl4",
  "Brian": "nPczCjzI2devNBz1zQrb",
  "Grace": "oWAxZDx7w5VEj9dCyTzz",
  "Daniel": "onwK4e9ZLuTAKqWW03F9",
  "Lily": "pFZP5JQG7iQjIQuC4Bku",
  "Serena": "pMsXgVXv3BLzUgSXRplE",
  "Adam": "pNInz6obpgDQGcFmaJgB",
  "Nicole": "piTKgcLEGmPE4e6mEKli",
  "Bill": "pqHfZKP75CvOlQylNhV4",
  "Jessie": "t0jbNlBVZ17f02VDIeMI",
  "Sam": "yoZ06aMxZJJ28mfd3POQ",
};

export const getElevenLabsVoiceId = (voiceName: string): string => {
  return ELEVENLABS_VOICES[voiceName] || ELEVENLABS_VOICES["Rachel"];
};

export const getElevenLabsVoiceNames = (): string[] => {
  return Object.keys(ELEVENLABS_VOICES);
};

export const elevenLabsVoiceOptions = Object.entries(ELEVENLABS_VOICES).map(([name, id]) => ({
  value: name,
  label: name,
  voiceId: id
}));

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  return Buffer.concat(chunks);
}

export class ElevenLabsService {
  private clonedVoices: Map<string, string> = new Map();
  
  async textToSpeech(
    text: string, 
    voiceName: string = 'Rachel',
    modelId: string = 'eleven_v3',
    clonedVoiceId?: string
  ): Promise<{ audioBuffer: Buffer; duration: number }> {
    try {
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not configured');
      }
      
      console.log(`[ElevenLabs] Generating TTS for text: "${text.substring(0, 50)}..."`);
      console.log(`[ElevenLabs] Using voice: ${voiceName}, model: ${modelId}, clonedVoiceId: ${clonedVoiceId || 'none'}`);
      
      // Use cloned voice ID if provided, otherwise fall back to preset voices
      const voiceId = clonedVoiceId || this.clonedVoices.get(voiceName) || getElevenLabsVoiceId(voiceName);
      console.log(`[ElevenLabs] Resolved voiceId: ${voiceId}`);
      
      const startTime = performance.now();
      
      const client = getElevenLabsClient();
      const audioStream = await client.textToSpeech.convert(voiceId, {
        text,
        modelId: modelId,
        outputFormat: 'mp3_44100_128',
      });
      
      const audioBuffer = await streamToBuffer(audioStream);
      const duration = performance.now() - startTime;
      
      console.log(`[ElevenLabs] TTS generated successfully, size: ${audioBuffer.length} bytes, duration: ${duration.toFixed(0)}ms`);
      
      return { audioBuffer, duration };
    } catch (error) {
      console.error('[ElevenLabs] Text-to-speech error:', error);
      throw new Error('Failed to synthesize speech with ElevenLabs. Please try again.');
    }
  }
  
  async cloneVoice(
    audioBuffer: Buffer,
    voiceName: string = 'User Voice',
    description: string = 'Cloned voice from user recording'
  ): Promise<{ voiceId: string; voiceName: string }> {
    try {
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not configured');
      }
      
      console.log(`[ElevenLabs] Cloning voice: ${voiceName}`);
      
      const formData = new FormData();
      formData.append('name', voiceName);
      formData.append('description', description);
      
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('files', audioBlob, 'voice_sample.wav');
      
      const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Voice cloning failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json() as { voice_id: string };
      const voiceId = result.voice_id;
      
      this.clonedVoices.set(voiceName, voiceId);
      
      console.log(`[ElevenLabs] Voice cloned successfully, voiceId: ${voiceId}`);
      
      return { voiceId, voiceName };
    } catch (error) {
      console.error('[ElevenLabs] Voice cloning error:', error);
      throw new Error('Failed to clone voice with ElevenLabs. Please try again.');
    }
  }
  
  async speechToSpeech(
    audioBuffer: Buffer,
    targetVoiceId: string,
    modelId: string = 'eleven_multilingual_sts_v2'
  ): Promise<{ audioBuffer: Buffer; duration: number }> {
    try {
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not configured');
      }
      
      console.log(`[ElevenLabs] Speech-to-speech conversion with voice: ${targetVoiceId}`);
      
      const startTime = performance.now();
      
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      
      const client = getElevenLabsClient();
      const audioStream = await client.speechToSpeech.convert(targetVoiceId, {
        audio: audioBlob,
        modelId: modelId,
        outputFormat: 'mp3_44100_128',
      });
      
      const resultBuffer = await streamToBuffer(audioStream);
      const duration = performance.now() - startTime;
      
      console.log(`[ElevenLabs] Speech-to-speech completed, size: ${resultBuffer.length} bytes, duration: ${duration.toFixed(0)}ms`);
      
      return { audioBuffer: resultBuffer, duration };
    } catch (error) {
      console.error('[ElevenLabs] Speech-to-speech error:', error);
      throw new Error('Failed to convert speech with ElevenLabs. Please try again.');
    }
  }
  
  async deleteClonedVoice(voiceId: string): Promise<void> {
    try {
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not configured');
      }
      
      const client = getElevenLabsClient();
      await client.voices.delete(voiceId);
      
      const entries = Array.from(this.clonedVoices.entries());
      for (const [name, id] of entries) {
        if (id === voiceId) {
          this.clonedVoices.delete(name);
          break;
        }
      }
      
      console.log(`[ElevenLabs] Voice deleted: ${voiceId}`);
    } catch (error) {
      console.error('[ElevenLabs] Voice deletion error:', error);
      throw new Error('Failed to delete cloned voice.');
    }
  }
  
  getClonedVoiceId(voiceName: string): string | undefined {
    return this.clonedVoices.get(voiceName);
  }
  
  setClonedVoice(voiceName: string, voiceId: string): void {
    this.clonedVoices.set(voiceName, voiceId);
  }
  
  async listVoices(): Promise<Array<{ voiceId: string; name: string; category: string }>> {
    try {
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not configured');
      }
      
      const client = getElevenLabsClient();
      const response = await client.voices.getAll();
      
      return response.voices?.map(voice => ({
        voiceId: voice.voiceId!,
        name: voice.name!,
        category: voice.category || 'unknown'
      })) || [];
    } catch (error) {
      console.error('[ElevenLabs] List voices error:', error);
      throw new Error('Failed to list voices.');
    }
  }
}

export const elevenLabsService = new ElevenLabsService();
