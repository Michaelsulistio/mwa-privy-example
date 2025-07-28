import { router } from 'expo-router'
import { Button } from '@react-navigation/elements'
import { useMobileWallet } from '../solana/use-mobile-wallet'
import { useAuthorization } from '../solana/use-authorization'
import { useAuth } from '../auth/auth-provider'


export default function PrivySignInButton() {
    const { selectedAccount } = useAuthorization()
    const { privySignIn } = useAuth();
    const { connect,  } = useMobileWallet()
    
    return <Button
        variant="filled"
        style={{ margin: 16 }}
        onPress={async () => {
            try {
                if (selectedAccount) {
                    // 1. User has already connected via MWA, now link to Privy.
                    console.log("Signing in with Privy")
                    const privyUser = await privySignIn(selectedAccount);
                    console.log(privyUser)
                    router.replace('/')
                } else {
                    // 2. User has not connected via MWA, connect first.
                    console.log("Connecting with Privy")
                    const mwaAccount = await connect()
                }
            } catch (error) {
                console.error(error)
            }
        }}
    >
       { selectedAccount ? 'Step 2. Login/Signup Privy Account' : 'Step 1. Connect MWA'}
    </Button>;  
}
