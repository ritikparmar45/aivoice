import fs from 'fs-extra';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { AppError } from '../utils/customErrors.js';

export class AnalysisService {
  /**
   * Helper to map file extension to supported audio MIME types.
   */
  static getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.wav':
        return 'audio/wav';
      case '.webm':
        return 'audio/webm';
      case '.ogg':
        return 'audio/ogg';
      case '.m4a':
        return 'audio/m4a';
      case '.mp4':
        return 'audio/mp4';
      default:
        return 'audio/mp3';
    }
  }

  /**
   * Analyze the pronunciation accuracy by feeding the audio and transcript to Gemini 2.5 Flash.
   * @param {string} filePath - Absolute path to the audio file.
   * @param {string} transcript - Transcription of the audio from SpeechToTextService.
   * @returns {Promise<object>} Parsed pronunciation analysis JSON.
   */
  static async analyzePronunciation(filePath, transcript) {
    if (!env.GEMINI_API_KEY) {
      throw new AppError('Gemini API key is not configured.', 500);
    }

    try {
      const fileExists = await fs.pathExists(filePath);
      if (!fileExists) {
        throw new AppError('Audio file not found for Gemini analysis.', 400);
      }

      // Initialize the Gemini client
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

      // Read file and convert to Base64
      const fileBuffer = await fs.readFile(filePath);
      const base64Data = fileBuffer.toString('base64');
      const mimeType = this.getMimeType(filePath);

      const systemInstruction = `You are a Senior staff English Phonetics Coach and AI Evaluator.
Your goal is to assess the pronunciation accuracy of the speaker in the audio file.
You will compare the provided transcript with their spoken audio.
Analyze syllable stress, vowel/consonant clarity, sound omissions, and phoneme substitutions.

Evaluate the overall pronunciation accuracy from 0 to 100.
Identify all mispronounced words. For each mispronounced word, return:
- word: The exact word matching the spelling in the transcript.
- issue: The core category of error (e.g. "Vowel reduction distortion", "Consonant omission", "Stress placement error", "Monophthongization").
- explanation: A concise, technical description of the mistake.
- suggestion: Practical tips on how to correctly pronounce the sound (e.g. lip/tongue placement, phonetic comparison).
- severity: "low" (minor accent/slight variation), "medium" (noticeable mistake), or "high" (destroys intelligibility).

You must return your response strictly as a JSON object matching the following Schema:
{
  "overallScore": <integer between 0 and 100>,
  "confidenceLevel": <"High" | "Medium" | "Low">,
  "transcript": <string, copy of the exact original transcript provided>,
  "mispronouncedWords": [
    {
      "word": <string>,
      "issue": <string>,
      "explanation": <string>,
      "suggestion": <string>,
      "severity": <"low" | "medium" | "high">
    }
  ]
}

If the speaker had perfect pronunciation, "mispronouncedWords" must be an empty array. Do not return markdown block quotes (like \`\`\`json) in your final response.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          `Assess the pronunciation of the audio compared to this transcript: "${transcript}"`
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.1, // Low temperature for deterministic grading
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini returned an empty response.');
      }

      // Parse JSON output
      try {
        const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysisData = JSON.parse(cleanedJsonText);
        return analysisData;
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON output. Raw output:', responseText);
        throw new Error('Failed to parse analysis results due to format error.');
      }
    } catch (error) {
      console.error('Gemini 2.5 Flash Analysis Error:', error);
      throw new AppError(`Pronunciation analysis failed: ${error.message}`, 500);
    }
  }
}
export default AnalysisService;
