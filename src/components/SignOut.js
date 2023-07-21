import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { firestore } from '../components/firebase';

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
      <h1>Paper Trades</h1>
      <img src={photoURL} alt='User Profile' />
      <p>Balance: ${balance !== null ? balance.toFixed(2) : 'Loading...'}</p>
      <button onClick={() => auth.signOut()}>Sign Out</button>
      <button className='help' title='Click on Ticker to Update Current Price'>?</button>
    </div>
  );
}

async function getUserBalance() {
  const userID = auth.currentUser.uid;
  const userRef = firestore.collection('users').doc(userID);
  let balance = null;

  try {
    const snapshot = await userRef.get();
    if (snapshot.exists) {
      const data = snapshot.data();
      balance = data.balance;
    } else {
      await userRef.set({
        userID,
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

export default SignOut;
