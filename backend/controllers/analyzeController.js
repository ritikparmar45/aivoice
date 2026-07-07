import fs from 'fs-extra';
import SpeechToTextService from '../services/speechToTextService.js';
import AnalysisService from '../services/analysisService.js';
import { AppError } from '../utils/customErrors.js';

/**
 * Controller to handle transcription, analysis, and cleaning of file resources.
 */
export const analyzeAudio = async (req, res, next) => {
  const filePath = req.file.path;

  try {
    console.log(`🎙️ Audio received: "${req.file.filename}". Initiating speech transcription...`);
    const transcript = await SpeechToTextService.transcribe(filePath);
    
    console.log(`🤖 Speech text transcribed. Initiating Gemini pronunciation evaluation...`);
    const analysis = await AnalysisService.analyzePronunciation(filePath, transcript);

    console.log('✅ Analysis workflow finalized. Compiling response payload...');
    
    res.status(200).json({
      status: 'success',
      message: 'Pronunciation analysis completed successfully.',
      data: {
        overallScore: typeof analysis.overallScore === 'number' ? analysis.overallScore : 0,
        confidenceLevel: analysis.confidenceLevel || 'High',
        transcript: analysis.transcript || transcript,
        mispronouncedWords: Array.isArray(analysis.mispronouncedWords) ? analysis.mispronouncedWords : [],
        audioDuration: req.audioDuration ? Math.round(req.audioDuration) : null,
      },
    });
  } catch (error) {
    console.error('Error in analyzeAudio controller processing:', error);
    next(error);
  } finally {
    // DPDP Enforcement: Always delete the uploaded audio file immediately after processing.
    try {
      const fileExists = await fs.pathExists(filePath);
      if (fileExists) {
        await fs.remove(filePath);
        console.log(`🗑️ DPDP Compliance: File cleanly deleted from storage: ${filePath}`);
      }
    } catch (cleanupError) {
      console.error(`❌ DPDP Warning: Failed to clean up file at path: ${filePath}`, cleanupError);
    }
  }
};
export default analyzeAudio;
