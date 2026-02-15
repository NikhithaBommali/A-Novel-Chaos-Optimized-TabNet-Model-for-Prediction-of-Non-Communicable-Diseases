"use client"

import { useRouter } from "next/navigation"
import AdminSignup from "@/components/admin-signup"

export default function AdminSignupPage() {
    const router = useRouter()

    const handleSignup = (name: string, role: "admin") => {
        localStorage.setItem("userRole", role)
        localStorage.setItem("userName", name)
        router.push("/admin/dashboard")
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminSignup
                onSignup={handleSignup}
                onSwitchToLogin={() => router.push("/auth/admin/login")}
                onBack={() => router.push("/")}
            />
        </div>
    )
}
