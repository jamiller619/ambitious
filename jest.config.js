
// eslint-disable-next-line no-undef
module.exports = {
  verbose: true,
  roots: ['test'],
  // testEnvironment: "node",
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleFileExtensions: [
    "js"
  ],
  moduleDirectories: [
    "node_modules",
    "src"
  ]
}
