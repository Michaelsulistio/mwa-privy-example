import { router } from 'expo-router'
import { useAuth } from '@/components/auth/auth-provider'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { AppConfig } from '@/constants/app-config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ActivityIndicator, View, ScrollView } from 'react-native'
import { Button } from '@react-navigation/elements'
import PrivySignInWithMWAButton from '@/components/privy/privy-sign-in-with-mwa-button'
import PrivySignOutButton from '@/components/privy/privy-sign-out-button'
import { usePrivy } from '@privy-io/expo'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { useEffect, useState } from 'react'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'

export default function SignIn() {
  const { signOut, signIn, isLoading } = useAuth()
  const { user, logout } = usePrivy()
  const { account } = useWalletUi()
  const { privyMwaSignIn } = useMobileWallet()

  const connectedWithMWA = !!account;
  const loggedIntoPrivy = !!user;

   // Auto-navigate when both are connected
   useEffect(() => {
    if (connectedWithMWA && loggedIntoPrivy) {
      router.push('/home-screen')
    }
  }, [connectedWithMWA, loggedIntoPrivy])

  const disabledButtonStyles = { opacity: 0.5, backgroundColor: "gray" }

  return (
    <AppView style={{ flex: 1 }}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <AppText type="title">Privy + MWA Integration</AppText>
            </View>

            {/* Combined Section - Main Focus */}
            <View style={{ marginBottom: 30 }}>
              <AppText style={{ fontSize: 20, fontWeight: '700', marginBottom: 15 }}>
                MWA + Privy Combined Sign In
              </AppText>
              <Button 
                  variant="filled" 
                  disabled={connectedWithMWA && loggedIntoPrivy} 
                  style={(connectedWithMWA && loggedIntoPrivy) ? disabledButtonStyles: { opacity: 1 }}
                  onPress={privyMwaSignIn}
                >
                  Privy + MWA Sign In
                </Button>
            </View>

            {/* Privy Section */}
            <View style={{ marginBottom: 30 }}>
              <AppText style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
                Privy Authentication
              </AppText>
              
              {/* Privy Status Display */}
              <View style={{ marginBottom: 20 }}>
                <AppText style={{ fontSize: 16, marginBottom: 5 }}>
                  Status: {loggedIntoPrivy ? '✓ Logged in' : 'Not logged in'}
                </AppText>
                <AppText style={{ fontSize: 16, marginBottom: 5 }}>
                  User ID: {user ? user.id : 'Not available'}
                </AppText>
              </View>

              <View style={{ gap: 10 }}>
                <Button 
                  variant="filled" 
                  disabled={loggedIntoPrivy}
                  style={loggedIntoPrivy ? disabledButtonStyles: { opacity: 1 }}
                  onPress={signIn}
                >
                  Privy Login
                </Button>
                <Button 
                  variant="filled" 
                  disabled={!loggedIntoPrivy}
                  style={!loggedIntoPrivy ? disabledButtonStyles: { opacity: 1 }}
                  onPress={logout}
                >
                  Privy Logout
                </Button>
              </View>
            </View>

            {/* MWA Section */}
            <View style={{ marginBottom: 30 }}>
              <AppText style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
                Mobile Wallet Adapter
              </AppText>
              
              {/* MWA Status Display */}
              <View style={{ marginBottom: 20 }}>
                <AppText style={{ fontSize: 16, marginBottom: 5 }}>
                  Status: {connectedWithMWA ? '✓ Connected' : 'Not connected'}
                </AppText>
                <AppText style={{ fontSize: 16, marginBottom: 5 }}>
                  Wallet Address: {account ? account.publicKey.toBase58() : 'Not available'}
                </AppText>
              </View>
 
              <View style={{ gap: 10 }}>
                <Button 
                  variant="filled" 
                  disabled={connectedWithMWA} 
                  style={connectedWithMWA ? disabledButtonStyles: { opacity: 1 }}
                  onPress={signIn}
                >
                  MWA Connect
                </Button>
                <Button 
                  variant="filled" 
                  disabled={!connectedWithMWA}
                  style={!connectedWithMWA ? disabledButtonStyles: { opacity: 1 }}
                  onPress={signOut}
                >
                  MWA Disconnect
                </Button>
              </View>
            </View>

              {/* Continue Button */}
            <View style={{ marginTop: 20 }}>
              <Button 
                variant="filled" 
                onPress={() => router.push('/home-screen')}
              >
                Next Screen
              </Button>
            </View>

          </ScrollView>
        </SafeAreaView>
      )}
    </AppView>
  )
}