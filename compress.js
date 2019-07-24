var compressor = require('node-minify');
const minify = require('@node-minify/core');
const csso = require('@node-minify/csso');

var js_list = [
  'foo.js',
  'functions.js',
  'tokenChecker.js'
]
var css_list = [
  'foo.css',
  'foo2.css',
  'foo3.css',
]

compressor.minify({
  compressor: 'gcc',
  input: js_list,
  output: './dist/js/$1.js',
  callback: function(err, min) {
    console.log('Success Compressor JS.')
  }
});

var css_list_out = Object.values(css_list).map((css) => {
  return './dist/css/' + css
})
minify({
  compressor: csso,
  input: css_list,
  output: css_list_out,
  callback: function(err, min) {
    console.log('Success Compressor CSS.')
  }
})
