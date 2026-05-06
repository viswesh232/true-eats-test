/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const getPrimaryImage = (product) => {
    if (product.image) return product.image;
    if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
    return '';
};

const normalizeCartItem = (product) => {
    const weight = product.weight || (product.weights?.length > 0 ? product.weights[0].weight : '');
    const price = product.weight ? product.price : (product.weights?.length > 0 ? product.weights[0].price : product.price);

    return {
        ...product,
        weight,
        price,
        cartId: weight ? `${product._id}-${weight}` : product._id,
        image: getPrimaryImage(product),
        images: Array.isArray(product.images)
            ? product.images
            : (product.image ? [product.image] : []),
    };
};

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

    const addToCart = (product, qtyToAdd = 1) => {
        const normalizedProduct = normalizeCartItem(product);
        setCartItems(prev => {
            const exist = prev.find((x) => x.cartId === normalizedProduct.cartId);
            if (exist) {
                return prev.map((x) => x.cartId === normalizedProduct.cartId ? { ...exist, qty: exist.qty + qtyToAdd } : x);
            } else {
                return [...prev, { ...normalizedProduct, qty: qtyToAdd }];
            }
        });
    };

    const removeFromCart = (product) => {
        const normalizedProduct = normalizeCartItem(product);
        setCartItems(prev => {
            const exist = prev.find((x) => x.cartId === normalizedProduct.cartId);
            if (!exist) return prev;
            if (exist.qty === 1) {
                return prev.filter((x) => x.cartId !== normalizedProduct.cartId);
            } else {
                return prev.map((x) => x.cartId === normalizedProduct.cartId ? { ...exist, qty: exist.qty - 1 } : x);
            }
        });
    };

    const deleteFromCart = (product) => {
        const normalizedProduct = normalizeCartItem(product);
        setCartItems(prev => prev.filter(x => x.cartId !== normalizedProduct.cartId));
    };

    const clearCart = () => setCartItems([]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, deleteFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
