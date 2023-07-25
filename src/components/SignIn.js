import firebase from 'firebase/compat/app';
import { auth } from '../components/firebase'
import Logo from '../images/Paper Trades-logos_transparent1.png'

function SignIn() { // use async/await with a try/catch block for error handling in your function.
  const useSignInWithGoogle = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
    } catch (error) {
      console.error("Login unsuccessful", error);
        if (error.code === 'auth/popup-closed-by-user') {
            console.log('Popup closed by user');
        }
    }
  }
  return (
    <div className='signIn-container'>
      <img className='logo-login' src={Logo} alt='Logo' />
      <button onClick={useSignInWithGoogle}>Sign in with Google</button>
    </div>
  )
}

export default SignIn