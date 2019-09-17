module.exports = {
  comments: false,
  compact: true,
  minified: true,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['last 2 versions', '> 1%', 'not dead']
        }
      }
    ]
  ],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        pragma: 'ambitious.createElement',
        pragmaFrag: 'ambitious.Fragment'
      }
    ]
  ]
}
