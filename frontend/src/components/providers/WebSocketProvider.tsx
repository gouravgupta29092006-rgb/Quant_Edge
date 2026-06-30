'use client';

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useMarketStore } from '@/stores/marketStore';
import { useAuthStore } from '@/stores/authStore';
import { tokenStore } from '@/lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

/**
 * WebSocket provider — maintains STOMP connection over SockJS.
 * Subscribes to /topic/price/{symbol} for each watched symbol.
 * Dispatches updates to marketStore via updateQuote().
 * Per TECH_SPEC.md §13 — Real-Time Features.
 *
 * ₹0 cost: Uses Spring Boot's built-in WebSocket (no paid service).
 */
export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<Client | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { watchedSymbols, updateQuote, setConnected } = useMarketStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${tokenStore.getAccess() || ''}`,
      },
      reconnectDelay: 5000,

      onConnect: () => {
        setConnected(true);
        console.debug('[WS] Connected to QuantEdge live feed');

        // Subscribe to all watched symbols
        watchedSymbols.forEach((symbol) => {
          client.subscribe(`/topic/price/${symbol}`, (msg) => {
            try {
              const quote = JSON.parse(msg.body);
              updateQuote({
                symbol: quote.symbol,
                name: quote.name,
                price: quote.price,
                changeAmount: quote.changeAmount || quote.change,
                changePercent: quote.changePercent,
                direction: quote.changePercent > 0 ? 'up' : quote.changePercent < 0 ? 'down' : 'flat',
                volume: quote.volume,
                updatedAt: new Date().toISOString(),
              });
            } catch (e) {
              console.warn('[WS] Failed to parse price update', e);
            }
          });
        });

        // Subscribe to index updates
        client.subscribe('/topic/indices', (msg) => {
          // Handled by marketStore on next poll
        });
      },

      onDisconnect: () => {
        setConnected(false);
        console.debug('[WS] Disconnected from live feed');
      },

      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers.message);
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, watchedSymbols.join(',')]);

  return <>{children}</>;
}
