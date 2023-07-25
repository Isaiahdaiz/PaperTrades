import '../css/modal.css';
import { useState, useEffect } from 'react';
import { auth } from '../components/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { firestore } from '../components/firebase';

function StockModal(props) {
    const [user] = useAuthState(auth);
    const { stock, onClose } = props;
    const [quantity, setQuantity] = useState(null);
    const [averagePrice, setAveragePrice] = useState(null);

    useEffect(() => {
        getQuantity();
        fetchAveragePrice();
    }, []);

    const getQuantity = () => {
        const userID = user.uid;
        const stockRef = firestore
            .collection('users')
            .doc(userID)
            .collection('stocks')
            .where('ticker', '==', stock.ticker);

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


    const fetchAveragePrice = async () => {
        const userID = user.uid;
        const stockPurchasesRef = firestore
            .collection('users')
            .doc(userID)
            .collection('stocks')
            .where('ticker', '==', stock.ticker)

        try {
            const snapshot = await stockPurchasesRef.get();
            let totalPrice = 0;
            let totalQuantity = 0;
            let differenceQuantity = 0; // Buy - Sell
            snapshot.forEach((doc) => {
                const stockPurchase = doc.data();
                totalPrice += stockPurchase.price;
                totalQuantity++;
                if (stockPurchase.type == 'buy') { differenceQuantity++ }
                else { differenceQuantity-- };
            });

            if (totalQuantity > 0 && differenceQuantity > 0) {
                const averagePrice = totalPrice / totalQuantity;
                setAveragePrice(averagePrice);
            } else {
                setAveragePrice(0);
            }
        } catch (error) {
            console.error('Error retrieving stock purchases:', error);
            setAveragePrice(null);
        }
    };

    const handleBuy = () => {
        // Handle buy logic
        const userID = user.uid;
        const userRef = firestore.collection('users').doc(userID);

        // Fetch the user's current balance
        userRef
            .get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const currentBalance = userData.balance;

                    // Calculate the new balance after buying the stock (subtract stock price)
                    const updatedBalance = currentBalance - stock.price;

                    if (updatedBalance >= 0) {
                        // Update the user's balance in Firestore
                        return userRef.update({ balance: updatedBalance });
                    } else {
                        // Insufficient funds
                        throw new Error('Insufficient funds to buy the stock');
                    }
                } else {
                    throw new Error('User data not found');
                }
            })
            .then(() => {
                // Add the bought stock to the user's collection in Firestore
                return userRef.collection('stocks').add({
                    type: 'buy',
                    name: stock.name,
                    ticker: stock.ticker,
                    price: stock.price,
                });
            })
            .then(() => {
                console.log('Stock bought successfully');
                window.location.reload(); // Force page refresh
                onClose();
            })
            .catch((error) => {
                console.error('Error buying stock:', error);
                onClose();
            });
    };

    const handleSell = () => {
        // Handle sell logic
        const userID = user.uid;
        const userRef = firestore.collection('users').doc(userID);

        // Fetch the user's current balance
        userRef
            .get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const currentBalance = userData.balance;

                    // Calculate the new balance after selling the stocks
                    const updatedBalance = currentBalance + stock.price;

                    if (quantity <= 0) {
                        throw new Error('Insufficnet stock quantity')
                    }

                    if (updatedBalance >= 0) {
                        // Update the user's balance in Firestore
                        return userRef.update({ balance: updatedBalance });
                    } else {
                        // Insufficient funds
                        throw new Error('Insufficient funds to sell the stocks');
                    }
                } else {
                    throw new Error('User data not found');
                }
            })
            .then(() => {
                // Add the sold stocks to the user's collection with the selling price
                const soldStockRef = userRef.collection('stocks').doc(); // Generate a new document ID
                return soldStockRef.set({
                    type: 'sell',
                    name: stock.name,
                    ticker: stock.ticker,
                    price: -stock.price
                });
            })
            .then(() => {
                console.log('Stocks sold successfully');
                window.location.reload(); // Force page refresh
                onClose();
            })
            .catch((error) => {
                console.error('Error selling stocks:', error);
                onClose();
            });
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{stock.name}</h2>
                    <button className="close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    <p>Ticker: {stock.ticker}</p>
                    <p>Current Price: {stock.price}</p>
                    <p>Quantity Owned: {quantity !== null ? quantity : 'Loading...'}</p>
                    <p>
                        Average Cost Basis:{' '}
                        {averagePrice !== null ? `$${averagePrice.toFixed(2)}` : 'Loading...'}
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="buy-btn" onClick={handleBuy}>
                        Buy
                    </button>
                    <button className="sell-btn" onClick={handleSell}>
                        Sell
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StockModal;
