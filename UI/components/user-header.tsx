"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User, Bell, Settings, Activity } from "lucide-react"

interface UserHeaderProps {
  userName: string
  onLogout: () => void
}

export default function UserHeader({ userName, onLogout }: UserHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-md opacity-60"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Disease Prediction AI
              </h2>
              <p className="text-xs text-slate-500 font-medium">Personal Health Portal</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            {/* Notifications and Settings Removed as per request */}

            {/* User Info */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Patient</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
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