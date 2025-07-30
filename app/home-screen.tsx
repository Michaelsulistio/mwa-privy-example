import { router, Stack } from 'expo-router'
import { StyleSheet } from 'react-native'

import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { Button } from '@react-navigation/elements'

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <AppView style={styles.container}>
        <AppText type="title" style={{ textAlign: 'center' }}>
          Home Screen
        </AppText>
        <Button 
          variant="filled" 
          onPress={() => router.back()}
        >
          Previous Screen
        </Button>
      </AppView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
})