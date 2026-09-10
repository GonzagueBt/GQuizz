// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    rules: {
      // react-hooks/immutability (règle "React Compiler") ne reconnaît pas encore
      // `SharedValue.value =` de react-native-reanimated comme une mutation
      // intentionnelle et documentée — désactivée globalement plutôt que
      // ligne par ligne à chaque animation.
      'react-hooks/immutability': 'off',
    },
  },
]);
