"use client";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
} from "@tanstack/react-query";
import { useState } from "react";

type props = {
  children: React.ReactNode;
  dehydratedState?: unknown;
};

const Provider = ({ children, dehydratedState }: props) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 3,
            staleTime: 1000 * 60 * 5,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
};

export default Provider;
