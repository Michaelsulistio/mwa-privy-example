# Privy + Mobile Wallet Adapter in Expo

This is a proof-of-concept of an Expo app using [Mobile Wallet Adapter (MWA)](https://docs.solanamobile.com/mobile-wallet-adapter/mobile-apps) and Privy for authentication/sign-in.

This is an **Android** only implementation, as MWA is only compatible on Android.

## How it works

The key concept is that Privy provides a [Sign-In-With-Solana (SIWS) authentication method](https://docs.privy.io/authentication/user-authentication/login-methods/wallet#solana-siws) for external wallets to login or sign-up for Privy accounts.

Your app can use Mobile Wallet Adapter + Privy SDK to login/sign-up for Privy via this SIWS method.

### Steps

1. Connect to an external wallet app (e.g Seed Vault Wallet, Solflare, Phantom) with Mobile Wallet Adapter.

```typescript
const connect = useCallback(async (): Promise<Account> => {
   return await transact(async (wallet) => {
      return await authorizeSession(wallet)
   })
}, [authorizeSession])
```

- [Code Snippet](https://github.com/Michaelsulistio/mwa-privy-example/blob/main/components/solana/use-mobile-wallet.tsx#L12)

2. Now you have the connected user address, generate a SIWS Message via Privy SDK (e.g `generateMessage(userAddress)`).

```typescript
// Generate Privy SIWS message given user address
const privySiwsMessage = await generateMessage({
   wallet: { address: mwaAccount.publicKey.toBase58()},
   from: { domain: AppConfig.domain, uri: AppConfig.uri }, // Must match your Privy dashboard!!
})
```

- [Code Snippet](https://github.com/Michaelsulistio/mwa-privy-example/blob/main/components/auth/auth-provider.tsx#L50)

3. Encode the message to Uint8Array so it can be used by MWA message signing

```typescript
// 2. Encode to Uint8Array
const encodedPrivySiwsMessage = new TextEncoder().encode(privySiwsMessage.message);
```

- [Code Snippet](https://github.com/Michaelsulistio/mwa-privy-example/blob/main/components/auth/auth-provider.tsx#L55)

4. Invoke MWA's `signMessages(encodedPrivySiwsMessage)` method and passes the encoded SIWS Message for signing.

```typescript
// Connect and Sign SIWS Message
const [signatureBytes] = await transact(async (wallet: Web3MobileWallet) => {
   const authResult = await authorizeSession(wallet);
   if (authResult.publicKey.toBase58() !== mwaAccount.publicKey.toBase58()) {
      throw new Error("Connected wallet address does not match the provided user address.");
   }

   return await wallet.signMessages({addresses: [authResult.address], payloads: [encodedPrivySiwsMessage]})
})
```

- [Code Snippet](https://github.com/Michaelsulistio/mwa-privy-example/blob/main/components/auth/auth-provider.tsx#L60)

5. Convert the signed message from Uint8Array to a Base64 encoded string

```typescript
const signatureBase64 = Buffer.from(signatureBytes).toString('base64');
```

- [Code Snippet](https://github.com/Michaelsulistio/mwa-privy-example/blob/main/components/auth/auth-provider.tsx#L70)

6. Invoke Privy SDK `login(signedMessage)` to login or sign-up. If user doesn't have an account, it creates an account for them (if `disableSignup: false`)

```typescript
// Login or Signup to Privy
const user = await login({
   signature: signatureBase64,
   message: privySiwsMessage.message,
   disableSignup: false,
});
```

- [Code Snippet](https://github.com/Michaelsulistio/mwa-privy-example/blob/main/components/auth/auth-provider.tsx#L73)

7. If successful, at this point, you use Privy throughout your app

```typescript
const { user } = usePrivy();

console.log(user) // Should be populated if successful
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
