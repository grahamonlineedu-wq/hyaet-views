import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';

const ESCROW_PROTECTION_FEE_PERCENT = 0.015; // 1.5% Escrow Security
const LOCAL_HUB_DELIVERY_FEE = 500;          // Flat delivery rate (₦500)

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([
    {
      id: 'item_1',
      groupId: 'grp_1',
      name: 'iPhone 15 Pro',
      price: 850000,
      originalPrice: 950000,
      quantity: 1,
      imageUri: 'https://picsum.photos/id/20/400/200'
    }
  ]);

  const updateQuantity = useCallback((id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const qty = item.quantity + delta;
        return qty > 0 ? { ...item, quantity: qty } : null;
      }
      return item;
    }).filter(Boolean));
  }, []);

  const escrowCalculations = useMemo(() => {
    const itemsSubtotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const originalSubtotal = cartItems.reduce((sum, i) => sum + (i.originalPrice * i.quantity), 0);
    const groupSavings = originalSubtotal - itemsSubtotal;
    const escrowFee = Math.round(itemsSubtotal * ESCROW_PROTECTION_FEE_PERCENT);
    const hubDeliveryFee = cartItems.length > 0 ? LOCAL_HUB_DELIVERY_FEE : 0;
    const totalEscrowLockAmount = itemsSubtotal + escrowFee + hubDeliveryFee;

    return { itemsSubtotal, groupSavings, escrowFee, hubDeliveryFee, totalEscrowLockAmount };
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, updateQuantity, ...escrowCalculations }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

