import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { UtensilsCrossed, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student"
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // validate passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // validate phone length
    if (form.phone.length !== 10) {
      setError("Phone number must be 10 digits")
      return
    }

    setLoading(true)

    try {
      const user = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role
      })

      toast.success(`Welcome to MunchRun, ${user.name.split(" ")[0]}!`)

      if (user.role === "owner") {
        navigate("/dashboard")
      } else {
        navigate("/menu")
      }
    } catch (err) {
      const message = err.response?.data?.error || "Something went wrong"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-start justify-center px-4 py-6">

      <div className="w-full max-w-md">

        {/* logo - compact */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-primary rounded-full p-2">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary">MunchRun</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Create account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">

              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  name="name"
                  placeholder="Enter your name.."
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="10 digit mobile number"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Password</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* role selector */}
              <div className="space-y-1">
                <label className="text-sm font-medium">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "student" })}
                    className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${form.role === "student"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-input hover:bg-accent"
                      }`}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "owner" })}
                    className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${form.role === "owner"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-input hover:bg-accent"
                      }`}
                  >
                    🍳 Canteen Owner
                  </button>
                </div>
              </div>

              {/* error */}
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account...</>
                  : "Create Account"
                }
              </Button>

            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}