import { config } from '@remotion/eslint-config-flat';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'public/**', 'out/**', 'cli/**'],
  },
  ...config,
];
