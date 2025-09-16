/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_FAKE_AUTH?: string;
  readonly VITE_DEV_FORCE_SIDEBAR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}