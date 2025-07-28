import { AppTheme } from '@/components/app-theme'
import { AuthProvider } from '@/components/auth/auth-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { ClusterProvider } from './cluster/cluster-provider'
import { PrivyProvider } from '@privy-io/expo'

const queryClient = new QueryClient()

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AppTheme>
      <PrivyProvider appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID ?? ""} clientId={process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID ?? ""} >
        <QueryClientProvider client={queryClient}>
          <ClusterProvider>
            <SolanaProvider>
              <AuthProvider>{children}</AuthProvider>
            </SolanaProvider>
          </ClusterProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </AppTheme>
  )
}
