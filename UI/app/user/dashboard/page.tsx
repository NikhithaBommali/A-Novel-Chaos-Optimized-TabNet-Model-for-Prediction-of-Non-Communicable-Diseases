"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import UserDashboard from "@/components/user-dashboard"

export default function UserDashboardPage() {
    const router = useRouter()
    const [name, setName] = useState("")

    useEffect(() => {
        // Simple client-side protection
        const token = localStorage.getItem("token")
        const role = localStorage.getItem("userRole")
        const storedName = localStorage.getItem("userName")

        if (!token || role !== "user") {
            router.push("/auth/user/login")
            return
        }

        if (storedName) setName(storedName)
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("userRole")
        localStorage.removeItem("userName")
        router.push("/")
    }

    return (
        <UserDashboard userName={name} onLogout={handleLogout} />
    )
}
