// src\vite-env.d.ts

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENV_TEST: string;
}

interface InportMeta {
  readonly env: ImportMetaEnv;
}