// Values are injected at build time by webpack DefinePlugin (webpack.config.js).
// Edit frontend/.env to change them — no keys are stored in this file.
declare const __env__: { API_URL: string; GOOGLE_MAPS_API_KEY: string; };

export const environment = {
  production:       false,
  apiUrl:           __env__.API_URL,
  googleMapsApiKey: __env__.GOOGLE_MAPS_API_KEY,
};
