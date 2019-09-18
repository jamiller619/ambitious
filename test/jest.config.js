// eslint-disable-next-line no-undef
module.exports = {
  verbose: true,
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json', 'jsx'],
  rootDir: process.cwd(),
  roots: ['<rootDir>/test/'],
  transformIgnorePatterns: ['/test']
}
