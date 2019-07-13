'use strict'

const OFF = 0
const WARN = 1
const ERROR = 2

module.exports = {
  extends: 'eslint:recommended',

  env: {
    browser: true,
    es6: true
  },

  parser: 'babel-eslint',
  plugins: ['babel'],

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true
    }
  },

  rules: {
    'no-unused-vars': ['error', { ignoreRestSiblings: true }]
  }
}
