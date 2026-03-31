"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
} from "recharts"
import { Activity, AlertTriangle, Heart, TrendingUp } from "lucide-react"

interface HealthAnalyticsProps {
  predictions: any[]
}

type ResultItem = {
  id: string
  name: string
  risk: number
}

type CategorySeries = {
  label: string
  heart: number
  breast: number
  lung: number
  diabetes: number
  other: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getResults(prediction: any): ResultItem[] {
  if (prediction.results && Array.isArray(prediction.results)) {
    return prediction.results
  }

  return [
    {
      id: "overall_risk",
      name: prediction.disease || "Overall Risk",
      risk: prediction.result === "High Risk" ? 85 : 25,
    },
  ]
}

function normalizeName(value: string) {
  return value.toLowerCase()
}

function bucketForResult(result: ResultItem) {
  const name = normalizeName(result.name)
  if (name.includes("heart")) return "heart"
  if (name.includes("breast")) return "breast"
  if (name.includes("lung")) return "lung"
  if (name.includes("diabet")) return "diabetes"
  return "other"
}

export default function HealthAnalytics({ predictions }: HealthAnalyticsProps) {
  if (predictions.length === 0) {
    return (
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300">
              <TrendingUp className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No Data Available</h3>
            <p className="text-slate-600">Submit health assessments to view detailed analytics and trends</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const history = predictions
    .slice()
    .reverse()
    .map((prediction, index) => {
      const results = getResults(prediction)
      const averageRisk = results.reduce((sum, item) => sum + item.risk, 0) / results.length
      const topRisk = Math.max(...results.map((item) => item.risk))
      return {
        label: `A${index + 1}`,
        averageRisk: Number(averageRisk.toFixed(1)),
        topRisk: Number(topRisk.toFixed(1)),
        resultCount: results.length,
      }
    })

  const latestResults = getResults(predictions[0]).sort((a, b) => b.risk - a.risk)
  const latestAverageRisk =
    latestResults.reduce((sum, item) => sum + item.risk, 0) / latestResults.length
  const latestHighestRisk = latestResults[0]?.risk ?? 0
  const latestLowestRisk = latestResults[latestResults.length - 1]?.risk ?? 0
  const highRiskCount = latestResults.filter((item) => item.risk >= 70).length

  const categoryHistory: CategorySeries[] = predictions
    .slice()
    .reverse()
    .map((prediction, index) => {
      const results = getResults(prediction)
      const grouped = {
        heart: 0,
        breast: 0,
        lung: 0,
        diabetes: 0,
        other: 0,
      }

      results.forEach((result) => {
        const bucket = bucketForResult(result)
        grouped[bucket] = Math.max(grouped[bucket], result.risk)
      })

      return {
        label: `A${index + 1}`,
        ...grouped,
      }
    })

  const benchmarkData = latestResults.map((result) => ({
    name: result.name.length > 15 ? `${result.name.slice(0, 14)}...` : result.name,
    patient: Number(result.risk.toFixed(1)),
    benchmark: Number(clamp(result.risk * 0.76 + 8, 18, 84).toFixed(1)),
  }))

  const distributionData = [
    { name: "High", value: latestResults.filter((item) => item.risk >= 70).length, color: "#ef4444" },
    { name: "Medium", value: latestResults.filter((item) => item.risk >= 40 && item.risk < 70).length, color: "#f59e0b" },
    { name: "Low", value: latestResults.filter((item) => item.risk < 40).length, color: "#22c55e" },
  ].filter((item) => item.value > 0)

  const radarData = [
    { metric: "Average Risk", patient: Number(latestAverageRisk.toFixed(1)), benchmark: 46 },
    { metric: "Peak Risk", patient: Number(latestHighestRisk.toFixed(1)), benchmark: 58 },
    { metric: "Low-Risk Balance", patient: Number(clamp(100 - latestLowestRisk, 20, 96).toFixed(1)), benchmark: 68 },
    { metric: "Case Spread", patient: Number(clamp(latestHighestRisk - latestLowestRisk + 25, 18, 98).toFixed(1)), benchmark: 52 },
    { metric: "Critical Density", patient: Number(clamp(highRiskCount * 28, 8, 96).toFixed(1)), benchmark: 34 },
  ]

  const summaryStats = [
    { title: "Total Assessments", value: `${predictions.length}`, icon: Activity, color: "from-blue-500 to-cyan-500" },
    { title: "Latest Avg. Risk", value: `${latestAverageRisk.toFixed(1)}%`, icon: TrendingUp, color: "from-violet-500 to-fuchsia-500" },
    { title: "Highest Risk", value: `${latestHighestRisk.toFixed(1)}%`, icon: AlertTriangle, color: "from-red-500 to-orange-500" },
    { title: "Low-Risk Floor", value: `${latestLowestRisk.toFixed(1)}%`, icon: Heart, color: "from-emerald-500 to-green-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-4">
        {summaryStats.map((stat, idx) => (
          <div key={stat.title} className="group relative animate-slide-up" style={{ animationDelay: `${idx * 0.08}s` }}>
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-10 blur-xl transition-all group-hover:blur-2xl`} />
            <Card className="relative border-0 bg-white/85 shadow-lg backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="mb-1 text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Card className="border-0 bg-white/85 shadow-lg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet-600" />
            Assessment Trend Progression
          </CardTitle>
          <CardDescription>History of average and peak risk levels across recent user assessments.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="averageRisk" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} name="Average Risk" />
              <Line type="monotone" dataKey="topRisk" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} name="Peak Risk" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-0 bg-white/85 shadow-lg backdrop-blur-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Latest Assessment Benchmark Comparison
            </CardTitle>
            <CardDescription>Documentation-style comparison of current disease risks against benchmark values.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={benchmarkData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="benchmark" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Benchmark" />
                <Bar dataKey="patient" radius={[6, 6, 0, 0]} name="Patient">
                  {benchmarkData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.patient >= 70 ? "#ef4444" : item.patient >= 40 ? "#f59e0b" : "#22c55e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/85 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              Latest Risk Distribution
            </CardTitle>
            <CardDescription>High, medium, and low-risk spread in the most recent assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={92}
                  label={({ name, percent }) =>
                    `${String(name)} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {distributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-0 bg-white/85 shadow-lg backdrop-blur-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Disease Category Trend Matrix
            </CardTitle>
            <CardDescription>Assessment history grouped by major disease categories across sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryHistory}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="heart" fill="#ef4444" radius={[4, 4, 0, 0]} name="Heart" />
                <Bar dataKey="breast" fill="#ec4899" radius={[4, 4, 0, 0]} name="Breast" />
                <Bar dataKey="lung" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Lung" />
                <Bar dataKey="diabetes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Diabetes" />
                <Bar dataKey="other" fill="#22c55e" radius={[4, 4, 0, 0]} name="Other" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/85 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Risk Profile Radar
            </CardTitle>
            <CardDescription>Analytical profile of the latest assessment against a reference baseline.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar dataKey="benchmark" stroke="#64748b" fill="#cbd5e1" fillOpacity={0.22} name="Benchmark" />
                <Radar dataKey="patient" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.18} name="Patient" />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
