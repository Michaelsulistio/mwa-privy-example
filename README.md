# Privy + Mobile Wallet Adapter in Expo

This is a proof-of-concept of an Expo app using [Mobile Wallet Adapter (MWA)](https://docs.solanamobile.com/mobile-wallet-adapter/mobile-apps) and Privy for authentication/sign-in.

This is an **Android** only implementation, as MWA is only compatible on Android.

## Screenshots

<p align="center">
  <img src="/screenshots/screenshot1.png" alt="Mobile app screenshot 1" width="300" />
  <img src="/screenshots/screenshot2.png" alt="Mobile app screenshot 2" width="300" />
</p>

## How it works

The key concept is that Privy provides a [Sign-In-With-Solana (SIWS) authentication method](https://docs.privy.io/authentication/user-authentication/login-methods/wallet#solana-siws) for external wallets to login or sign-up for Privy accounts.

Your app can use Mobile Wallet Adapter + Privy SDK to login/sign-up for Privy via this SIWS method.

## Steps

### Prerequisites

Use these versions of Mobile Wallet Adapter:

```
"@solana-mobile/mobile-wallet-adapter-protocol": "2.2.2-hotfix.0"
"@solana-mobile/mobile-wallet-adapter-protocol-web3js": "2.2.2"
```

### Code

Below is an example of SIWS using Mobile Wallet Adapter (reference: `useMobileWallet`).

```ts
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'

const privyMwaSignIn = async (): Promise<{ mwaResult: Account; privyUser: PrivyUser }> => {
   // 1. Start an MWA transact Session and user chooses a wallet
   return await transact(async (wallet) => {
      // 2. Authorize/Connect to the wallet
      const authResult = await authorizeSession(wallet)

      // 3. Generate a Sign-In With Solana (SIWS) message for Privy authentication
      const privySiwsMessage = await generateMessage({
         wallet: { address: authResult.publicKey.toBase58()},
         from: { domain: AppConfig.domain, uri: AppConfig.uri },
      })

      // 4. Encode the SIWS message to `Uint8Array` for signing
      const encodedPrivySiwsMessage = new TextEncoder().encode(privySiwsMessage.message);

      // 5. Request user to sign the SIWS message with their wallet
      const [signatureBytes] = await wallet.signMessages({addresses: [authResult.address],   payloads: [encodedPrivySiwsMessage]})
      const signatureBase64 = Buffer.from(signatureBytes).toString('base64');

      // 6. Authenticate with Privy using the signed message
      const user = await login({
         signature: signatureBase64,
         message: privySiwsMessage.message,
         disableSignup: false,
      });

      // 7. Return both the MWA session result and the authenticated Privy user
      return {mwaResult: authResult, privyUser: user}
   })
}
```

If successful, at this point, you use can `usePrivy` in your app.

```typescript
const { user } = usePrivy();

console.log(user) // Should be populated if `login` was successful
```

## Required Privy Configuration

### Allowed Origins

Ensure you have added your app's origin URL in your Privy Dashboard.

This must match the provided URI and Domain in `generateMessage`.

```typescript
const privySiwsMessage = await generateMessage({
   wallet: { address: mwaAccount.publicKey.toBase58()},
   from: { domain: AppConfig.domain, uri: AppConfig.uri }, // Must match your Privy dashboard!!
})
```

![Allowed Origins Screenshot](/screenshots/allowed-origins.png)

### Enable External Wallets

You must enable External Wallets and Solana in your Privy Dashboard

![External Wallets Screenshot](/screenshots/external-wallets.png)

### App Identifiers

You must add your app's Android package name to your *Clients* dashboard

![App Identifiers Screenshot](/screenshots/app-identifier.png)

### Privy Client and App ID

Create a `.env` file in the root directory and add your Client ID and App ID. Both can be found in Privy Dashboard.
```
EXPO_PUBLIC_PRIVY_CLIENT_ID=client-...
EXPO_PUBLIC_PRIVY_APP_ID=...
```

## Relevant Code Snippets

- [PrivySignInButton component](/components/privy/privy-sign-in-button.tsx) 
- [privySignIn method](/components/auth/auth-provider.tsx) 
- [PrivySignOutButton component](/components/privy/privy-sign-out-button.tsx) 

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm run android
   ```
