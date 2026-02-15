"use client"

import { useRouter } from "next/navigation"
import UserLogin from "@/components/user-login"

export default function UserLoginPage() {
    const router = useRouter()

    const handleLogin = (name: string, role: "user") => {
        localStorage.setItem("userRole", role)
        localStorage.setItem("userName", name)
        router.push("/user/dashboard")
    }

    return (
        <div className="min-h-screen bg-background">
            <UserLogin
                onLogin={handleLogin}
                onSwitchToSignup={() => router.push("/auth/user/signup")}
                onBack={() => router.push("/")}
            />
        </div>
    )
}
