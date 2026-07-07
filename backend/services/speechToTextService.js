import fs from 'fs-extra';
import { Blob } from 'buffer';
import axios from 'axios';
import { env } from '../config/env.js';
import { AppError } from '../utils/customErrors.js';

export class SpeechToTextService {
  /**
   * Transcribe an audio file using either Groq Whisper (preferred) or OpenAI Whisper.
   * @param {string} filePath - Absolute path to the audio file.
   * @returns {Promise<string>} Transcribed text.
   */
  static async transcribe(filePath) {
    if (env.GROQ_API_KEY) {
      return this.transcribeWithGroq(filePath);
    } else if (env.OPENAI_API_KEY) {
      return this.transcribeWithOpenAI(filePath);
    } else {
      throw new AppError('No transcription API keys configured. Set GROQ_API_KEY or OPENAI_API_KEY.', 500);
    }
  }

  /**
   * Transcribe audio using Groq Whisper.
   */
  static async transcribeWithGroq(filePath) {
    try {
      const fileExists = await fs.pathExists(filePath);
      if (!fileExists) {
        throw new AppError('Audio file not found for transcription.', 400);
      }

      const fileBuffer = await fs.readFile(filePath);
      const fileBlob = new Blob([fileBuffer], { type: 'audio/mpeg' });
      
      const formData = new FormData();
      formData.append('file', fileBlob, 'audio.mp3');
      formData.append('model', 'whisper-large-v3');
      formData.append('response_format', 'json');

      const response = await axios.post(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        formData,
        {
          headers: {
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
          },
        }
      );

      if (response.data && response.data.text) {
        return response.data.text.trim();
      } else {
        throw new Error('Transcription response did not contain text.');
      }
    } catch (error) {
      console.error('Groq Whisper STT Error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.error?.message || error.message;
      throw new AppError(`Groq Whisper transcription failed: ${errorMsg}`, 500);
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper.
   */
  static async transcribeWithOpenAI(filePath) {
    try {
      const fileExists = await fs.pathExists(filePath);
      if (!fileExists) {
        throw new AppError('Audio file not found for transcription.', 400);
      }

      const fileBuffer = await fs.readFile(filePath);
      const fileBlob = new Blob([fileBuffer], { type: 'audio/mpeg' });
      
      const formData = new FormData();
      formData.append('file', fileBlob, 'audio.mp3');
      formData.append('model', 'whisper-1');

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          },
        }
      );

      if (response.data && response.data.text) {
        return response.data.text.trim();
      } else {
        throw new Error('Transcription response did not contain text.');
      }
    } catch (error) {
      console.error('OpenAI Whisper STT Error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.error?.message || error.message;
      throw new AppError(`OpenAI Whisper transcription failed: ${errorMsg}`, 500);
    }
  }
}
export default SpeechToTextService;
