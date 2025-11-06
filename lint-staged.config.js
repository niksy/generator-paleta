export default {
	'{generators/app/index,test/index,eslint.config,lint-staged.config}.js': ['eslint --fix'],
	'*.(md|json|yml)': ['prettier --ignore-path .prettierignore --write'],
	'.!(npm)*rc': ['prettier --ignore-path .gitignore --parser json --write']
};
