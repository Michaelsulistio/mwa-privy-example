import { createContext, type PropsWithChildren, use, useCallback, useMemo, useState } from 'react'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { AppConfig } from '@/constants/app-config'
import { Account, useAuthorization } from '@/components/solana/use-authorization'
import { useMutation } from '@tanstack/react-query'
import { PrivyUser, useLoginWithSiws, usePrivy } from '@privy-io/expo'
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { PublicKey } from '@solana/web3.js'

export interface AuthState {
  isLoading: boolean
  privySignIn: (mwaAccount: Account) => Promise<PrivyUser>
  signIn: () => Promise<Account>
  signOut: () => Promise<void>
}

const Context = createContext<AuthState>({} as AuthState)

export function useAuth() {
  const value = use(Context)
  if (!value) {
    throw new Error('useAuth must be wrapped in a <AuthProvider />')
  }

  return value
}

function useSignInMutation() {
  const { signIn } = useMobileWallet()

  return useMutation({
    mutationFn: async () =>
      await signIn({
        uri: AppConfig.uri,
      }),
  })
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { disconnect } = useMobileWallet()
  const { authorizeSession, accounts, isLoading } = useAuthorization()
  const signInMutation = useSignInMutation()
  // Privy
  const {generateMessage, login} = useLoginWithSiws();

  const privySignIn = useCallback(
    async (mwaAccount: Account): Promise<PrivyUser> => {

      // 1. Generate Privy SIWS message given user address
      const privySiwsMessage = await generateMessage({
        wallet: { address: mwaAccount.publicKey.toBase58()},
        from: { domain: AppConfig.domain, uri: AppConfig.uri },
      })

      // 2. Encode to Uint8Array
      const encodedPrivySiwsMessage = new TextEncoder().encode(privySiwsMessage.message);

      // 3. Connect and Sign SIWS Message
      console.log("Attempting to sign message with MWA")
      const [signatureBytes] = await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await authorizeSession(wallet);
        if (authResult.publicKey.toBase58() !== mwaAccount.publicKey.toBase58()) {
          throw new Error("Connected wallet address does not match the provided user address.");
        }

        return await wallet.signMessages({addresses: [authResult.address], payloads: [encodedPrivySiwsMessage]})
      })

      // 4. Convert signature to base64
      const signatureBase64 = Buffer.from(signatureBytes).toString('base64');

      // 5. Login/Signup to Privy
      console.log("Logging in with Privy SIWS")
      const user = await login({
        signature: signatureBase64,
        message: privySiwsMessage.message,
        disableSignup: false,
      });
      console.log("Sign in with Privy success")
      
      return user;
    },
    [generateMessage, login, authorizeSession],
  )

  const value: AuthState = useMemo(
    () => ({
      signIn: async () => await signInMutation.mutateAsync(),
      signOut: async () => await disconnect(),
      privySignIn: privySignIn,
      isLoading: signInMutation.isPending || isLoading,
    }),
    [accounts, disconnect, privySignIn, signInMutation, isLoading],
  )

  return <Context value={value}>{children}</Context>
}
