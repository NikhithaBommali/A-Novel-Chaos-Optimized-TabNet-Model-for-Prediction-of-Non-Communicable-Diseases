"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, BarChart3, Settings, Brain, Database, Zap, TrendingUp } from "lucide-react"
import CSVUpload from "./csv-upload"
import DataPreprocessing from "./data-preprocessing"
import AdminHeader from "./admin-header"

interface AdminDashboardProps {
  userName: string
  onLogout: () => void
}

export default function AdminDashboard({ userName, onLogout }: AdminDashboardProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [preprocessingData, setPreprocessingData] = useState<any[]>([])

  const handleFileUpload = (fileName: string) => {
    setUploadedFiles([...uploadedFiles, fileName])
  }

  const handlePreprocess = (data: any[]) => {
    setPreprocessingData(data)
  }

  const [statsData, setStatsData] = useState({
    total_datasets: 0,
    total_records: 0,
    active_models: 0,
    accuracy_rate: 0
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const { dashboard } = await import('@/lib/api');
        const res = await dashboard.getAdminStats();
        setStatsData(res.data);
      } catch (e) {
        console.error("Failed to fetch admin stats", e)
      }
    }
    fetchStats();
  }, [])

  const stats = [
    {
      title: "Total Datasets",
      value: statsData.total_datasets.toString(),
      change: "+12%", // Keep mock for trend or implement later
      icon: Database,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Processed Records",
      value: statsData.total_records.toString(),
      change: "+8%",
      icon: Zap,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Active Models",
      value: statsData.active_models.toString(),
      change: "+2",
      icon: Brain,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Accuracy Rate",
      value: statsData.accuracy_rate + "%",
      change: "+2.3%",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <AdminHeader userName={userName} onLogout={onLogout} />

      <main className="container mx-auto p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Admin Control Center
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                Manage datasets, preprocessing pipelines, and ML model training
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group relative animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-all duration-500`}></div>
              <Card className="relative border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg p-1.5 h-auto rounded-2xl">
            <TabsTrigger
              value="upload"
              className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Upload className="w-5 h-5" />
              <span className="font-semibold">Upload Data</span>
            </TabsTrigger>
            <TabsTrigger
              value="preprocessing"
              className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold">Processing</span>
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <CSVUpload onFileUpload={handleFileUpload} />

            {uploadedFiles.length > 0 && (
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-600" />
                    Uploaded Datasets
                  </CardTitle>
                  <CardDescription className="text-base">
                    Files ready for preprocessing and model training
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-base font-semibold text-slate-900">{file}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                            ✓ Ready
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preprocessing" className="space-y-6">
            <DataPreprocessing uploadedFiles={uploadedFiles} onPreprocess={handlePreprocess} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  System Performance Analytics
                </CardTitle>
                <CardDescription className="text-base">
                  Real-time insights into dataset processing and model performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full -mr-12 -mt-12"></div>
                    <div className="relative">
                      <p className="text-sm font-medium text-blue-700 mb-2">Processing Speed</p>
                      <p className="text-4xl font-bold text-blue-900 mb-1">2.8k</p>
                      <p className="text-xs text-blue-600">records/second</p>
                    </div>
                  </div>
                  <div className="relative p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/30 rounded-full -mr-12 -mt-12"></div>
                    <div className="relative">
                      <p className="text-sm font-medium text-purple-700 mb-2">Model Accuracy</p>
                      <p className="text-4xl font-bold text-purple-900 mb-1">94.8%</p>
                      <p className="text-xs text-purple-600">avg. across models</p>
                    </div>
                  </div>
                  <div className="relative p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200 overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/30 rounded-full -mr-12 -mt-12"></div>
                    <div className="relative">
                      <p className="text-sm font-medium text-orange-700 mb-2">Training Time</p>
                      <p className="text-4xl font-bold text-orange-900 mb-1">12m</p>
                      <p className="text-xs text-orange-600">avg. per model</p>
                    </div>
                  </div>
                </div>

                {/* Model Performance Chart */}
                <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Model Performance Metrics</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Heart Disease Predictor", accuracy: 96.2, color: "bg-blue-500" },
                      { name: "Diabetes Risk Analyzer", accuracy: 94.8, color: "bg-purple-500" },
                      { name: "Cancer Detection Model", accuracy: 93.5, color: "bg-pink-500" },
                      { name: "Respiratory Disease Predictor", accuracy: 95.1, color: "bg-orange-500" },
                    ].map((model, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">{model.name}</span>
                          <span className="text-sm font-bold text-slate-900">{model.accuracy}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${model.color} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${model.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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
    </div>
  )
}