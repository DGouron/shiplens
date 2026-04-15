import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function withQueryClient(
  children: ReactNode,
  client: QueryClient = createTestQueryClient(),
): ReactNode {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
