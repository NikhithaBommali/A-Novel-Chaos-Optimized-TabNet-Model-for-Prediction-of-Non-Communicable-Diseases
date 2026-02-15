"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { TrendingUp, Activity, Heart, AlertTriangle } from "lucide-react"

interface HealthAnalyticsProps {
  predictions: any[]
}

export default function HealthAnalytics({ predictions }: HealthAnalyticsProps) {
  if (predictions.length === 0) {
    return (
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Available</h3>
            <p className="text-slate-600">Submit health assessments to view detailed analytics and trends</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = predictions.slice(0, 5).reverse().map((pred, idx) => {
    // Helper to get risk or default to 0
    const getRisk = (id: string) => pred.results?.find((r: any) => r.id === id)?.risk || 0;

    // If we have a single result string (Chat)
    if (!pred.results && pred.result) {
      // Mocking values based on single result for visualization
      const riskVal = pred.result === 'High Risk' ? 85 : 15;
      // We don't know the disease type easily here without more data, so just show generic or map to all?
      // Let's just return 0s to avoid misleading info, or maybe put it in a "General" category if we had one.
      // For now, prevent crash.
      return {
        name: `Test ${idx + 1}`,
        heartDisease: 0,
        diabetes: 0,
        cancer: 0,
        respiratory: 0,
        // Add a generic one?
        general: riskVal
      }
    }

    return {
      name: `Test ${idx + 1}`,
      heartDisease: getRisk("heart"),
      diabetes: getRisk("diabetes"),
      cancer: getRisk("cancer"),
      respiratory: getRisk("respiratory"),
    }
  })

  // Safe accessor for latest prediction content
  const latestPred = predictions[0];
  let latestResolution: any[] = [];

  if (latestPred?.results) {
    latestResolution = latestPred.results;
  } else if (latestPred?.result) {
    // Mock breakdown for chat result
    const val = latestPred.result === 'High Risk' ? 85 : 15;
    latestResolution = [
      { name: 'Overall Risk', risk: val }
    ]
  }

  const pieData = latestResolution.map((result: any) => ({
    name: result.name,
    value: result.risk,
  }))

  const radarData = latestResolution.map((result: any) => ({
    subject: result.name.replace(' Disease', ''),
    value: result.risk,
    fullMark: 100,
  }))

  const COLORS = ["#ef4444", "#3b82f6", "#a855f7", "#f97316"]

  // Safe stats calculation
  const avgRisk = latestResolution.length > 0
    ? latestResolution.reduce((sum: number, r: any) => sum + r.risk, 0) / latestResolution.length
    : 0;

  const maxRisk = latestResolution.length > 0
    ? Math.max(...latestResolution.map((r: any) => r.risk))
    : 0;

  const minRisk = latestResolution.length > 0
    ? Math.min(...latestResolution.map((r: any) => r.risk))
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { title: "Total Assessments", value: predictions.length, icon: Activity, color: "from-blue-500 to-cyan-500" },
          { title: "Average Risk", value: `${avgRisk.toFixed(1)}%`, icon: TrendingUp, color: "from-purple-500 to-pink-500" },
          { title: "Highest Risk", value: `${maxRisk.toFixed(1)}%`, icon: AlertTriangle, color: "from-red-500 to-orange-500" },
          { title: "Lowest Risk", value: `${minRisk.toFixed(1)}%`, icon: Heart, color: "from-green-500 to-emerald-500" },
        ].map((stat, idx) => (
          <div key={idx} className="group relative animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 rounded-2xl blur-xl group-hover:blur-2xl transition-all`}></div>
            <Card className="relative border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Risk Trends Over Time
            </CardTitle>
            <CardDescription>Track how your health metrics change</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="heartDisease" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="diabetes" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="cancer" stroke="#a855f7" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="respiratory" stroke="#f97316" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Current Risk Profile
            </CardTitle>
            <CardDescription>Multi-dimensional health assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" />
                <PolarRadiusAxis stroke="#64748b" />
                <Radar name="Risk Level" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Risk Distribution
            </CardTitle>
            <CardDescription>Latest assessment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Comparative Analysis
            </CardTitle>
            <CardDescription>Risk comparison across assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="heartDisease" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="diabetes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="cancer" fill="#a855f7" radius={[8, 8, 0, 0]} />
                <Bar dataKey="respiratory" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
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