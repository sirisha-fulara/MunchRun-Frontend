import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { orderService } from "../../services/order.service"
import Navbar from "../../components/Navbar"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { toast } from "sonner"
import { useCart } from "../../context/CartContext"
import { io } from "socket.io-client"
import { CheckCircle, Clock, ChefHat, Bell, XCircle } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

// status config — one place to control all status UI
const STATUS_CONFIG = {
  pending: {
    label: "Order Placed",
    description: "Waiting for canteen to confirm",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-700",
    step: 1
  },
  confirmed: {
    label: "Confirmed",
    description: "Canteen has confirmed your order",
    icon: CheckCircle,
    color: "bg-blue-100 text-blue-700",
    step: 2
  },
  preparing: {
    label: "Being Prepared",
    description: "Your food is being cooked 🍳",
    icon: ChefHat,
    color: "bg-orange-100 text-orange-700",
    step: 3
  },
  ready: {
    label: "Ready for Pickup!",
    description: "Walk to the canteen and collect your order",
    icon: Bell,
    color: "bg-green-100 text-green-700",
    step: 4
  },
  picked_up: {
    label: "Picked Up",
    description: "Enjoy your meal!",
    icon: CheckCircle,
    color: "bg-gray-100 text-gray-700",
    step: 5
  },
  cancelled: {
    label: "Cancelled",
    description: "This order was cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
    step: 0
  }
}

export default function OrderTrackingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cartCount } = useCart()
  const { user } = useAuth()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
    setupSocket()
  }, [id])

  const fetchOrder = async () => {
    try {
      const res = await orderService.getOrder(id)
      setOrder(res.data.order)
    } catch (err) {
      toast.error("Failed to load order")
    } finally {
      setLoading(false)
    }
  }

  const setupSocket = () => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    const SOCKET_URL = 'https://munchrun-backend.onrender.com'
    const socket = io(SOCKET_URL)

    socket.on("connect", () => {
      socket.emit("join", { token })
    })

    // listen for status updates
    socket.on("order_status_update", (data) => {
      if (data.order_id === parseInt(id)) {
        setOrder(prev => ({ ...prev, status: data.status }))
        toast.success(data.message)
      }
    })

    // cleanup on unmount
    return () => socket.disconnect()
  }

  const handleCancel = async () => {
    try {
      await orderService.cancelOrder(id)
      setOrder(prev => ({ ...prev, status: "cancelled" }))
      toast.success("Order cancelled")
    } catch (err) {
      toast.error(err.response?.data?.error || "Cannot cancel order")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={cartCount} />
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-4" />
          <div className="h-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={cartCount} />
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Order not found</p>
          <Button className="mt-4" onClick={() => navigate("/orders")}>
            View All Orders
          </Button>
        </div>
      </div>
    )
  }

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const StatusIcon = config.icon
  const steps = ["pending", "confirmed", "preparing", "ready", "picked_up"]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* order id header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <Badge className={config.color}>
            {config.label}
          </Badge>
        </div>

        {/* status card */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className={`inline-flex p-4 rounded-full ${config.color} mb-4`}>
              <StatusIcon className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold mb-1">{config.label}</h2>
            <p className="text-muted-foreground text-sm">{config.description}</p>
          </CardContent>
        </Card>

        {/* progress steps — only show if not cancelled */}
        {order.status !== "cancelled" && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const stepConfig = STATUS_CONFIG[step]
                  const StepIcon = stepConfig.icon
                  const isCompleted = config.step > stepConfig.step
                  const isCurrent = config.step === stepConfig.step

                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}>
                          <StepIcon className="h-4 w-4" />
                        </div>
                        <p className="text-xs mt-1 text-center text-muted-foreground hidden sm:block">
                          {stepConfig.label.split(" ")[0]}
                        </p>
                      </div>
                      {/* connector line */}
                      {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 ${config.step > stepConfig.step
                            ? "bg-green-500"
                            : "bg-gray-200"
                          }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* pickup time */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Pickup Slot</p>
              <p className="font-semibold">
                {order.slot_id ? `Slot #${order.slot_id}` : "Not assigned"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* order items */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">Order Items</h3>
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.menu_item_name} × {item.quantity}
                </span>
                <span className="font-medium">
                  ₹{(item.price_at_order * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-orange-500">₹{order.total_price}</span>
            </div>
          </CardContent>
        </Card>

        {/* cancel button — only if pending */}
        {order.status === "pending" && (
          <Button
            variant="outline"
            className="w-full border-red-300 text-red-500 hover:bg-red-50"
            onClick={handleCancel}
          >
            Cancel Order
          </Button>
        )}

        {/* view all orders */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/orders")}
        >
          View All Orders
        </Button>

      </div>
    </div>
  )
}