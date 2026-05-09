import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from './ui/button'
import { ShoppingCart, ClipboardList, LogOut, UtensilsCrossed } from 'lucide-react'

export default function Navbar({ cartCount = 0 }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* logo */}
                <Link to='/' className="flex items-center gap-2">
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold text-primary">MunchRun</span>
                </Link>

                {/* right side nav */}
                <div className="flex items-center gap-2">
                    {user && (
                        <span className="text-sm text-muted-foreground hidden sm:block">
                            Hey, {user.name.split(" ")[0]} 👋
                        </span>
                    )}

                    {/* cart button - only for students */}
                    {user?.role === "student" && (
                        <Link to="/cart">
                            <Button variant="outline" size="sm" className="relative">
                                <ShoppingCart className="h-4 w-4" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    )}
                    {/* orders button */}
                    {user?.role === "student" && (
                        <Link to="/orders">
                            <Button variant="outline" size="sm">
                                <ClipboardList className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}

                    {/* logout */}
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </nav>
    )
}