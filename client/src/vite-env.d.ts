/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PORTAL?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

