# sudoku

This project is bootstrapped by [aurelia/new](https://github.com/aurelia/new).

## See Demo here

[Demo Site](https://airboss001.github.io/Aurelia2-Sudoku/#/sudoku)

## Start dev web server

    npm start

## Build the app in production mode

    npm run build

It builds `dist/*-bundle.[hash].js`, updates index.html with hashed js bundle file name. To deploy to production server, copy over both the generated `index.html` and all the `dist/*` files.

For example
```
index.html
dist/entry-bundle.12345.js
```
Copy to production root folder
```
root_folder/index.html
root_folder/dist/entry-bundle.12345.js
```

## Unit Tests

    npm run test

Run unit tests in watch mode.

    npm run test:watch

Unit tests run in browser through [browser-do](https://github.com/3cp/browser-do). Please check scripts in `package.json` for more details.

By default, browser-do shuts down browser after tests. To keep browser window open for inspection, pass additional argument `-k` or `--keep-open`.

    npm run build:test && browser-do -k --mocha --browser chrome < dist/entry-bundle.js

Unit tests in watch mode is executed through standard `gulp.watch` with the help of [gulp-run](https://github.com/MrBoolean/gulp-run).

## Clear tracing cache

In rare situation, you might need to run clear-cache after upgrading to new version of dumber bundler.

    npm run clear-cache

## index.html

`index.html` is generated from `_index.html` every time `npm run build` runs. It is handled by dumber's `onManifest()` option, check `gulpfile.js` for details.
