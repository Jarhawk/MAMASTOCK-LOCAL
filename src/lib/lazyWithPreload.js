import { lazy } from 'react';import { isTauri } from "@/lib/tauriEnv";

export default function lazyWithPreload(factory) {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
}