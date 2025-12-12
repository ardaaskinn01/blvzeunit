import { createContext, useContext, useEffect, useState } from 'react';
import type { Tables } from '../types/database.types';

// CartItem tipi: Product tablosundan türetilmiş ama beden ve adet bilgisi eklenmiş
export interface CartItem {
    id: string;        // Benzersiz sepet elemanı ID'si (örn: product_id + size)
    product_id: string; // Veritabanındaki ürün ID'si (UUID)
    name: string;
    price: number;
    image_url?: string | null;
    size: string;
    quantity: number;
    slug: string;      // Ürün linkine gitmek için
}

// Adres tipi
export interface Address {
    city: string;
    district: string;
    neighborhood: string;
    fullAddress: string;
    zipCode: string;
    phone: string;
    recipientName: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Tables<'products'> & { imageUrl?: string; name: string }, size: string, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isCartOpen: boolean;
    toggleCart: () => void;
    userAddress: Address | null;
    setUserAddress: (address: Address | null) => void;
    saveAddressToStorage: (address: Address) => void;
    loadAddressFromStorage: () => Address | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [userAddress, setUserAddress] = useState<Address | null>(null);

    // 1. Başlangıçta LocalStorage'dan yükle
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem('shopping-cart');
            if (storedCart) {
                setItems(JSON.parse(storedCart));
            }

            // Adresi de yükle
            const storedAddress = localStorage.getItem('user-address');
            if (storedAddress) {
                setUserAddress(JSON.parse(storedAddress));
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }, []);

    // 2. Items değiştiğinde LocalStorage'a kaydet
    useEffect(() => {
        try {
            localStorage.setItem('shopping-cart', JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error);
        }
    }, [items]);

    const addToCart = (product: Tables<'products'> & { imageUrl?: string }, size: string, quantity = 1) => {
        setItems((prevItems) => {
            const itemId = `${product.id}-${size}`;
            const existingItem = prevItems.find((item) => item.id === itemId);

            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === itemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            const newItem: CartItem = {
                id: itemId,
                product_id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url || null,
                size,
                quantity,
                slug: product.slug
            };

            return [...prevItems, newItem];
        });
    };

    const saveAddressToStorage = (address: Address) => {
        try {
            localStorage.setItem('user-address', JSON.stringify(address));
            setUserAddress(address);
        } catch (error) {
            console.error('Failed to save address to localStorage:', error);
        }
    };

    const loadAddressFromStorage = (): Address | null => {
        try {
            const storedAddress = localStorage.getItem('user-address');
            return storedAddress ? JSON.parse(storedAddress) : null;
        } catch (error) {
            console.error('Failed to load address from localStorage:', error);
            return null;
        }
    };

    const removeFromCart = (itemId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const toggleCart = () => {
        setIsCartOpen((prev) => !prev);
    };

    const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
                isCartOpen,
                toggleCart,
                userAddress,
                setUserAddress,
                saveAddressToStorage,
                loadAddressFromStorage,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}