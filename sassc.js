/* eslint no-sync: 0 */
const argv = require('yargs')
  .alias('watch', 'w')
  .alias('help', 'h')
  .alias('output', 'o')
  .argv;
const compile = require('sass.js/dist/sass.node');
const Sass = require('sass.js');
const fs = require('fs');
const watch = require('glob-watcher');
const moment = require('moment');

if (argv.help) {
  console.log('');
  console.log('usage: node sassc source.scss --output output.css [--watch <glob pattern>]');
  console.log('The --watch or -w option creates a source map and watches source');
  console.log('files specified by the glob pattern for changes.');
  console.log('example: node sassc cssSrc/main.scss -o css/main.css -w "./cssSrc/*scss"');
  process.exit(0);
}

const src = argv._[0];
if (!src) {
  console.error('source file required, use --help for help');
  process.exit(1);
}

const out = argv.output;
if (!out) {
  console.error('output file required, use -o or --output parameter');
  process.exit(1);
}

const shouldWatch = argv.watch;

const runCompile = (done) => {
  const start = Date.now();
  const opts = shouldWatch ? {
    sourceMapFile: out,
    sourceMapEmbed: true,
    sourceMapOmitUrl: false,
    style: Sass.style.compressed
  } : {
    style: Sass.style.compressed
  };
  compile(src, opts, res => {
    if (res.status !== 0) {
      console.error('exit status: ', res.status);
      console.log(res);
      if (!done) {
        process.exit(1);
      }
    } else {
      try {
        fs.writeFileSync(out, res.text, {encoding: 'utf8'});
        const elapsed = Date.now() - start;
        const elstr = elapsed / 1000;
        console.log(`${res.text.length} bytes written to ${out} (${elstr} seconds) at ${moment().format('h:mm:ss A')}`);
      } catch (e) {
        console.error(e);
      }
    }
    if (done) {
      done();
    }
  });
};

if (shouldWatch) {
  watch(argv.watch, runCompile);
}

runCompile();
