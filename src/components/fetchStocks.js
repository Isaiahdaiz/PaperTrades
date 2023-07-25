import axios from 'axios';

// This function fetches stocks based on the search term.
// This function fetches stocks based on the search term.
async function fetchStocks(searchTerm) {
    try {
        // Replace with the actual URL for your API.
        const url = `https://api.stockdata.org/v1/data/quote?symbols=${searchTerm}&api_token=${process.env.REACT_APP_API_TOKEN}`;
        const response = await axios.get(url);
        // Adjust this according to the actual response structure of your API.
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching stocks: ${error}`);
        return []; // Return an empty array on error.
    }
}


export default fetchStocks;
