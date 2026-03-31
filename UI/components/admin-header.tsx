"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User, Bell, Settings } from "lucide-react"

interface AdminHeaderProps {
  userName: string
  onLogout: () => void
}

export default function AdminHeader({ userName, onLogout }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-60"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">D</span>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Disease Prediction AI
              </h2>
              <p className="text-xs text-slate-500 font-medium">Admin Dashboard</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative w-10 h-10 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </Button>

            {/* User Info */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex items-center gap-2 h-10 px-4 border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded-xl transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}