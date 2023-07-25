import React, { useEffect, useState } from 'react';
import { firestore } from './firebase';

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const leaderboardData = [];
      const usersRef = firestore.collection('users');
      const usersSnapshot = await usersRef.get();

      usersSnapshot.forEach(async (userDoc) => {
        const userData = userDoc.data();
        const userID = userDoc.id;
        const username = userData.username;
        const stocksRef = usersRef.doc(userID).collection('stocks');
        const stocksSnapshot = await stocksRef.get();
        let totalValue = userData.balance;
        let stockQuantity = 0;

        stocksSnapshot.forEach((stockDoc) => {
          const stockData = stockDoc.data();
          console.log(stockData)
          totalValue += stockData.total
          if (stockData.type == 'buy') stockQuantity++;
          else stockQuantity--;
        });

        leaderboardData.push({
          username,
          totalValue,
        });

        // When all users have been processed, sort the leaderboardData
        if (leaderboardData.length === usersSnapshot.size) {
          leaderboardData.sort((a, b) => b.totalValue - a.totalValue);
          setLeaderboardData(leaderboardData);
        }
      });
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };
  
  return (
    <div>
      <h1>Leaderboard</h1>
      <ul>
        {leaderboardData.map((user, index) => (
          <li key={user.username}>
            User ID: {user.username} - Total Value: ${user.totalValue.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;
