import React, { useState, useEffect } from 'react';
import fetchStocks from './fetchStocks';
import { firestore } from '../components/firebase';
import firebase from 'firebase/compat/app';

function SearchBar() {
  const stocksRef = firestore.collection('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validInput, setValidInput] = useState(true);

  const handleChange = event => {
    const input = event.target.value.replace(/[^a-zA-Z]/g, ''); // Remove any characters that are not letters
    setSearchTerm(input);
    setValidInput(true); // Reset validity on each change
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    const ticker = searchTerm.trim().toUpperCase();
    if (ticker) {
      const results = await fetchStocks(ticker);
      console.log('Fetched results:', results);
      console.log(results[0].ticker);
      console.log(results[0].name);
      if (results[0] && results[0].name) {
        const snapshot = await stocksRef.where('ticker', '==', ticker).get();
        if (!snapshot.empty) {
          snapshot.docs[0].ref.update({
            last_updated: firebase.firestore.FieldValue.serverTimestamp(),
            name: results[0].name,
            price: results[0].price,
          });
        } else {
          await stocksRef.add({
            last_updated: firebase.firestore.FieldValue.serverTimestamp(),
            ticker,
            name: results[0].name,
            price: results[0].price,
          });
        }
        setStocks([results[0]]);
      } else {
        console.error('Invalid stock data. Name field is undefined.');
      }
    } else {
      setStocks([]);
    }
    setLoading(false);
  };

  const inputClassName = validInput ? 'search-input' : 'search-input invalid';

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className={inputClassName}
          placeholder="Search"
          value={searchTerm}
          onChange={handleChange}
        />
        <button type="submit">Search</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {stocks.map((stock, index) => (
            <li key={index}>
              Ticker: {stock.ticker} - Name: {stock.name} - Price: {stock.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
