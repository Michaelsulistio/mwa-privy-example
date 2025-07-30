import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { SignInPayload } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js'
import { useCallback, useMemo } from 'react'
import { Account, useAuthorization } from './use-authorization'
import { PrivyUser, useLoginWithSiws } from '@privy-io/expo'
import { AppConfig } from '@/constants/app-config'

export function useMobileWallet() {
  const { authorizeSessionWithSignIn, authorizeSession, deauthorizeSessions } = useAuthorization()
  const { generateMessage, login } = useLoginWithSiws();

  const connect = useCallback(async (): Promise<Account> => {
    return await transact(async (wallet) => {
      return await authorizeSession(wallet)
    })
  }, [authorizeSession])

  const signIn = useCallback(       
    async (signInPayload: SignInPayload): Promise<Account> => {
      return await transact(async (wallet) => {
        return await authorizeSessionWithSignIn(wallet, signInPayload)
      })
    },
    [authorizeSessionWithSignIn],
  )

  // For when user has not connected to both MWA or Privy
  const privyMwaSignIn = useCallback(
    async (): Promise<{ mwaResult: Account; privyUser: PrivyUser }> => {
      return await transact(async (wallet) => {
        const authResult = await authorizeSession(wallet)

        console.log("Fetching privy siws message")
        const privySiwsMessage = await generateMessage({
          wallet: { address: authResult.publicKey.toBase58()},
          from: { domain: AppConfig.domain, uri: AppConfig.uri },
        })

        const encodedPrivySiwsMessage = new TextEncoder().encode(privySiwsMessage.message);
        console.log("Waiting for sign message")
        const [signatureBytes] = await wallet.signMessages({addresses: [authResult.address], payloads: [encodedPrivySiwsMessage]})
        const signatureBase64 = Buffer.from(signatureBytes).toString('base64');

        console.log("Logging in with Privy SIWS")
        const user = await login({
          signature: signatureBase64,
          message: privySiwsMessage.message,
          disableSignup: false,
        });
        console.log("Sign in with Privy success")

        return {mwaResult: authResult, privyUser: user}
      })
    },
    [authorizeSessionWithSignIn],
  )
  
  const disconnect = useCallback(async (): Promise<void> => {
    await deauthorizeSessions()
  }, [deauthorizeSessions])

  const signAndSendTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction, minContextSlot: number): Promise<TransactionSignature> => {
      return await transact(async (wallet) => {
        await authorizeSession(wallet)
        const signatures = await wallet.signAndSendTransactions({
          transactions: [transaction],
          minContextSlot,
        })
        return signatures[0]
      })
    },
    [authorizeSession],
  )

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      return await transact(async (wallet) => {
        const authResult = await authorizeSession(wallet)
        const signedMessages = await wallet.signMessages({
          addresses: [authResult.address],
          payloads: [message],
        })
        return signedMessages[0]
      })
    },
    [authorizeSession],
  )

  return useMemo(
    () => ({
      connect,
      signIn,
      privyMwaSignIn,
      disconnect,
      signAndSendTransaction,
      signMessage,
    }),
    [connect, disconnect, signAndSendTransaction, signIn, privyMwaSignIn, signMessage],
  )
}
