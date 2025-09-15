import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";import { isTauri } from "@/lib/db/sql";

export default function Loading() {
  return <LoadingSpinner />;
}