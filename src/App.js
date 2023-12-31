import './App.css';
import { useState, useRef } from 'react';
import { auth, firestore, user } from './components/firebase'
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import SignIn from './components/SignIn';
import SignOut from './components/SignOut';
import Dashboard from './components/Dashboard';
import SearchBar from './components/SearchBar';



function App() {
  const [user] = useAuthState(auth);


  return (
    <div className="App">
      <header>
        {user &&
        <>
        <SignOut />
        <SearchBar />
        </>}
      </header>

      <section>
        {user ? <Dashboard /> : <SignIn />}
      </section>
    </div>
  );
}

export default App;
