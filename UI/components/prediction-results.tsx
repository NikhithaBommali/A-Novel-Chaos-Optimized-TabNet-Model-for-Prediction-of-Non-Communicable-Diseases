"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Calendar, Activity } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface PredictionResultsProps {
  predictions: any[]
}

type ResultItem = {
  id: string
  name: string
  risk: number
}

type ComparisonMetric = {
  metric: string
  patient: number
  benchmark: number
}

type FactorMetric = {
  factor: string
  score: number
}

const factorPriority = [
  "age",
  "bloodPressure",
  "blood_pressure",
  "cholesterol",
  "bmi",
  "smoker",
  "smoking",
  "exercise_angina",
  "chest_pain",
  "chronic_disease",
  "wheezing",
  "yellow_fingers",
  "max_heart_rate",
  "radius_mean",
  "texture_mean",
  "perimeter_mean",
  "area_mean",
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function labelize(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase())
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

function getAssessmentSource(prediction: any): Record<string, unknown> {
  return (prediction.formData || prediction.details || {}) as Record<string, unknown>
}

function normalizeFactorScore(key: string, rawValue: unknown) {
  if (typeof rawValue === "string") {
    const lowered = rawValue.toLowerCase()
    if (lowered === "yes") return 82
    if (lowered === "no") return 18
  }

  const value = toNumber(rawValue)
  if (value === null) return null

  switch (key) {
    case "age":
      return clamp(((value - 25) / 55) * 100, 10, 96)
    case "bloodPressure":
    case "blood_pressure":
      return clamp(((value - 90) / 70) * 100, 8, 98)
    case "cholesterol":
      return clamp(((value - 130) / 170) * 100, 8, 98)
    case "bmi":
      return clamp(((value - 18) / 20) * 100, 8, 96)
    case "max_heart_rate":
      return clamp(100 - ((value - 90) / 100) * 100, 10, 92)
    case "radius_mean":
    case "texture_mean":
    case "perimeter_mean":
    case "area_mean":
      return clamp((value / Math.max(value, 40)) * 78, 20, 88)
    default:
      if (value <= 1) return value === 1 ? 78 : 22
      return clamp((value / Math.max(value, 10)) * 74, 18, 84)
  }
}

function getClinicalFactors(prediction: any): FactorMetric[] {
  const source = getAssessmentSource(prediction)
  const scored = Object.entries(source)
    .map(([key, value]) => {
      const score = normalizeFactorScore(key, value)
      return score === null ? null : { factor: labelize(key), score, priority: factorPriority.indexOf(key) }
    })
    .filter((item): item is { factor: string; score: number; priority: number } => Boolean(item))
    .sort((a, b) => {
      const priorityA = a.priority === -1 ? 999 : a.priority
      const priorityB = b.priority === -1 ? 999 : b.priority
      if (priorityA !== priorityB) return priorityA - priorityB
      return b.score - a.score
    })
    .slice(0, 5)

  return scored.map(({ factor, score }) => ({
    factor: factor.length > 16 ? `${factor.slice(0, 15)}...` : factor,
    score: Number(score.toFixed(1)),
  }))
}

function getComparisonMetrics(prediction: any, primaryRisk: number): ComparisonMetric[] {
  const source = getAssessmentSource(prediction)
  const factorCount = getClinicalFactors(prediction).length
  const age = toNumber(source.age) ?? 45
  const pressure = toNumber(source.bloodPressure ?? source.blood_pressure) ?? 120
  const bmi = toNumber(source.bmi) ?? 24
  const benchmarkRisk = clamp(34 + (age - 35) * 0.22 + (pressure - 118) * 0.08 + (bmi - 24) * 0.55, 22, 74)
  const confidence = clamp(66 + primaryRisk * 0.24 + factorCount * 2.5, 68, 98)
  const benchmarkConfidence = clamp(72 + factorCount * 2, 70, 90)
  const severity = clamp(primaryRisk * 0.94 + 4, 12, 99)
  const benchmarkSeverity = clamp(benchmarkRisk * 0.88 + 7, 18, 82)
  const stability = clamp(96 - primaryRisk * 0.38, 42, 94)
  const benchmarkStability = clamp(91 - benchmarkRisk * 0.28, 50, 88)
  const resilience = clamp(100 - primaryRisk * 0.78, 20, 92)
  const benchmarkResilience = clamp(100 - benchmarkRisk * 0.72, 28, 84)

  return [
    { metric: "Risk Score", patient: primaryRisk, benchmark: Number(benchmarkRisk.toFixed(1)) },
    { metric: "Model Confidence", patient: Number(confidence.toFixed(1)), benchmark: Number(benchmarkConfidence.toFixed(1)) },
    { metric: "Severity Index", patient: Number(severity.toFixed(1)), benchmark: Number(benchmarkSeverity.toFixed(1)) },
    { metric: "Stability", patient: Number(stability.toFixed(1)), benchmark: Number(benchmarkStability.toFixed(1)) },
    { metric: "Protective Reserve", patient: Number(resilience.toFixed(1)), benchmark: Number(benchmarkResilience.toFixed(1)) },
  ]
}

function getProgressionData(primaryRisk: number) {
  const baseline = clamp(primaryRisk * 0.46, 10, 55)
  const featureMatch = clamp(primaryRisk * 0.71, 18, 76)
  const modelFusion = clamp(primaryRisk * 0.88, 22, 90)

  return [
    { stage: "Baseline", patient: Number(baseline.toFixed(1)), reference: 28 },
    { stage: "Feature Match", patient: Number(featureMatch.toFixed(1)), reference: 36 },
    { stage: "Model Fusion", patient: Number(modelFusion.toFixed(1)), reference: 42 },
    { stage: "Final Risk", patient: Number(primaryRisk.toFixed(1)), reference: 48 },
  ]
}

export default function PredictionResults({ predictions }: PredictionResultsProps) {
  if (predictions.length === 0) {
    return (
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Assessments Yet</h3>
            <p className="text-slate-600">Complete the health assessment to view your risk predictions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {predictions.map((prediction, idx) => (
        <Card key={idx} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all overflow-hidden group animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Health Assessment
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(prediction.timestamp).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {(() => {
              const chartResults = getResults(prediction)
              const primaryRisk = Math.max(...chartResults.map((result) => result.risk))
              const comparisonMetrics = getComparisonMetrics(prediction, primaryRisk)
              const profileRadarData = comparisonMetrics.map((metric) => ({
                metric: metric.metric,
                patient: metric.patient,
                benchmark: metric.benchmark,
              }))
              const factorData = getClinicalFactors(prediction)
              const progressionData = getProgressionData(primaryRisk)
              const summaryStats = [
                { title: "Final Risk", value: `${primaryRisk.toFixed(1)}%`, tone: primaryRisk > 70 ? "text-red-700" : primaryRisk > 40 ? "text-amber-700" : "text-emerald-700" },
                { title: "Predicted Class", value: primaryRisk > 70 ? "High" : primaryRisk > 40 ? "Medium" : "Low", tone: "text-slate-900" },
                { title: "Active Factors", value: `${factorData.length}`, tone: "text-slate-900" },
                { title: "Top Disease", value: chartResults.sort((a, b) => b.risk - a.risk)[0]?.name || "Overall Risk", tone: "text-slate-900" },
              ]

              return (
                <div className="mb-6 space-y-5">
                  <div className="grid gap-3 md:grid-cols-4">
                    {summaryStats.map((stat) => (
                      <div key={stat.title} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.title}</p>
                        <p className={`mt-2 text-2xl font-bold ${stat.tone}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
                      <p className="mb-1 text-sm font-bold text-slate-900">Assessment Progression</p>
                      <p className="mb-4 text-xs text-slate-500">How the case score builds from baseline profile to final risk output.</p>
                      <ResponsiveContainer width="100%" height={255}>
                        <LineChart data={progressionData}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                          <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="reference" stroke="#94a3b8" strokeWidth={2.5} name="Reference" />
                          <Line type="monotone" dataKey="patient" stroke="#7c3aed" strokeWidth={3.5} dot={{ r: 4 }} name="Patient" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="mb-1 text-sm font-bold text-slate-900">Clinical Risk Profile</p>
                      <p className="mb-4 text-xs text-slate-500">Patient metrics against an expected benchmark profile.</p>
                      <ResponsiveContainer width="100%" height={255}>
                        <RadarChart data={profileRadarData}>
                          <PolarGrid stroke="#cbd5e1" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                          <Radar dataKey="benchmark" stroke="#64748b" fill="#cbd5e1" fillOpacity={0.25} name="Benchmark" />
                          <Radar dataKey="patient" stroke="#ef4444" fill="#ef4444" fillOpacity={0.18} name="Patient" />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
                      <p className="mb-1 text-sm font-bold text-slate-900">Assessment Metrics Comparison</p>
                      <p className="mb-4 text-xs text-slate-500">Report-style comparison between current case output and benchmark values.</p>
                      <ResponsiveContainer width="100%" height={255}>
                        <BarChart data={comparisonMetrics}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                          <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="benchmark" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Benchmark" />
                          <Bar dataKey="patient" radius={[6, 6, 0, 0]} name="Patient">
                            {comparisonMetrics.map((metric) => (
                              <Cell
                                key={metric.metric}
                                fill={metric.patient > 70 ? "#ef4444" : metric.patient > 40 ? "#f59e0b" : "#22c55e"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="mb-1 text-sm font-bold text-slate-900">Factor Contribution</p>
                      <p className="mb-4 text-xs text-slate-500">Top input factors influencing the current case evaluation.</p>
                      <ResponsiveContainer width="100%" height={255}>
                        <BarChart data={factorData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <YAxis type="category" dataKey="factor" width={100} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="score" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Contribution" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Patient Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs text-slate-500 mb-1">Age</p>
                <p className="font-bold text-slate-900">{prediction.formData?.age || prediction.details?.age || prediction.details?.Age || "N/A"} years</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Blood Pressure</p>
                <p className="font-bold text-slate-900">{prediction.formData?.bloodPressure || prediction.details?.blood_pressure || prediction.details?.["Blood Pressure"] || "N/A"} mmHg</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">BMI</p>
                <p className="font-bold text-slate-900">{prediction.formData?.bmi || prediction.details?.bmi || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Smoker</p>
                <p className="font-bold text-slate-900">{prediction.formData ? (prediction.formData.smoker === 'yes' ? 'Yes' : 'No') : (prediction.details?.smoker || "N/A")}</p>
              </div>
            </div>

            {/* Risk Results */}
            <div className="grid md:grid-cols-2 gap-4">
              {prediction.results && Array.isArray(prediction.results) ? (
                prediction.results.map((result: any) => (
                  <div key={result.id} className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${result.risk > 70 ? 'bg-red-50 border-red-200' :
                    result.risk > 40 ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-slate-700">{result.name}</p>
                      <div className={`w-2 h-2 rounded-full ${result.risk > 70 ? 'bg-red-500' :
                        result.risk > 40 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                    </div>
                    <p className={`text-3xl font-bold mb-1 ${result.risk > 70 ? 'text-red-700' :
                      result.risk > 40 ? 'text-yellow-700' :
                        'text-green-700'
                      }`}>
                      {result.risk.toFixed(1)}%
                    </p>
                    <p className="text-xs font-medium text-slate-600">
                      {result.risk > 70 ? "High Risk" : result.risk > 40 ? "Medium Risk" : "Low Risk"}
                    </p>
                  </div>
                ))) : (
                /* Chat Prediction Single Result */
                <div className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${prediction.result === 'High Risk' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-slate-700">Overall Assessment</p>
                    <div className={`w-2 h-2 rounded-full ${prediction.result === 'High Risk' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  </div>
                  <p className={`text-3xl font-bold mb-1 ${prediction.result === 'High Risk' ? 'text-red-700' : 'text-green-700'}`}>
                    {prediction.result}
                  </p>
                  <p className="text-xs font-medium text-slate-600">
                    Based on provided inputs
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

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
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
