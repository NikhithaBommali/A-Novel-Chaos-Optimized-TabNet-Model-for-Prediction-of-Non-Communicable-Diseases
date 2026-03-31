"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, BarChart3, Settings, Brain, Database, Zap, TrendingUp } from "lucide-react"
import CSVUpload from "./csv-upload"
import DataPreprocessing from "./data-preprocessing"
import AdminHeader from "./admin-header"
import ExperimentalResults from "./experimental-results"

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

  const [statsData, setStatsData] = useState<{
    total_datasets: number
    total_records: number
    active_models: number
    accuracy_rate: number
    has_uploaded_data: boolean
    diseases: { disease_type: string; dataset_count: number; record_count: number }[]
    analytics_models: { name: string; accuracy: number }[]
  }>({
    total_datasets: 0,
    total_records: 0,
    active_models: 0,
    accuracy_rate: 0,
    has_uploaded_data: false,
    diseases: [],
    analytics_models: [],
  })

  const loadDashboardData = useCallback(async () => {
    const { dashboard } = await import("@/lib/api")
    try {
      const statsRes = await dashboard.getAdminStats()
      setStatsData(statsRes.data)
    } catch (e) {
      console.error("Failed to fetch admin stats", e)
    }
    try {
      const uploadsRes = await dashboard.listAdminUploads()
      setUploadedFiles(uploadsRes.data.filenames ?? [])
    } catch (e) {
      console.error("Failed to fetch admin uploads list", e)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const hasAnalyticsData =
    statsData.has_uploaded_data === true || statsData.total_datasets > 0

  const stats = [
    {
      title: "Total Datasets",
      value: statsData.total_datasets.toString(),
      change: hasAnalyticsData ? "+12%" : "Upload to populate",
      icon: Database,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Processed Records",
      value: statsData.total_records.toString(),
      change: hasAnalyticsData ? "+8%" : "Upload to populate",
      icon: Zap,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Active Models",
      value: statsData.active_models.toString(),
      change: hasAnalyticsData ? "+2" : "—",
      icon: Brain,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Accuracy Rate",
      value: hasAnalyticsData ? `${statsData.accuracy_rate}%` : "—",
      change: hasAnalyticsData ? "+2.3%" : "After first upload",
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
                    <span
                      className={`text-sm font-semibold px-2 py-1 rounded-full ${
                        hasAnalyticsData
                          ? "text-green-600 bg-green-50"
                          : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums">{stat.value}</p>
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
            <CSVUpload
              onFileUpload={handleFileUpload}
              onUploadComplete={loadDashboardData}
            />

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
            {!hasAnalyticsData ? (
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-slate-400" />
                    Analytics not available yet
                  </CardTitle>
                  <CardDescription className="text-base">
                    Upload at least one CSV under the Upload Data tab. Your stats and charts will appear here and
                    stay private to your account until you add data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-12 text-center">
                    <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">No datasets on file for this admin</p>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                      After your first successful upload, this tab will show performance analytics and experimental
                      results tied to your session.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
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

                    <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Model performance (your uploads)</h3>
                      <p className="text-sm text-slate-600 mb-6">
                        Benchmark accuracies from the project report, filtered to disease names that match your CSV labels
                        (e.g. &quot;Heart Disease&quot; → heart benchmarks only).
                      </p>
                      <div className="space-y-4">
                        {(() => {
                          const barColors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-cyan-500"]
                          const rows =
                            statsData.analytics_models.length > 0
                              ? statsData.analytics_models.map((m) => ({ name: m.name, accuracy: m.accuracy }))
                              : statsData.diseases.map((d) => ({
                                  name: `${d.disease_type} (${d.record_count.toLocaleString()} records)`,
                                  accuracy: statsData.accuracy_rate,
                                }))
                          if (rows.length === 0) {
                            return (
                              <p className="text-sm text-slate-500">
                                No chart rows yet. After upload, open Analytics again or refresh the page.
                              </p>
                            )
                          }
                          return rows.map((model, idx) => (
                            <div key={model.name + idx}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">{model.name}</span>
                                <span className="text-sm font-bold text-slate-900">{model.accuracy}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-full ${barColors[idx % barColors.length]} rounded-full transition-all duration-1000 ease-out`}
                                  style={{ width: `${Math.min(100, model.accuracy)}%` }}
                                ></div>
                              </div>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ExperimentalResults allowRefresh />
              </>
            )}
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
