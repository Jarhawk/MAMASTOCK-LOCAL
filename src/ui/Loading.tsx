import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";import { isTauri } from "@/lib/runtime/isTauri";

export default function Loading() {
  return <LoadingSpinner />;
}