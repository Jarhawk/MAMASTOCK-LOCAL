import { lazy } from 'react';import { isTauri } from "@/lib/runtime/isTauri";

export default function lazyWithPreload(factory) {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
}