import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint, { parser } from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.stylisticTypeChecked,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['./*/*.ts','eslint.config.mjs','*.ts']
        }
      },
    },
  },
  tseslint.configs.strict,
  tseslint.configs.stylistic
);