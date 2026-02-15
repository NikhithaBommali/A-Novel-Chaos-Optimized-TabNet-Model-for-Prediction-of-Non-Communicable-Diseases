"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Lock, Mail, Heart } from "lucide-react"

interface UserSignupProps {
  onSignup: (name: string, role: "user") => void
  onSwitchToLogin: () => void
  onBack: () => void
}

export default function UserSignup({ onSignup, onSwitchToLogin, onBack }: UserSignupProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password && password === confirmPassword) {
      try {
        const response = await import('@/lib/api').then(m => m.auth.signup({
          email,
          password,
          full_name: email.split("@")[0] // Simplistic for now
        }));
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        onSignup(email.split("@")[0], "user");
      } catch (error: any) {
        console.error("Signup failed:", error);
        // Check for specific error message from backend
        if (error.response?.data?.detail === "Email already registered") {
          alert("Signup failed! This email is already registered. Please login instead.");
        } else {
          alert("Signup failed! Please try again.");
        }
      }
    } else if (password !== confirmPassword) {
      alert("Passwords do not match!")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative z-10 w-full max-w-lg">
        <Card className="border-2 border-purple-200 bg-white/95 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pt-8 pb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to selection
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-slate-900">Create Account</CardTitle>
              <CardDescription className="text-slate-600 text-base mt-2">
                Start your health journey today
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-11 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-11 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pl-11 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
                >
                  Create Your Account
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-slate-600">Already have an account? </span>
              <button
                onClick={onSwitchToLogin}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}