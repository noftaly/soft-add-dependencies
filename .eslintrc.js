module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'noftalint',
    'noftalint/typescript',
  ],
  ignorePatterns: ['node_modules/', 'playground/', 'lib/', './**/*.d.ts'],
  rules: {
    'import/extensions': 'off',
    'node/file-extension-in-import': 'off',

    // These rules seem to currently have many false positive.
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    'node/shebang': ['error', {
      convertPath: {
        'src/main.ts': ['^src/main.ts$', 'lib/src/main.js'],
      },
    }],
  },
  env: { node: true },
  globals: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    PromiseFulfilledResult: 'readonly',
  },
};
