"use client";

/**
 * Guarda os pedidos confirmados nesta sessão de navegação.
 * O histórico real vem de GET /stores/{slug}/orders (useCustomerOrders),
 * usado por OrdersTab e ReviewsTab. Este contexto é só write-only hoje:
 * o checkout chama saveOrder, mas nenhuma tela ainda lê `orders` daqui.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SessionOrderItem = {
  variantId: string;
  productName: string;
  variantName: string;
  qty: number;
  unitPrice: number;
};

export type SessionOrder = {
  id: string;
  total: number;
  deliveryType: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: SessionOrderItem[];
};

type OrdersContextValue = {
  orders: SessionOrder[];
  saveOrder: (order: SessionOrder) => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<SessionOrder[]>([]);

  const saveOrder = useCallback((order: SessionOrder) => {
    setOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev;
      return [order, ...prev];
    });
  }, []);

  const value = useMemo(() => ({ orders, saveOrder }), [orders, saveOrder]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders deve ser usado dentro de <OrdersProvider>.");
  return ctx;
}
