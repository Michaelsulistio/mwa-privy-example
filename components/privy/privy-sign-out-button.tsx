import { Button } from '@react-navigation/elements'
import { usePrivy } from '@privy-io/expo'

export default function PrivySignOutButton() {
    const { user, logout } = usePrivy();
    
    const buttonStyle = {
        margin: 16,
        ...(user ? {} : {
            opacity: 0.5,
            backgroundColor: '#ccc',
        })
    };

    return <Button
        variant="filled"
        style={buttonStyle}
        disabled={!user}
        onPress={async () => {
            try {
                await logout();
            } catch (error) {
                console.error(error)
            }
        }}
    >
      Privy Logout
    </Button>;  
}