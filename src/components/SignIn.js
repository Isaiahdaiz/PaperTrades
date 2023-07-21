import firebase from 'firebase/compat/app';
import { auth } from '../components/firebase'

function SignIn() {
    const useSignInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    }
    return (
      <button onClick={useSignInWithGoogle}>Sign in with Google</button>
    )
  }

export default SignIn