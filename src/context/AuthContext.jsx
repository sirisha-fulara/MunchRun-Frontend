import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service";

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (token) {
            authService.me()
                .then(res => setUser(res.data.user))
                .catch(() => localStorage.clear())
                .finally(() => setLoading(false))
        }
        else {
            setLoading(false)
        }
    }, [])

    const login = async (email, password) => {
        const res = await authService.login({ email, password })
        localStorage.setItem('access_token', res.data.access_token)
        localStorage.setItem('refresh_token', res.data.refresh_token)
        setUser(res.data.user)
        return res.data.user
    }

    const register = async (data) => {
        const res = await authService.register(data)
        localStorage.setItem("access_token", res.data.access_token)
        localStorage.setItem("refresh_token", res.data.refresh_token)
        setUser(res.data.user)
        return res.data.user
    }

    const logout = () => {
        localStorage.clear()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
