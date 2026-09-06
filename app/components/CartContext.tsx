"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import type { ShopifyProduct, ShopifyProductVariant } from "../lib/shopify/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CartItem {
  variantId: string;
  productId: string;
  handle: string;
  title: string;
  variantTitle: string;
  imageUrl: string | null;
  imageAlt: string | null;
  /** Formatted price string e.g. "₹1,200.00" */
  formattedPrice: string;
  /** Raw numeric amount for subtotal calculation */
  priceAmount: number;
  currencyCode: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; variantId: string }
  | { type: "UPDATE_QUANTITY"; variantId: string; quantity: number }
  | { type: "HYDRATE"; items: CartItem[] };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };

    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.variantId === action.payload.variantId
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === action.payload.variantId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...action.payload, quantity: 1 }] };
    }

    case "REMOVE_ITEM":
      return {
        items: state.items.filter((i) => i.variantId !== action.variantId),
      };

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter((i) => i.variantId !== action.variantId),
        };
      }
      return {
        items: state.items.map((i) =>
          i.variantId === action.variantId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  currencyCode: string;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: ShopifyProduct, variantId: string) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "tvaloka_cart_v1";

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", items: parsed });
        }
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore storage errors
    }
  }, [state.items, hydrated]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    (product: ShopifyProduct, variantId: string) => {
      const variant: ShopifyProductVariant | undefined = product.variants.find(
        (v) => v.id === variantId
      );
      if (!variant) return;

      const priceAmount = parseFloat(variant.price?.amount ?? "0");
      const currency = variant.price?.currencyCode ?? "INR";
      const formattedPrice = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(priceAmount);

      const variantTitle =
        variant.title === "Default Title" ? "" : variant.title;

      const item: CartItem = {
        variantId,
        productId: product.id,
        handle: product.handle,
        title: product.title,
        variantTitle,
        imageUrl: variant.image?.url ?? product.featuredImage?.url ?? null,
        imageAlt:
          variant.image?.altText ??
          product.featuredImage?.altText ??
          product.title,
        formattedPrice,
        priceAmount,
        currencyCode: currency,
        quantity: 1,
      };

      dispatch({ type: "ADD_ITEM", payload: item });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((variantId: string) => {
    dispatch({ type: "REMOVE_ITEM", variantId });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", variantId, quantity });
  }, []);

  const totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.priceAmount * i.quantity,
    0
  );
  const currencyCode = state.items[0]?.currencyCode ?? "INR";

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalQuantity,
        subtotal,
        currencyCode,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
