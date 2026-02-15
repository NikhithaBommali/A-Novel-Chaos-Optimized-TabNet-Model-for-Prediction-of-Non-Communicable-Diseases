"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, TrendingUp, Heart, Brain, BarChart, ClipboardList } from "lucide-react"
import UserHeader from "./user-header"
import PredictionForm from "./prediction-form"
import PredictionResults from "./prediction-results"
import HealthAnalytics from "./health-analytics"

import ChatInterface from "./chat-interface"

interface UserDashboardProps {
  userName: string
  onLogout: () => void
}

export default function UserDashboard({ userName, onLogout }: UserDashboardProps) {
  const [predictions, setPredictions] = useState<any[]>([])

  const [statsData, setStatsData] = useState({
    total_assessments: 0,
    health_score: 0,
    risk_factors: 0
  })

  // Fetch stats on load
  const loadStats = async () => {
    try {
      const { dashboard } = await import('@/lib/api');
      const res = await dashboard.getUserStats();
      setStatsData(res.data);
      // For prediction history, we might need another call or state
    } catch (e) {
      console.error("Failed to fetch user stats", e)
    }
  }

  useEffect(() => {
    loadStats();
  }, [])

  const handlePrediction = (data: any) => {
    setPredictions([data, ...predictions])
    loadStats(); // Refresh stats after new prediction
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
      <UserHeader userName={userName} onLogout={onLogout} />

      <main className="container mx-auto p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            {/* Icon removed as per request */}
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Health Intelligence Hub
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                AI-powered disease risk analysis and personalized health insights
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {predictions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group relative animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Active</span>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Assessments</p>
                <p className="text-3xl font-bold text-slate-900">{predictions.length}</p>
              </div>
            </div>

            <div className="group relative animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Good</span>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Health Score</p>
                <p className="text-3xl font-bold text-slate-900">
                  {(() => {
                    const latest = predictions[0];
                    if (latest.results && Array.isArray(latest.results)) {
                      return (100 - latest.results.reduce((sum: number, r: any) => sum + r.risk, 0) / 4).toFixed(0) + "%";
                    }
                    if (latest.result) {
                      return latest.result === "Low Risk" ? "95%" : "40%";
                    }
                    return "N/A";
                  })()}
                </p>
              </div>
            </div>

            <div className="group relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Tracked</span>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Risk Factors</p>
                <p className="text-3xl font-bold text-slate-900">4</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="prediction" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg p-1.5 h-auto rounded-2xl">
            <TabsTrigger
              value="prediction"
              className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <ClipboardList className="w-5 h-5" />
              <span className="font-semibold">Health Check</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Activity className="w-5 h-5" />
              <span className="font-semibold">Results</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <BarChart className="w-5 h-5" />
              <span className="font-semibold">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prediction">
            <ChatInterface onPredictionComplete={handlePrediction} />
          </TabsContent>


          <TabsContent value="results">
            <PredictionResults predictions={predictions} />
          </TabsContent>

          <TabsContent value="analytics">
            <HealthAnalytics predictions={predictions} />
          </TabsContent>
        </Tabs>
      </main>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div >
  )
}