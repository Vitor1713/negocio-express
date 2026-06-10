"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "./service";

export const DASHBOARD_KEY = ["dashboard"] as const;

/** Métricas da visão geral (GET /store/dashboard). */
export function useDashboard() {
  return useQuery({ queryKey: DASHBOARD_KEY, queryFn: getDashboard });
}
