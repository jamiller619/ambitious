#!/usr/bin/env node
/* eslint-disable no-undef */
'use strict'

const path = require('path')
const fs = require('fs-extra')

const packages = ['ambitious']
const DIST = pkg => `./dist/${pkg}/`

const pkg = fs.readFileSync('./package.json')
const json = JSON.parse(pkg)
delete json.devDependencies
delete json.scripts
json.main = 'ambitious.js'
const parts = json.version.split('.')
const patch = [parts[0], parts[1], parts[2] * 1 + 1].join('.')
json.version = patch

packages.forEach(pkg => {
  fs.ensureDir(DIST(pkg))
  fs.writeFileSync(
    path.join(DIST(pkg), 'package.json'),
    JSON.stringify(json, null, 2)
  )
})

// The files we need to copy to packages
const files = ['./LICENSE.md', './README.md']

files.forEach(file => {
  packages.forEach(pkg => {
    const output = path.join(DIST(pkg), file)

    fs.copy(file, output)
  })
})
