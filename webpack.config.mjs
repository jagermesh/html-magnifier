import path from 'path';
import { fileURLToPath } from 'url';

import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const libraryConfig = {
  name: 'HTMLMagnifier',
  type: 'umd',
  export: 'default',
};

export default [
  {
    name: 'unminified',
    entry: './src/html-magnifier.js',
    mode: 'production',
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'html-magnifier.js',
      library: libraryConfig,
      globalObject: 'this',
    },
    optimization: {
      minimize: false,
    },
  },
  {
    name: 'minified',
    entry: './src/html-magnifier.js',
    mode: 'production',
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'html-magnifier.min.js',
      library: libraryConfig,
      globalObject: 'this',
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },
  },
];
