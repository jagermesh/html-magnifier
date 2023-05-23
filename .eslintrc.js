module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    commonjs: true,
  },
  extends: [
    'eslint:recommended',
  ],
  globals: {
  },
  parserOptions: {
    ecmaVersion: '2020',
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
  },
};
