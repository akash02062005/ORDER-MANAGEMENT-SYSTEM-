import { useState, useEffect } from 'react';
import api from '../services/api';
import { connectWebSocket, disconnectWebSocket } from '../websocket/orderSocket';
import { MOCK_ORDERS } from '../services/mockData';

export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const response = await api.get('/orders');
            const data = Array.isArray(response.data) ? response.data : [];
            setOrders(data.length > 0 ? [...data].reverse() : MOCK_ORDERS);
        } catch (error) {
            console.warn("Failed to fetch orders, using demo data", error);
            setOrders(MOCK_ORDERS);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        // Connect to WebSocket for real-time updates
        connectWebSocket((newOrder) => {
            setOrders(prev => {
                const index = prev.findIndex(o => o.id === newOrder.id);
                if (index > -1) {
                    const updated = [...prev];
                    updated[index] = newOrder;
                    return updated;
                }
                return [newOrder, ...prev];
            });
        });

        return () => disconnectWebSocket();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status?status=${status}`);
            // WebSocket will handle the UI update via broadcast
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    return { orders, loading, updateStatus, refresh: fetchOrders };
};
