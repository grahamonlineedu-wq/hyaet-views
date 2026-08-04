import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './src/context/CartContext';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <HomeScreen />
      </CartProvider>
    </SafeAreaProvider>
  );
}

