import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { orderService } from "../../services/order.service"
import Navbar from "../../components/Navbar"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { useCart } from "../../context/CartContext"
import { toast } from "sonner"
import { Clock, ChevronRight, ShoppingBag } from "lucide-react"

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-green-100 text-green-700",
  picked_up: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600"
}

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready!",
  picked_up: "Picked Up",
  cancelled: "Cancelled"
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { cartCount } = useCart()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await orderService.myOrders()
      setOrders(res.data.orders)
    } catch (err) {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "Z")
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: 'Asia/Kolkata'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />

      <div className="max-w-xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {/* loading state */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* empty state */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm mb-6">
              Place your first order from the menu
            </p>
            <Button onClick={() => navigate("/")}>
              Browse Menu
            </Button>
          </div>
        )}

        {/* orders list */}
        {!loading && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map(order => (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">

                    <div className="flex-1 min-w-0">
                      {/* order id + status */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Order #{order.id}</span>
                        <Badge className={`text-xs ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </div>

                      {/* items summary */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {order.items.map(i =>
                          `${i.menu_item_name} ×${i.quantity}`
                        ).join(", ")}
                      </p>

                      {/* time + total */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(order.created_at)}
                        </span>
                        <span className="text-xs font-semibold text-orange-500">
                          ₹{order.total_price}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}