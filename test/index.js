/* eslint-env mocha */
/* eslint-disable new-cap */

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var writeJson = require('write-json-file');
var readJson = require('load-json-file');

describe('new project', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				name: 'foo'
			})
			.toPromise();
	});

	it('creates files', function () {
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

	it('fills package.json with correct information', function () {
		assert.JSONFileContent('package.json', {
			name: 'foo',
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/)'
		});
	});

	it('fills the README with project data', function () {
		assert.fileContent('README.md', '# foo');
		assert.fileContent('README.md', 'npm install foo --save');
	});

	it('uses correct property order for package.json properties', function () {

		return Promise.all([
			readJson('package.json'),
			readJson(path.join(__dirname, 'fixtures/new-project-package.json'))
		])
			.then(function ( files ) {
				var content = files.map(function ( file ) {
					return JSON.stringify(file);
				});
				return assert.textEqual(content[0], content[1]);
			});

	});

});

describe('existing project', function () {

	var tmpPkgPath = '';

	before(function () {

		return helpers.run(path.join(__dirname, '../generators/app'))
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
					},
					keywords: [
						'a',
						'c',
						'b'
					]
				}).then(done);
			})
			.withOptions({ force: true })
			.toPromise();

	});

	after(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.cleanTestDirectory();
	});

	it('reuses existing package.json information', function () {
		assert.JSONFileContent('package.json', {
			name: 'bar',
			description: 'bar description',
			author: 'Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/)'
		});
	});

	it('uses correct property order for package.json properties', function () {

		return Promise.all([
			readJson(tmpPkgPath),
			readJson(path.join(__dirname, 'fixtures/existing-project-package.json'))
		])
			.then(function ( files ) {
				var content = files.map(function ( file ) {
					return JSON.stringify(file);
				});
				return assert.textEqual(content[0], content[1]);
			});

	});

});

describe('package.json "keywords" property', function () {

	before(function () {
		return helpers.run(path.join(__dirname, '../generators/app'))
			.withPrompts({
				keywords: '1,1,2,3,1,1,5,5,5,6'
			})
			.toPromise();
	});

	it('unique values sorted alphabetically', function () {
		assert.JSONFileContent('package.json', {
			keywords: ['1', '2', '3', '5', '6']
		});
	});

});
