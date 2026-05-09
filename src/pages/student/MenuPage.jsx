import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { menuService } from '../../services/menu.service'
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"
import { Plus, Minus, ShoppingCart, Search } from "lucide-react"
import { Input } from "../../components/ui/input"
import Navbar from "../../components/Navbar";

export default function MenuPage() {
  const { cart, addToCart, updateQuantity, cartCount } = useCart()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  //fetch menu on loading
  useEffect(() => {
    fetchMenu()
    fetchCategories()
  }, [selectedCategory])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      const res = await menuService.getAll(selectedCategory)
      setItems(res.data.items)
    }
    catch (err) {
      toast.error('Failed to load menu')
    }
    finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await menuService.getCategories()
      setCategories(res.data.categories)
    }
    catch (err) {
      console.error("Failed to load categories")
    }
  }

  //getting qty of items 
  const getCartQuantity = (itemId) => {
    const cartItem = cart.find(i => i.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  // filter by search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const categoryEmoji = {
    breakfast: "🌅",
    lunch: "🍱",
    snacks: "🍟",
    drinks: "☕"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Today's Menu</h1>
          <p className="text-muted-foreground text-sm">
            Order ahead, skip the queue 🚀
          </p>
        </div>

        {/* search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* category filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === null
              ? "bg-orange-500 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                ? "bg-orange-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              {categoryEmoji[cat] || "🍽️"} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* empty state */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-500 font-medium">No items found</p>
            <p className="text-gray-400 text-sm">Try a different category or search</p>
          </div>
        )}

        {/* menu items grid */}
        {!loading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map(item => {
              const qty = getCartQuantity(item.id)
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-3">

                      {/* item info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {categoryEmoji[item.category]} {item.category}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}
                        <p className="text-lg font-bold text-orange-500">
                          ₹{item.price}
                        </p>
                      </div>

                      {/* add to cart controls */}
                      <div className="shrink-0">
                        {qty === 0 ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              addToCart(item)
                              toast.success(`${item.name} added to cart!`)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, qty - 1)}
                              className="h-8 w-8 rounded-full border border-orange-500 text-orange-500 flex items-center justify-center hover:bg-orange-50"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-semibold w-4 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, qty + 1)}
                              className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* floating cart button
        {cartCount > 0 && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
            <a href="/cart" className="w-full max-w-md">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-between transition-colors">
                <span className="bg-orange-600 rounded-lg px-2 py-1 text-sm">
                  {cartCount} items
                </span>
                <span>View Cart</span>
                <ShoppingCart className="h-5 w-5" />
              </button>
            </a>
          </div>
        )} */}

      </div>
    </div>
  )
}