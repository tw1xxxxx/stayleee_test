"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  cartId: string; // Unique identifier: `${id}-${size}-${color}`
  id: number | string;
  title: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
  embroidery?: boolean;
}

export interface Order {
  id: string;
  address: string;
  status: string;
  amount: number;
  items: {
    id: number | string;
    name: string;
    price: number;
    quantity?: number;
  }[];
  date: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  paymentId?: string;
  paymentStatus?: 'pending' | 'succeeded' | 'canceled';
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity" | "cartId">) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  toggleSelection: (cartId: string) => void;
  selectedItems: string[];
  total: number;
  totalWithoutDiscount: number;
  getItemQuantity: (id: number, size: string, color: string, embroidery?: boolean) => number;
  clearCart: () => void;
  orders: Order[];
  isInitialized: boolean;
  totalBuyout: number;
  discount: number;
  addOrder: (order: Omit<Order, "id" | "date" | "status">) => Promise<Order | null>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  setItems: (items: CartItem[]) => void;
  setOrders: (orders: Order[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_ITEMS: CartItem[] = [];
const INITIAL_ORDERS: Order[] = [];

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  // total is derived from items and selectedItems, no need for state
  const [isInitialized, setIsInitialized] = useState(false);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const { user } = useAuth();

  // Calculate total buyout from paid orders
  const totalBuyout = orders
    .filter(o => o.paymentStatus === 'succeeded' || o.status === 'completed' || o.status === 'В обработке')
    .reduce((sum, order) => sum + order.amount, 0);

  // Calculate tiered discount
  const getDiscount = (buyout: number) => {
    if (buyout >= 500000) return 10;
    if (buyout >= 300000) return 7;
    if (buyout >= 100000) return 5;
    return 0;
  };

  const discount = getDiscount(totalBuyout);

  const totalWithoutDiscount = items
    .filter(item => selectedItems.includes(item.cartId))
    .reduce((sum, item) => {
      const itemPrice = item.price + (item.embroidery ? 900 : 0);
      return sum + (itemPrice * item.quantity);
    }, 0);

  const total = totalWithoutDiscount * (1 - discount / 100);

  // Fetch orders from backend when user is logged in
  useEffect(() => {
    if (user) {
      // Clear local storage orders when user logs in to avoid using mock data
      localStorage.removeItem("orders");
      
      fetch(`/api/orders?userId=${user.id}`)
        .then(async res => {
          if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
          }
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch {
            throw new Error("Invalid JSON response");
          }
        })
        .then(data => {
          if (data && data.orders) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedOrders = data.orders.map((o: any) => ({
              id: o.id,
              address: o.address,
              customer: o.customer,
              status: o.status === "processing" ? "В обработке" : o.status,
              amount: o.total,
              items: o.items,
              date: o.createdAt,
              paymentId: o.paymentId,
              paymentStatus: o.paymentStatus
            }));
            setOrders(mappedOrders);
          } else {
            setOrders([]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch orders:", err);
          setOrders([]);
        });
    } else {
      // User logged out or is guest
      // Load from localStorage (guest orders)
      const savedOrders = localStorage.getItem("orders");
      if (savedOrders) {
        try {
          // Use setTimeout to avoid synchronous state update in effect warning
          setTimeout(() => {
            const parsed = JSON.parse(savedOrders);
            if (Array.isArray(parsed)) {
              setOrders(parsed.filter((o: unknown) => {
                if (typeof o !== 'object' || o === null) return false;
                const order = o as { id: string };
                return /^\d+$/.test(order.id);
              }) as Order[]);
            }
          }, 0);
        } catch {
          setTimeout(() => setOrders([]), 0);
        }
      } else {
        setTimeout(() => setOrders([]), 0);
      }
    }
  }, [user]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem("cartItems");
    const savedSelected = localStorage.getItem("cartSelected");
    const savedOrders = localStorage.getItem("orders");
    
    if (savedItems) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedItems: any[] = JSON.parse(savedItems);
        // Migration: Ensure all items have a cartId
        const migratedItems: CartItem[] = parsedItems.map(item => {
          if (!item.cartId) {
            return {
              ...item,
              cartId: `${item.id}-${item.size}-${item.color}`
            };
          }
          return item;
        });
        // eslint-disable-next-line
        setItems(migratedItems);

        // If we migrated items, we should probably reset selection to match new cartIds
        // or try to migrate selection if possible (but simpler to just re-select all or let user select)
        // For better UX, let's select all if we had to migrate
        if (parsedItems.some(item => !item.cartId)) {
           // Migration happened, let's select all to be safe
           setSelectedItems(migratedItems.map(i => i.cartId));
           setIsInitialized(true);
           return; 
        }

      } catch (e) {
        console.error("Failed to parse cart items", e);
        // If parsing fails, start fresh
        setItems([]);
      }
    }
    
    if (savedSelected) {
      try {
        const parsedSelected = JSON.parse(savedSelected);
        if (Array.isArray(parsedSelected) && parsedSelected.length > 0) {
           if (typeof parsedSelected[0] === 'string') {
             setSelectedItems(parsedSelected);
           }
        } else if (Array.isArray(parsedSelected) && parsedSelected.length === 0) {
             setSelectedItems([]);
        }
      } catch (error) {
        console.error("Failed to parse selected items", error);
      }
    }

    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders.filter((o: unknown) => {
            if (typeof o !== 'object' || o === null) return false;
            const order = o as { id: string };
            return /^\d+$/.test(order.id);
          }) as Order[]);
        }
      } catch (error) {
        console.error("Failed to parse orders", error);
      }
    }
    
    setIsInitialized(true);
  }, []);

  // Save orders to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("orders", JSON.stringify(orders));
    }
  }, [orders, isInitialized]);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cartItems", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // Save to localStorage whenever selection changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cartSelected", JSON.stringify(selectedItems));
    }
  }, [selectedItems, isInitialized]);


  const addToCart = (product: Omit<CartItem, "quantity" | "cartId">) => {
    const cartId = `${product.id}-${product.size}-${product.color}${product.embroidery ? '-embroidery' : ''}`;
    
    setItems(prev => {
      const existingItem = prev.find(item => item.cartId === cartId);
      if (existingItem) {
        return prev.map(item => 
          item.cartId === cartId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { ...product, cartId, quantity: 1 }];
    });

    // Update selection for new items
    // React 18 will batch these state updates when called from event handlers
    setSelectedItems(prevSelected => 
      prevSelected.includes(cartId) ? prevSelected : [...prevSelected, cartId]
    );
  };

  const removeFromCart = (cartId: string) => {
    setItems(prev => prev.filter(item => item.cartId !== cartId));
    setSelectedItems(prev => prev.filter(id => id !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(item => 
      item.cartId === cartId ? { ...item, quantity } : item
    ));
  };

  const toggleSelection = (cartId: string) => {
    setSelectedItems(prev => 
      prev.includes(cartId) 
        ? prev.filter(id => id !== cartId)
        : [...prev, cartId]
    );
  };

  const getItemQuantity = (id: number, size: string, color: string, embroidery?: boolean) => {
    const cartId = `${id}-${size}-${color}${embroidery ? '-embroidery' : ''}`;
    return items.find(item => item.cartId === cartId)?.quantity || 0;
  };

  const clearCart = () => {
    setItems([]);
    setSelectedItems([]);
  };

  const addOrder = async (order: Omit<Order, "id" | "date" | "status">): Promise<Order | null> => {
    if (order.items.length === 0) return null;

    // Generate a temporary ID for optimistic update
    const tempId = Math.floor(100000 + Math.random() * 900000).toString();
    
    const newOrder: Order = {
      ...order,
      id: tempId,
      date: new Date().toISOString(),
      status: "В обработке",
      paymentStatus: 'pending' // Default to pending payment
    };
    
    // Optimistic update
    setOrders(prev => [newOrder, ...prev]);

    // Send to backend (for both guests and logged-in users)
    const user = localStorage.getItem("user");
    let userId = "guest";
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        userId = userData.id;
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          items: order.items,
          total: order.amount,
          address: order.address,
          status: "В обработке",
          createdAt: newOrder.date,
          customer: order.customer
        })
      });
      
      if (response.ok) {
          const data = await response.json();
          const realId = data.order.id;
          
          // Update the local order with the real ID from server
          setOrders(prev => prev.map(o => o.id === tempId ? { ...o, id: realId } : o));
          
          return { ...newOrder, id: realId };
      }
      return newOrder; // Fallback to temp ID if server fails but optimistic update succeeded (though risky for payments)
    } catch (err) {
      console.error("Failed to save order to backend", err);
      return newOrder;
    }
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      toggleSelection, 
      selectedItems, 
      total, 
      totalWithoutDiscount,
      getItemQuantity, 
      clearCart, 
      orders, 
      isInitialized,
      totalBuyout,
      discount,
      addOrder, 
      deleteOrder,
      setItems,
      setOrders
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
