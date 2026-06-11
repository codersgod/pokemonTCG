'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { PokemonCard, CollectionItem } from '../types';
import { getMarketPrice } from '../api';

interface CollectionState {
  items: CollectionItem[];
}

type Action =
  | { type: 'SET_ITEMS'; items: CollectionItem[] }
  | { type: 'ADD_CARD'; card: PokemonCard }
  | { type: 'REMOVE_CARD'; cardId: string }
  | { type: 'UPDATE_QTY'; cardId: string; quantity: number };

function reducer(state: CollectionState, action: Action): CollectionState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { items: action.items };

    case 'ADD_CARD': {
      const existing = state.items.find((i) => i.card.id === action.card.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.card.id === action.card.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        items: [...state.items, { card: action.card, quantity: 1, addedAt: new Date().toISOString() }],
      };
    }

    case 'REMOVE_CARD':
      return { items: state.items.filter((i) => i.card.id !== action.cardId) };

    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.card.id !== action.cardId) };
      }
      return {
        items: state.items.map((i) =>
          i.card.id === action.cardId ? { ...i, quantity: action.quantity } : i
        ),
      };
    }

    default:
      return state;
  }
}

interface CollectionContextValue {
  items: CollectionItem[];
  addCard: (card: PokemonCard) => void;
  removeCard: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  isInCollection: (cardId: string) => boolean;
  getQuantity: (cardId: string) => number;
  totalValue: number;
  totalCards: number;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

const STORAGE_KEY = 'pokemon-tcg-collection';

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'SET_ITEMS', items: parsed });
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch { /* ignore */ }
  }, [state.items]);

  const addCard = useCallback((card: PokemonCard) => {
    dispatch({ type: 'ADD_CARD', card });
  }, []);

  const removeCard = useCallback((cardId: string) => {
    dispatch({ type: 'REMOVE_CARD', cardId });
  }, []);

  const updateQuantity = useCallback((cardId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QTY', cardId, quantity });
  }, []);

  const isInCollection = useCallback(
    (cardId: string) => state.items.some((i) => i.card.id === cardId),
    [state.items]
  );

  const getQuantity = useCallback(
    (cardId: string) => state.items.find((i) => i.card.id === cardId)?.quantity || 0,
    [state.items]
  );

  const totalValue = state.items.reduce((sum, item) => {
    const price = getMarketPrice(item.card);
    return sum + (price || 0) * item.quantity;
  }, 0);

  const totalCards = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CollectionContext.Provider
      value={{ items: state.items, addCard, removeCard, updateQuantity, isInCollection, getQuantity, totalValue, totalCards }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection must be used within CollectionProvider');
  return ctx;
}
