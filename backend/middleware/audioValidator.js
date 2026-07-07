import * as mm from 'music-metadata';
import fs from 'fs-extra';
import { BadRequestError } from '../utils/customErrors.js';

/**
 * Middleware to validate uploaded audio file properties (existence and duration constraint of 30-45 seconds).
 * Cleans up temporary files instantly on failure.
 */
export const audioValidator = async (req, res, next) => {
  if (!req.file) {
    return next(new BadRequestError('Audio file is required. Please upload a speech recording.'));
  }

  const filePath = req.file.path;

  try {
    // Parse metadata
    const metadata = await mm.parseFile(filePath);
    const duration = metadata.format.duration;

    if (duration === undefined) {
      await fs.remove(filePath);
      return next(
        new BadRequestError('Unsupported format: Unable to extract audio duration metadata.')
      );
    }

    // Enforce 30-45 seconds constraint
    if (duration < 30 || duration > 45) {
      await fs.remove(filePath);
      return next(
        new BadRequestError(
          `Validation failed: Audio duration must be between 30 and 45 seconds. Provided audio is ${Math.round(
            duration
          )} seconds.`
        )
      );
    }

    // Attach parsed duration to the request object
    req.audioDuration = duration;
    next();
  } catch (error) {
    console.error('Audio validation parsing error:', error);
    
    // Safety cleanup of uploaded file
    await fs.remove(filePath).catch((err) =>
      console.error(`Failed to delete file on validation catch: ${err.message}`)
    );
    
    next(
      new BadRequestError(
        `Failed to parse audio file structure. Ensure it is a valid audio format. Details: ${error.message}`
      )
    );
  }
};
export default audioValidator;
