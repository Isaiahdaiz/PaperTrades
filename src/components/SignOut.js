import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { firestore } from '../components/firebase';
import Logo from '../images/Paper Trades-logos_transparent1.png'

async function getUserBalance() {
  const userID = auth.currentUser.uid;
  const userPhotoURL = auth.currentUser.photoURL;
  const userRef = firestore.collection('users').doc(userID);
  let balance = null;

  try {
    const snapshot = await userRef.get();
    if (snapshot.exists) {
      const data = snapshot.data();
      balance = data.balance;
    } else {
      await userRef.set({ // Create new user if does not exists
        userID,
        userPhotoURL,
        username: auth.currentUser.displayName,
        balance: 1000
      });
      balance = 1000;
    }
  } catch (error) {
    console.error('Error fetching balance total:', error);
    return null;
  }

  return balance;
}

function SignOut() {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    getUserBalance()
      .then((balance) => {
        setBalance(balance);
      })
      .catch((error) => {
        console.error('Error fetching balance:', error);
      });
  }, []);

  const photoURL = auth.currentUser.photoURL;
  return (
    <div className='banner'>
      <img className='logo1' src={Logo} alt='Logo' />
      <div className='banner-container'>
        <p>Balance: ${balance !== null ? balance.toFixed(2) : 'Loading...'}</p>
        <button onClick={() => auth.signOut()}>Sign Out</button>
        <img src={photoURL} alt='User Profile' />
        <button className='help' title='Click on Ticker to Update Current Price'>?</button>
      </div>
    </div>
  );
}



export default SignOut;
