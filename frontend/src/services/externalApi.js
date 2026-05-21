import axios from 'axios';

const EXCHANGE_RATE_API_URL = 'https://v6.exchangerate-api.com/v6/latest/INR';

/**
 * Fetch live exchange rates from ExchangeRate API.
 * Falls back to approximate rates if the API is unavailable.
 */
export const getExchangeRates = async () => {
    try {
        const response = await axios.get(EXCHANGE_RATE_API_URL);
        return response.data.conversion_rates;
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        return { USD: 0.012, INR: 1 }; // Approximate fallback
    }
};
