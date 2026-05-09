import { Link } from "react-router-dom"
import { UtensilsCrossed, Clock, Bell, ShoppingCart, ChefHat, Zap, Shield } from "lucide-react"
import { Button } from "../components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-orange-500" />
            <span className="text-xl font-bold text-orange-500">MunchRun</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">

        {/* pill badge */}
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-orange-100">
          <Zap className="h-3.5 w-3.5" />
          Skip the queue. Order ahead.
        </div>

        {/* headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Your canteen,{" "}
          <span className="text-orange-500">reimagined</span>
        </h1>

        {/* subheadline */}
        <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Order your favourite canteen food ahead of time.
          No queues, no waiting, no stress.
          Just walk in and pick up.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto px-8">
              Order Now — It's Free
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
              Login to your account
            </Button>
          </Link>
        </div>

        {/* hero visual */}
        <div className="mt-16 bg-orange-50 rounded-2xl p-8 max-w-3xl mx-auto border border-orange-100">
          <div className="grid grid-cols-3 gap-4">

            {/* mock order card */}
            <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm text-left">
              <p className="text-xs text-muted-foreground mb-3 font-medium">
                YOUR ORDER
              </p>
              <div className="space-y-2">
                {[
                  { name: "Aloo Paratha", price: "₹40", qty: 2 },
                  { name: "Masala Chai", price: "₹15", qty: 1 },
                ].map(item => (
                  <div key={item.name} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{item.name} × {item.qty}</span>
                    <span className="font-semibold">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-orange-500">₹95</span>
              </div>
              <div className="mt-3 bg-green-50 text-green-700 text-xs font-semibold px-3 py-2 rounded-lg text-center">
                Ready for pickup at 1:00 PM
              </div>
            </div>

            {/* status steps */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-muted-foreground font-medium mb-3">STATUS</p>
              <div className="space-y-3">
                {[
                  { label: "Placed", done: true },
                  { label: "Confirmed", done: true },
                  { label: "Preparing", done: true },
                  { label: "Ready!", done: false, active: true },
                ].map(step => (
                  <div key={step.label} className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${
                      step.active
                        ? "bg-orange-500 ring-4 ring-orange-100"
                        : step.done
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`} />
                    <span className={`text-xs font-medium ${
                      step.active
                        ? "text-orange-500"
                        : step.done
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ── FEATURES ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything you need
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Built for students and canteen owners alike
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShoppingCart,
                color: "bg-orange-100 text-orange-600",
                title: "Pre-order Food",
                desc: "Browse the menu and place your order before the break. Your food will be ready when you arrive."
              },
              {
                icon: Bell,
                color: "bg-blue-100 text-blue-600",
                title: "Live Notifications",
                desc: "Get real-time updates when your order is confirmed, being prepared, and ready for pickup."
              },
              {
                icon: Clock,
                color: "bg-green-100 text-green-600",
                title: "Time Slot Booking",
                desc: "Pick a convenient pickup slot. The canteen prepares your food just in time — no overcrowding."
              },
              {
                icon: ChefHat,
                color: "bg-purple-100 text-purple-600",
                title: "Owner Dashboard",
                desc: "Canteen owners get a live dashboard to manage orders, menu items, and track daily revenue."
              },
              {
                icon: Zap,
                color: "bg-yellow-100 text-yellow-600",
                title: "Zero Wait Time",
                desc: "Walk in, pick up, walk out. Students save up to 20 minutes every lunch break."
              },
              {
                icon: Shield,
                color: "bg-red-100 text-red-600",
                title: "Secure & Simple",
                desc: "JWT-based authentication keeps your account safe. No complexity, just a smooth experience."
              }
            ].map(feature => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className={`inline-flex p-2.5 rounded-lg ${feature.color} mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="bg-orange-500 rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">
            Ready to skip the queue?
          </h2>
          <p className="text-orange-100 mb-8 max-w-md mx-auto">
            Join students who are already ordering ahead with MunchRun.
          </p>
          <Link to="/register">
            <button className="bg-white text-orange-500 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors">
              Get Started for Free
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-orange-500">MunchRun</span>
            <span className="text-sm text-muted-foreground ml-2">
              Skip the queue. Order ahead.
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ by Sirisha Fulara · 2026
          </p>
        </div>
      </footer>

    </div>
  )
}