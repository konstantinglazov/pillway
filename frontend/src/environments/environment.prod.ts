// Values are injected at build time by webpack DefinePlugin reading frontend/.env.production
// Edit frontend/.env.production to change them — no keys are stored in this file.

declare const __env__: {
  API_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GOOGLE_MAPS_API_KEY: string;
};

export const environment = {
  production: true,
  apiUrl: __env__.API_URL,
  supabaseUrl: __env__.SUPABASE_URL,
  supabaseAnonKey: __env__.SUPABASE_ANON_KEY,
  googleMapsApiKey: __env__.GOOGLE_MAPS_API_KEY,
};
