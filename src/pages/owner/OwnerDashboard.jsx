import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"
import { io } from "socket.io-client"
import {
  UtensilsCrossed, LogOut, ShoppingBag, IndianRupee,
  Clock, ChefHat, Bell, CheckCircle, Plus, ToggleLeft,
  ToggleRight, Trash2, Loader2
} from "lucide-react"
import api from "../../services/api"

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-green-100 text-green-700",
  picked_up: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600"
}

const NEXT_STATUS = {
  pending: { label: "Confirm", next: "confirmed", icon: CheckCircle },
  confirmed: { label: "Prepare", next: "preparing", icon: ChefHat },
  preparing: { label: "Ready!", next: "ready", icon: Bell },
  ready: { label: "Picked Up", next: "picked_up", icon: CheckCircle },
}

export default function OwnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // tabs
  const [activeTab, setActiveTab] = useState("orders")

  // orders state
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  // stats state
  const [stats, setStats] = useState(null)

  // menu state
  const [menuItems, setMenuItems] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "", price: "", category: "breakfast", description: ""
  })
  const [addingItem, setAddingItem] = useState(false)

  // slots state
  const [slots, setSlots] = useState([])
  const [newSlotTime, setNewSlotTime] = useState("")
  const [addingSlot, setAddingSlot] = useState(false)

  // socket
  useEffect(() => {
    setupSocket()
    fetchOrders()
    fetchStats()
  }, [])

  useEffect(() => {
    if (activeTab === "menu") fetchMenu()
    if (activeTab === "slots") fetchSlots()
  }, [activeTab])

  // ── SOCKET SETUP ──────────────────────────────────────
  const setupSocket = () => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"
    const socket = io(SOCKET_URL)

    socket.on("connect", () => {
      socket.emit("join", { token })
    })

    // new order comes in — add to top of list
    socket.on("new_order", (order) => {
      setOrders(prev => [order, ...prev])
      toast.success(`New order #${order.id} received! 🔔`)
    })

    return () => socket.disconnect()
  }

  // ── ORDERS ────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/incoming")
      setOrders(res.data.orders)
    } catch (err) {
      toast.error("Failed to load orders")
    } finally {
      setOrdersLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      setOrders(prev =>
        newStatus === "picked_up"
          ? prev.filter(o => o.id !== orderId) // remove from active
          : prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      )
      toast.success(`Order #${orderId} marked as ${newStatus}`)
    } catch (err) {
      toast.error("Failed to update order")
    }
  }

  // ── STATS ─────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats")
      setStats(res.data)
    } catch (err) {
      console.error("Failed to load stats")
    }
  }

  // ── MENU ──────────────────────────────────────────────
  const fetchMenu = async () => {
    setMenuLoading(true)
    try {
      const res = await api.get("/menu/")
      setMenuItems(res.data.items)
    } catch (err) {
      toast.error("Failed to load menu")
    } finally {
      setMenuLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Name, price and category are required")
      return
    }
    setAddingItem(true)
    try {
      const res = await api.post("/menu/", newItem)
      setMenuItems(prev => [...prev, res.data.item])
      setNewItem({ name: "", price: "", category: "breakfast", description: "" })
      setShowAddItem(false)
      toast.success(`${res.data.item.name} added!`)
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add item")
    } finally {
      setAddingItem(false)
    }
  }

  const handleToggleItem = async (itemId) => {
    try {
      const res = await api.patch(`/menu/${itemId}/toggle`)
      setMenuItems(prev =>
        prev.map(i => i.id === itemId ? res.data.item : i)
      )
      toast.success(res.data.message)
    } catch (err) {
      toast.error("Failed to toggle item")
    }
  }

  const handleDeleteItem = async (itemId, itemName) => {
    if (!window.confirm(`Delete ${itemName}?`)) return
    try {
      await api.delete(`/menu/${itemId}`)
      setMenuItems(prev => prev.filter(i => i.id !== itemId))
      toast.success(`${itemName} deleted`)
    } catch (err) {
      toast.error("Failed to delete item")
    }
  }

  // ── SLOTS ─────────────────────────────────────────────
  const fetchSlots = async () => {
    try {
      const res = await api.get("/slots/")
      setSlots(res.data.slots)
    } catch (err) {
      toast.error("Failed to load slots")
    }
  }

  const handleAddSlot = async () => {
    if (!newSlotTime) {
      toast.error("Please enter a time slot")
      return
    }
    setAddingSlot(true)
    try {
      const res = await api.post("/slots/", { slot_time: newSlotTime, max_orders: 20 })
      setSlots(prev => [...prev, res.data.slot])
      setNewSlotTime("")
      toast.success("Slot added!")
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add slot")
    } finally {
      setAddingSlot(false)
    }
  }

  const handleDeleteSlot = async (slotId) => {
    try {
      await api.delete(`/slots/${slotId}`)
      setSlots(prev => prev.filter(s => s.id !== slotId))
      toast.success("Slot deleted")
    } catch (err) {
      toast.error("Failed to delete slot")
    }
  }

  const handleResetSlots = async () => {
    if (!window.confirm("Reset all slot counts to 0?")) return
    try {
      await api.patch("/admin/slots/reset")
      await fetchSlots()
      toast.success("All slots reset!")
    } catch (err) {
      toast.error("Failed to reset slots")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const categoryEmoji = {
    breakfast: "🌅", lunch: "🍱", snacks: "🍟", drinks: "☕"
  }

  // ── RENDER ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-orange-500" />
            <span className="text-xl font-bold text-orange-500">Canto</span>
            <span className="text-sm text-muted-foreground ml-2">
              Owner Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Today's Orders</span>
                </div>
                <p className="text-2xl font-bold">{stats.today.orders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Today's Revenue</span>
                </div>
                <p className="text-2xl font-bold">₹{stats.today.revenue}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
                <p className="text-2xl font-bold">{stats.right_now.pending_orders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Ready for Pickup</span>
                </div>
                <p className="text-2xl font-bold">{stats.right_now.ready_for_pickup}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {["orders", "menu", "slots"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-muted-foreground hover:text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Incoming Orders
                {orders.length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {orders.length}
                  </span>
                )}
              </h2>
              <Button variant="outline" size="sm" onClick={fetchOrders}>
                Refresh
              </Button>
            </div>

            {ordersLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {!ordersLoading && orders.length === 0 && (
              <div className="text-center py-16">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active orders right now</p>
              </div>
            )}

            {orders.map(order => {
              const nextAction = NEXT_STATUS[order.status]
              const NextIcon = nextAction?.icon

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">

                      <div className="flex-1 min-w-0">
                        {/* order header */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg">#{order.id}</span>
                          <Badge className={`text-xs ${STATUS_COLORS[order.status]}`}>
                            {order.status.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            Slot #{order.slot_id}
                          </span>
                        </div>

                        {/* items */}
                        <div className="space-y-1 mb-3">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.menu_item_name} × {item.quantity}
                              </span>
                              <span className="text-gray-500">
                                ₹{(item.price_at_order * item.quantity).toFixed(0)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* total */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-orange-500">
                            Total: ₹{order.total_price}
                          </span>

                          {/* action button */}
                          {nextAction && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, nextAction.next)}
                            >
                              {NextIcon && <NextIcon className="h-4 w-4 mr-1" />}
                              {nextAction.label}
                            </Button>
                          )}
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* ── MENU TAB ── */}
        {activeTab === "menu" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Menu Items</h2>
              <Button size="sm" onClick={() => setShowAddItem(!showAddItem)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {/* add item form */}
            {showAddItem && (
              <Card className="mb-4 border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">New Menu Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    placeholder="Price (₹)"
                    type="number"
                    value={newItem.price}
                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newItem.description}
                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  />
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">🍱 Lunch</option>
                    <option value="snacks">🍟 Snacks</option>
                    <option value="drinks">☕ Drinks</option>
                  </select>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleAddItem}
                      disabled={addingItem}
                    >
                      {addingItem
                        ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Adding...</>
                        : "Add Item"
                      }
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddItem(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* menu items list */}
            {menuLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {menuItems.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{item.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {categoryEmoji[item.category]}
                            </span>
                            {!item.is_available && (
                              <Badge variant="outline" className="text-xs text-red-500 border-red-300">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-orange-500 font-semibold">
                            ₹{item.price}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* toggle availability */}
                          <button
                            onClick={() => handleToggleItem(item.id)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title={item.is_available ? "Mark unavailable" : "Mark available"}
                          >
                            {item.is_available
                              ? <ToggleRight className="h-5 w-5 text-green-500" />
                              : <ToggleLeft className="h-5 w-5 text-gray-400" />
                            }
                          </button>

                          {/* delete */}
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SLOTS TAB ── */}
        {activeTab === "slots" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Time Slots</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSlots}
              >
                Reset All Counts
              </Button>
            </div>

            {/* add slot */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-2">Add New Slot</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 1:00 PM"
                    value={newSlotTime}
                    onChange={e => setNewSlotTime(e.target.value)}
                  />
                  <Button onClick={handleAddSlot} disabled={addingSlot}>
                    {addingSlot ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* slots list */}
            <div className="space-y-2">
              {slots.map(slot => (
                <Card key={slot.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{slot.slot_time}</p>
                        <p className="text-xs text-muted-foreground">
                          {slot.current_orders} / {slot.max_orders} orders
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* capacity bar */}
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${slot.current_orders >= slot.max_orders
                              ? "bg-red-500"
                              : slot.current_orders >= slot.max_orders * 0.7
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              }`}
                            style={{
                              width: `${Math.min((slot.current_orders / slot.max_orders) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}