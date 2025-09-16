/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_FAKE_AUTH?: string;
  readonly VITE_DEV_FORCE_SIDEBAR?: string;
  readonly VITE_ALLOW_ALL_ROUTES?: string;
  readonly VITE_DATA_SOURCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}