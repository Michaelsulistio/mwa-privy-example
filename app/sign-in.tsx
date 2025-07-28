import { router } from 'expo-router'
import { useAuth } from '@/components/auth/auth-provider'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { AppConfig } from '@/constants/app-config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ActivityIndicator, View } from 'react-native'
import { Image } from 'expo-image'
import { Button } from '@react-navigation/elements'
import PrivySignInButton from '@/components/privy/privy-sign-in-button'
import PrivySignOutButton from '@/components/privy/privy-sign-out-button'

export default function SignIn() {
  const { signOut, signIn, isLoading } = useAuth()
  return (
    <AppView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          {/* Dummy view to push the next view to the center. */}
          <View />
          <View style={{ alignItems: 'center', gap: 16 }}>
            <AppText type="title">{AppConfig.name}</AppText>
            <Image source={require('../assets/images/icon.png')} style={{ width: 128, height: 128 }} />
          </View>
          <View style={{ marginBottom: 16 }}>
          <PrivySignInButton />
          <Button
            variant="filled"
            style={{ marginHorizontal: 16 }}
            onPress={async () => {
              await signIn()
              // Navigate after signing in. You may want to tweak this to ensure sign-in is
              // successful before navigating.
              router.replace('/')
            }}
          >
            MWA Connect
          </Button>
          <Button
            variant="filled"
            style={{ margin: 16 }}
            onPress={async () => {
              await signOut()
              // Navigate after signing in. You may want to tweak this to ensure sign-in is
              // successful before navigating.
            }}
          >
            MWA Disconnect
          </Button>
          <PrivySignOutButton />
          </View>
        </SafeAreaView>
      )}
    </AppView>
  )
}
