"use client";

import { useState } from "react";
import { createQueryClient } from "../lib/query/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ProgressProvider } from "@bprogress/next/app";

export function Providers(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ProgressProvider
        height="4px"
        options={{ showSpinner: false }}
        shallowRouting
        disableStyle
      >
        {props.children}
      </ProgressProvider>
    </QueryClientProvider>
  );
}
