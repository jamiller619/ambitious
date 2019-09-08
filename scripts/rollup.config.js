import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import minify from 'rollup-plugin-babel-minify'
import cleanup from 'rollup-plugin-cleanup'
import commonjs from 'rollup-plugin-commonjs'
import filesize from 'rollup-plugin-filesize'

const defs = {
  // eslint-disable-next-line no-undef
  input: process.env.npm_package_main,
  output: {
    interop: false,
    sourcemap: true
  },
  plugins: [
    resolve({
      browser: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    cleanup(),
    filesize()
  ]
}

export default [
  {
    ...defs,
    output: {
      ...defs.output,
      format: 'esm',
      file: './dist/ambitious/ambitious.js'
    }
  },
  {
    ...defs,
    output: {
      ...defs.output,
      format: 'cjs',
      file: './dist/ambitious/ambitious.min.js'
    },
    plugins: [...defs.plugins, commonjs(), minify()]
  }
]
