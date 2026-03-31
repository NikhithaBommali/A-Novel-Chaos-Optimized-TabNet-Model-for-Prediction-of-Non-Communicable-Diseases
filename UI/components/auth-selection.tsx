"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Users, ArrowRight, Sparkles, Shield } from "lucide-react"

interface AuthSelectionProps {
  onSelectRole: (role: "admin" | "user") => void
}

export default function AuthSelection({ onSelectRole }: AuthSelectionProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-5xl">
          {/* Header with animation */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-semibold">AI-Powered Health Analytics</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Disease Prediction
              <br />
              <span className="text-4xl md:text-5xl">Intelligence System</span>
            </h1>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
              Advanced machine learning algorithms for early detection and risk assessment
            </p>
          </div>

          {/* Role selection cards - More square-like */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Admin Card */}
            <div
              className="group relative animate-slide-up"
              onClick={() => onSelectRole("admin")}
              style={{ animationDelay: "0.1s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-300/40 to-purple-300/40 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Card className="relative border-2 border-blue-200 bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-500 cursor-pointer overflow-hidden shadow-xl hover:shadow-2xl flex flex-col">
                <CardHeader className="relative text-center pt-10 pb-6 flex-shrink-0">
                  <div className="relative inline-flex mx-auto mb-5">
                    <div className="absolute inset-0 bg-blue-400/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <Activity className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 mb-2">Admin Portal</CardTitle>
                  <CardDescription className="text-slate-600 text-sm px-2">
                    Manage datasets and train ML models
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative pb-10 flex-1 flex flex-col justify-between">
                  <ul className="space-y-2 mb-6">
                    {[
                      "Dataset Management",
                      "Data Preprocessing",
                      "Model Training",
                      "System Analytics"
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all group/btn">
                    Continue as Admin
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* User Card */}
            <div
              className="group relative animate-slide-up"
              onClick={() => onSelectRole("user")}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Card className="relative border-2 border-purple-200 bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-500 cursor-pointer overflow-hidden shadow-xl hover:shadow-2xl flex flex-col">
                <CardHeader className="relative text-center pt-10 pb-6 flex-shrink-0">
                  <div className="relative inline-flex mx-auto mb-5">
                    <div className="absolute inset-0 bg-purple-400/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 mb-2">User Portal</CardTitle>
                  <CardDescription className="text-slate-600 text-sm px-2">
                    Get personalized health predictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative pb-10 flex-1 flex flex-col justify-between">
                  <ul className="space-y-2 mb-6">
                    {[
                      "Risk Assessment",
                      "Health Insights",
                      "Data Visualization",
                      "Trend Analysis"
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all group/btn">
                    Continue as User
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="inline-flex items-center gap-2 text-slate-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">HIPAA Compliant • Encrypted • Secure</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}