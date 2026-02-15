"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AdminDashboard from "@/components/admin-dashboard"

export default function AdminDashboardPage() {
    const router = useRouter()
    const [name, setName] = useState("")

    useEffect(() => {
        // Simple client-side protection
        const token = localStorage.getItem("token")
        const role = localStorage.getItem("userRole")
        const storedName = localStorage.getItem("userName")

        if (!token || role !== "admin") {
            router.push("/auth/admin/login")
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
        <AdminDashboard userName={name} onLogout={handleLogout} />
    )
}
