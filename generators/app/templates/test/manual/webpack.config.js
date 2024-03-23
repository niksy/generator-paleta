import path from 'node:path';
import { fileURLToPath } from 'node:url';
import del from 'del';
import globby from 'globby';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import atImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';

export default async () => {

	const port = 0;

	await del(['./test-dist']);

	const files = await globby(['./test/manual/**/*.<%= extension || 'js' %>', '!./test/manual/webpack.config.js']);

	const entries = files
		.map(( file ) => {
			const extname = path.extname(file);
			const key = path.basename(file, extname);
			const obj = {};
			obj[`${file.replace('./test/manual/', '').replace(path.basename(file), '')}${key}`] = file;
			return obj;
		})
		.reduce(( prev, next ) => {
			return Object.assign(prev, next);
		}, {});

	return {
		entry: entries,
		output: {
			filename: '[name].js',
			path: fileURLToPath(new URL('../../test-dist', import.meta.url)),
		},
		mode: 'none',
		devtool: 'inline-source-map',
		devServer: {
			contentBase: fileURLToPath(new URL('../../test-dist', import.meta.url)),
			port: port,
			host: '0.0.0.0',
			disableHostCheck: true,
			open: true
		},<% if ( transpile && typescript && typescriptMode === 'full' ) { %>
		resolve: {
			extensions: ['...', '.ts']
		},<% } %>
		module: {
			rules: [
				{
					test: /\.css$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader
						},
						{
							loader: 'css-loader',
							options: {
								sourceMap: true,
								import: false
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								sourceMap: true,
								postcssOptions: {
									config: false,
									plugins: [
										atImport(),
										postcssPresetEnv()
									]
								}
							}
						}
					],
				}<% if ( transpile ) { %>,
				{
					test: /\.<%= extension || 'js' %>$/,
					exclude: /node_modules/,
					use: [{
						loader: 'babel-loader'
					}]
				}<% } %><% if ( !transpile && typescript && typescriptMode === 'full' ) { %>,
				{
					test: /\.ts$/,
					exclude: /node_modules/,
					use: [{
						loader: 'ts-loader'
					}]
				}<% } %>
			],
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: '[name].css',
				chunkFilename: '[id].css'
			}),
			...Object.keys(entries).map(( key ) => {
				return new HtmlWebpackPlugin({
					title: key,
					chunks: [key],
					filename: `${key}.html`,
					template: `./test/manual/${key}.html`
				});
			})
		],
		optimization: {
			sideEffects: false
		}
	};

};
