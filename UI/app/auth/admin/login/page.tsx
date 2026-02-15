"use client"

import { useRouter } from "next/navigation"
import AdminLogin from "@/components/admin-login"

export default function AdminLoginPage() {
    const router = useRouter()

    const handleLogin = (name: string, role: "admin") => {
        // Store user info if needed, though simpler just to rely on token
        localStorage.setItem("userRole", role)
        localStorage.setItem("userName", name)
        router.push("/admin/dashboard")
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminLogin
                onLogin={handleLogin}
                onSwitchToSignup={() => router.push("/auth/admin/signup")}
                onBack={() => router.push("/")}
            />
        </div>
    )
}
