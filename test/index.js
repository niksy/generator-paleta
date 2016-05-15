/* eslint-disable new-cap,no-console */

var path = require('path');
var test = require('mocha').it;
var before = require('mocha').before;
var describe = require('mocha').describe;
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var writeJson = require('write-json-file');
var readJson = require('load-json-file');

describe('new project', function () {

	before(function ( done ) {

		helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				name: 'foo'
			})
			.on('end', done);

	});

	test('creates files', function () {
		var expected = [
			'package.json',
			'.editorconfig',
			'.eslintrc',
			'.gitignore',
			'index.js',
			'LICENSE.md',
			'README.md'
		];
		assert.file(expected);
	});

	test('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			name: 'foo',
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/)'
		});
	});

	test('fills the README with project data', function () {
		assert.fileContent('README.md', '# foo');
		assert.fileContent('README.md', 'npm install foo --save');
	});

});

describe('existing project', function () {

	var tmpPkgPath = '';

	before(function ( done ) {

		helpers.run(path.join(__dirname, '../generators/app'))
			.inTmpDir(function ( dir ) {
				var done = this.async();
				tmpPkgPath = path.join(dir, 'package.json');
				writeJson(tmpPkgPath, {
					name: 'bar',
					description: 'bar description',
					main: 'index.js',
					version: '1.0.0',
					dependencies: {
						e: 3,
						a: 1,
						g: 4,
						c: 2
					}
				}).then(done);
			})
			.withOptions({ force: true })
			.on('end', done);

	});

	test('reuses existing package.json information', function () {
		assert.JSONFileContent('package.json', {
			name: 'bar',
			description: 'bar description',
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/)'
		});
	});

	test('package.json preserves property order', function () {

		return Promise.all([
			readJson(tmpPkgPath),
			readJson(path.join(__dirname, 'fixtures/preserved-property-order-package.json'))
		])
			.then(function ( files ) {
				var content = files.map(function ( file ) {
					return JSON.stringify(file);
				});
				assert.textEqual(content[0], content[1]);
			});

	});

});
