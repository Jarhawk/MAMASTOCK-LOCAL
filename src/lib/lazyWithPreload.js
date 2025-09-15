import { lazy } from 'react';import { isTauri } from "@/lib/db/sql";

export default function lazyWithPreload(factory) {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
}