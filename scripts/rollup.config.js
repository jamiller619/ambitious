import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import minify from 'rollup-plugin-babel-minify'
import cleanup from 'rollup-plugin-cleanup'
import commonjs from 'rollup-plugin-commonjs'
import filesize from 'rollup-plugin-filesize'

export default {
  // eslint-disable-next-line no-undef
  input: process.env.npm_package_main,
  output: {
    file: './dist/ambitious/ambitious.js',
    format: 'cjs',
    interop: false,
    sourcemap: true
  },
  plugins: [
    resolve({
      jsnext: true,
      browser: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs(),
    cleanup(),
    // minify(),
    filesize()
  ]
}
