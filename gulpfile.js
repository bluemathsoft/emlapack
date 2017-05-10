const gulp = require('gulp')
const shell = require('gulp-shell')
const libf2cFiles = require('./src/libf2c-files')
const blasFiles = require('./src/blas-files')
const lapackFiles = require('./src/lapack-files')
const exportFunctions = require('./src/export-functions')

const lapackInstallFiles = [
  'dlamch',
  'slamch'
]

var joinNames = function (names) {
  return names
    .map(function (name) {
      return '"' + name + '"'
    })
    .join(',')
}

gulp.task('mkbuild', shell.task(['mkdir -p build']))

gulp.task('compile-libf2c', ['mkbuild'], shell.task(
  libf2cFiles.map(function (name) {
    return 'emcc clapack/F2CLIBS/libf2c/' + name + '.c -O2 -Iclapack/INCLUDE -o build/' + name + '.bc'
  })
))

gulp.task('compile-blas', ['mkbuild'], shell.task(
  blasFiles
    .map(function (name) {
      return 'emcc clapack/BLAS/SRC/' + name + '.c -O2 -Iclapack/INCLUDE -o build/' + name + '.bc'
    })
))

gulp.task('compile-lapack-install', ['mkbuild'], shell.task(
  lapackInstallFiles
    .map(function (name) {
      return 'emcc clapack/INSTALL/' + name + '.c -O2 -Iclapack/INCLUDE -o build/' + name + '.bc'
    })
))

gulp.task('compile-lapack', ['mkbuild'], shell.task(
  lapackFiles
    .map(function (name) {
      return 'emcc clapack/SRC/' + name + '.c -O2 -Iclapack/INCLUDE -o build/' + name + '.bc'
    })
))

gulp.task('link', ['compile-libf2c', 'compile-blas', 'compile-lapack', 'compile-lapack-install'], shell.task([
  "emcc build/*.bc -o emlapack.js -O2 --memory-init-file 0 -s EXPORTED_FUNCTIONS='[" + joinNames(exportFunctions) + "]' --post-js src/export.js"
]))

gulp.task('build', ['link'])

gulp.task('test', shell.task('mocha --recursive --colors --reporter dot'))

gulp.task('default', ['build'])
