const webpack = require('webpack');
const path = require('path');

// Load .env.production for prod builds, .env for everything else.
const envFile = process.env['NODE_ENV'] === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

/**
 * Custom webpack config loaded by @angular-builders/custom-webpack.
 *
 * DefinePlugin performs a compile-time text replacement:
 * every __env__.KEY reference in TypeScript source is swapped for the
 * literal string value from the .env file before the bundle is written.
 * The browser never sees process.env or any Node.js APIs.
 */
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      __env__: {
        API_URL:             JSON.stringify(process.env['API_URL']             || ''),
        SUPABASE_URL:        JSON.stringify(process.env['SUPABASE_URL']        || ''),
        SUPABASE_ANON_KEY:   JSON.stringify(process.env['SUPABASE_ANON_KEY']   || ''),
        GOOGLE_MAPS_API_KEY: JSON.stringify(process.env['GOOGLE_MAPS_API_KEY'] || ''),
      },
    }),
  ],
};
