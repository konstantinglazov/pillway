// Values are injected at build time by webpack DefinePlugin (webpack.config.js).
// Edit frontend/.env to change them — no keys are stored in this file.

// Tells TypeScript about the compile-time constant; replaced by literal
// strings before the bundle is written, so __env__ never runs in the browser.
declare const __env__: {
  API_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GOOGLE_MAPS_API_KEY: string;
};

export const environment = {
  production: false,
  apiUrl: __env__.API_URL,
  supabaseUrl: __env__.SUPABASE_URL,
  supabaseAnonKey: __env__.SUPABASE_ANON_KEY,
  googleMapsApiKey: __env__.GOOGLE_MAPS_API_KEY,
};
