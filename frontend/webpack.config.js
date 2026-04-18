const webpack = require('webpack');
const path = require('path');

const envFile = process.env['NODE_ENV'] === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      __env__: {
        API_URL:             JSON.stringify(process.env['API_URL']             || ''),
        GOOGLE_MAPS_API_KEY: JSON.stringify(process.env['GOOGLE_MAPS_API_KEY'] || ''),
      },
    }),
  ],
};
