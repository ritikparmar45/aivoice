import { BadRequestError } from '../utils/customErrors.js';

/**
 * Middleware to check if the user has checked and consented to the DPDP agreement.
 */
export const consentValidator = (req, res, next) => {
  const consentField = req.body.consent;

  if (consentField !== 'true' && req.headers['x-consent-agreed'] !== 'true') {
    return next(
      new BadRequestError(
        'DPDP compliance error: Explicit data processing consent is required before files are parsed or uploaded.'
      )
    );
  }

  next();
};
export default consentValidator;
