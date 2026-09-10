/** @import * as lintStaged from 'lint-staged'; */
/** @type {lintStaged.Configuration} */
export default {
	// prettier-ignore
	'{generators/app/index,generators/app/util,test/index,*.config,.mocharc}.{js,cjs}': ['eslint --fix'],
	'*.(md|json|yml)': ['prettier --ignore-path .prettierignore --write'],
	'.!(npm)*rc': ['prettier --ignore-path .gitignore --parser json --write']
};
