import eslint from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'src/routeTree.gen.ts',
      'eslint.config.js',
      'src/components/ui/**',
      'src/components/Table/**',

      'src/components/pdf/**',
      'src/tanstack.d.ts',
      'src/utils/storage.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'jsx-a11y': jsxA11y, 'react-hooks': reactHooks },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      'no-else-return': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
  {
    files: [
      'src/modules/*/components/**/*.{ts,tsx}',
      'src/modules/*/pages/**/*.{ts,tsx}',
      'src/modules/*/queries/**/*.{ts,tsx}',
      'src/routes/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/api/client',
              message: 'HTTP access belongs in the module api layer.',
            },
            {
              name: 'axios',
              message: 'Use the shared HTTP client through the module api layer.',
            },
          ],
        },
      ],
    },
  },
)
