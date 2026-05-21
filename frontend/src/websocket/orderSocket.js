import { Client } from '@stomp/stompjs';
import { toast } from 'react-toastify';

let stompClient = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export const connectWebSocket = (onOrderReceived) => {
  if (stompClient) return; // already trying to connect

  stompClient = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 5000,
    onConnect: () => {
      isConnected = true;
      reconnectAttempts = 0;
      console.log('✅ WebSocket connected');
      stompClient.subscribe('/topic/orders', (message) => {
        try {
          const order = JSON.parse(message.body);
          toast.info(`🚀 New Order: #${(order.id || '').slice(-6).toUpperCase()} by ${order.customerName || 'Customer'}`, {
            position: 'top-right',
            autoClose: 5000,
          });
          if (onOrderReceived) onOrderReceived(order);
        } catch (e) {
          console.warn('WS message parse error', e);
        }
      });
    },
    onStompError: (frame) => {
      console.warn('WebSocket STOMP error (backend may be offline):', frame.headers?.['message']);
    },
    onWebSocketError: (event) => {
      reconnectAttempts++;
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn('WebSocket: max reconnect attempts reached. Running in offline mode.');
        stompClient?.deactivate?.();
        stompClient = null;
      }
    },
    onDisconnect: () => {
      isConnected = false;
    },
  });

  try {
    stompClient.activate();
  } catch (e) {
    console.warn('WebSocket activation failed:', e);
    stompClient = null;
  }
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch (e) { /* ignore */ }
    stompClient = null;
    isConnected = false;
  }
};

export const isWebSocketConnected = () => isConnected;
