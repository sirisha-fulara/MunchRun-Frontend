import { useState } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { UtensilsCrossed, Loader2 } from "lucide-react"
import { toast } from "sonner"


export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`)

      if (user.role === 'owner') {
        navigate('/dashboard')
      }
      else {
        navigate('/menu')
      }
    }
    catch (err) {
      const message = err.response?.data?.error || "Something went wrong"
      setError(message)
      toast.error(message)
    }
    finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary rounded-full p-3 mb-3">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary">MunchRun</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Skip the queue. Order ahead.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

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
                <label className="text-sm font-medium">Password</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* error message */}
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
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging in...</>
                  : "Login"
                }
              </Button>

            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}