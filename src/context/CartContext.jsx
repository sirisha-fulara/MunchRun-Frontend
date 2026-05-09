import { createContext, useContext, useState } from "react";

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prev, { ...item, quantity: 1 }]
        })
    }

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i.id !== itemId))
    }

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId)
            return
        }
        setCart(prev =>
            prev.map(i => i.id === itemId ? { ...i, quantity } : i)
        )
    }

    const clearCart = () => setCart([])

    const cartTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    )

    const cartCount = cart.reduce(
        (sum, item) => sum + item.quantity, 0
    )

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
