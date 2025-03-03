import importPlugin from 'eslint-plugin-import';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
      },
    },
    ignores: ['node_modules/', 'dist/'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-console': 'off', // Allow console.log statements
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_' }],
      'import/no-unresolved': 'error',
      'import/extensions': ['error', 'always', { js: 'always' }],
    },
  },
];
