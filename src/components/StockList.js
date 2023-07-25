import '../App.css';
import { useState, useEffect } from 'react';
import { auth, firestore} from '../components/firebase'
import firebase from 'firebase/compat/app';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import StockModal from './StockModal';
import fetchStocks from './fetchStocks';

function StockList() {
  const stocksRef = firestore.collection('stocks');
  const query = stocksRef.orderBy('last_updated', 'desc').limit(25);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stocks] = useCollectionData(query, { idField: 'id' });

  const handleStockSelect = async (stock) => {
    const results = await fetchStocks(stock.ticker);
    const snapshot = await stocksRef.where('ticker', '==', stock.ticker).get();
    snapshot.docs[0].ref.update({
      last_updated: firebase.firestore.FieldValue.serverTimestamp(),
      name: results[0].name,
      price: results[0].price
    });
    setSelectedStock(results[0]);
  }

  const handleCloseModal = () => {
    setSelectedStock(null);
  };

  return (
    <>
      <main>
        {stocks && stocks.map(stk => (
          <StockInfo
            key={stk.id}
            data={stk}
            onSelect={handleStockSelect}
          />
        ))}
      </main>
      {selectedStock && (
        <StockModal
          stock={selectedStock}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}

function StockInfo(props) {
  const { last_updated, ticker, name, price } = props.data;
  const [quantity, setQuantity] = useState(null);

  useEffect(() => {
    fetchQuantity();
  }, [ticker, quantity]); // Add ticker and quantity as dependencies

  const fetchQuantity = async () => {
    const userID = auth.currentUser.uid;
    const stockRef = firestore
      .collection('users')
      .doc(userID)
      .collection('stocks')
      .where('ticker', '==', ticker);

        stockRef.get().then((snapshot) => {
            let buyQuantity = 0;
            let sellQuantity = 0;

            snapshot.docs.forEach((doc) => {
                const stockData = doc.data();
                if (stockData.type === 'buy') {
                    buyQuantity += 1;
                } else if (stockData.type === 'sell') {
                    sellQuantity += 1;
                }
            });

            const quantity = buyQuantity - sellQuantity;
            setQuantity(quantity);
        });
  };

  const lastUpdated = last_updated ? last_updated.toDate().toString() : 'Loading..';

  const handleClick = () => {
    props.onSelect(props.data);
  };

  return (
    <button className='stock-info-button' onClick={handleClick}>
      <div className='stock-info-container'>
        <div className='stock-info'>
          <div className='quantity'>{quantity !== null ? quantity : 'Loading...'} x </div>
          <div className='ticker-name-price'>
            <div className='ticker'>Ticker: {ticker}</div>
            <div className='name'>Name: {name}</div>
            <div className='price'>Price: {price}</div>
          </div>
        </div>
        <div className='last-updated'>Last Updated: {lastUpdated}</div>
      </div>
    </button>
  )
}

export default StockList;
