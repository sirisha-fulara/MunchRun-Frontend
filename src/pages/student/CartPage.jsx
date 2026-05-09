import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { orderService } from "../../services/order.service"
import Navbar from "../../components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react"

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart()
  const navigate = useNavigate()

  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const res = await orderService.getSlots()
      setSlots(res.data.slots)
    } catch (err) {
      toast.error("Failed to load time slots")
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedSlot) {
      toast.error("Please select a pickup time slot")
      return
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setLoading(true)

    try {
      const orderData = {
        slot_id: selectedSlot,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        }))
      }

      const res = await orderService.placeOrder(orderData)
      clearCart()
      toast.success("Order placed successfully! 🎉")
      navigate(`/orders/${res.data.order.id}`)
    } catch (err) {
      const message = err.response?.data?.error || "Failed to place order"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={0} />
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-6">
            Add some items from the menu
          </p>
          <Button onClick={() => navigate("/")}>
            Browse Menu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold">Your Cart</h1>

        {/* cart items */}
        <Card>
          <CardContent className="p-4 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-3">

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-orange-500 font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-7 w-7 rounded-full border border-orange-500 text-orange-500 flex items-center justify-center hover:bg-orange-50"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-semibold w-4 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-7 w-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

              </div>
            ))}
          </CardContent>
        </Card>

        {/* time slot selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Pickup Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No slots available right now
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => !slot.is_full && setSelectedSlot(slot.id)}
                    disabled={slot.is_full}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      slot.is_full
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : selectedSlot === slot.id
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-300"
                    }`}
                  >
                    {slot.slot_time}
                    {slot.is_full && (
                      <span className="block text-xs mt-0.5">Full</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* order summary */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal ({cartCount} items)</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span className="text-orange-500">₹{cartTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* place order button */}
        <Button
          className="w-full py-6 text-base"
          onClick={handlePlaceOrder}
          disabled={loading || !selectedSlot}
        >
          {loading ? "Placing Order..." : `Place Order • ₹${cartTotal.toFixed(2)}`}
        </Button>

        {/* clear cart */}
        <button
          onClick={clearCart}
          className="w-full text-sm text-red-400 hover:text-red-600 text-center py-2"
        >
          Clear cart
        </button>

      </div>
    </div>
  )
}