"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

export type CartItem = {
  variantId: string;
  qty: number;
  productName: string;
  variantName: string;
  finalPrice: number;
  stock: number;
};

type State = { items: CartItem[] };

type Action =
  | { type: "ADD"; item: Omit<CartItem, "qty">; qty: number }
  | { type: "SET_QTY"; variantId: string; qty: number }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.variantId === action.item.variantId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === action.item.variantId
              ? { ...i, qty: Math.min(i.stock, i.qty + action.qty) }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...action.item, qty: Math.min(action.item.stock, action.qty) }] };
    }
    case "SET_QTY": {
      if (action.qty <= 0) return { items: state.items.filter((i) => i.variantId !== action.variantId) };
      return {
        items: state.items.map((i) =>
          i.variantId === action.variantId ? { ...i, qty: Math.min(i.stock, action.qty) } : i,
        ),
      };
    }
    case "CLEAR":
      return { items: [] };
    case "LOAD":
      return { items: action.items };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function storageKey(slug: string) {
  return `cart-${slug}`;
}

export function CartProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // Hidrata do localStorage no mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(slug));
      if (raw) {
        const items = JSON.parse(raw) as CartItem[];
        if (Array.isArray(items)) dispatch({ type: "LOAD", items });
      }
    } catch {
      // localStorage indisponível (SSR, private mode)
    }
  }, [slug]);

  // Persiste no localStorage a cada mudança
  useEffect(() => {
    try {
      localStorage.setItem(storageKey(slug), JSON.stringify(state.items));
    } catch {}
  }, [slug, state.items]);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    dispatch({ type: "ADD", item, qty });
  }, []);

  const setQty = useCallback((variantId: string, qty: number) => {
    dispatch({ type: "SET_QTY", variantId, qty });
  }, []);

  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((s, i) => s + i.qty, 0);
    const subtotal = state.items.reduce((s, i) => s + i.finalPrice * i.qty, 0);
    return { items: state.items, addItem, setQty, clear, count, subtotal };
  }, [state.items, addItem, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>.");
  return ctx;
}
