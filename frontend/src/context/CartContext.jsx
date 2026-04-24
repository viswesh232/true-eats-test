/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const getPrimaryImage = (product) => {
    if (product.image) return product.image;
    if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
    return '';
};

const normalizeCartItem = (product) => ({
    ...product,
    image: getPrimaryImage(product),
    images: Array.isArray(product.images)
        ? product.images
        : (product.image ? [product.image] : []),
});

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('trueEatsCart');
        if (savedCart) {
            return JSON.parse(savedCart).map(normalizeCartItem);
        }
        return [];
    });

    // Save cart to LocalStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('trueEatsCart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        const normalizedProduct = normalizeCartItem(product);
        const exist = cartItems.find((x) => x._id === product._id);
        if (exist) {
            setCartItems(cartItems.map((x) => x._id === product._id ? { ...exist, qty: exist.qty + 1 } : x));
        } else {
            setCartItems([...cartItems, { ...normalizedProduct, qty: 1 }]);
        }
    };

    const removeFromCart = (product) => {
        const exist = cartItems.find((x) => x._id === product._id);
        if (exist.qty === 1) {
            setCartItems(cartItems.filter((x) => x._id !== product._id));
        } else {
            setCartItems(cartItems.map((x) => x._id === product._id ? { ...exist, qty: exist.qty - 1 } : x));
        }
    };

    const clearCart = () => setCartItems([]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
