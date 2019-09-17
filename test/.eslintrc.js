module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: 'plugin:jest/recommended',
  settings: {
    react: {
      pragma: 'ambitious'
    }
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['jest'],
  rules: {}
}
