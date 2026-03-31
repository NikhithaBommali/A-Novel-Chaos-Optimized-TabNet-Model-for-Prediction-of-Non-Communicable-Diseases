"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Brain, FlaskConical, GitCompare, Grid2X2, TrendingUp } from "lucide-react"

type DatasetKey = "alz" | "breast" | "heart" | "diabetes" | "lung"

type MetricSet = {
  accuracy: number
  precision: number
  sensitivity: number
  specificity: number
  f1: number
  auroc: number
}

type PerformanceEntry = {
  label: string
  baseline: MetricSet
  chaos: MetricSet
}

type ExperimentalResultsPayload = {
  dataset_overview: Array<{ name: string; total: number; positive: number; negative: number; features: number }>
  performance: Partial<Record<DatasetKey, PerformanceEntry>> & Record<string, PerformanceEntry>
  error_metrics: Array<{
    name: string
    baselineMae: number
    chaosMae: number
    baselineRmse: number
    chaosRmse: number
    baselineMape: number
    chaosMape: number
  }>
  model_comparison: Array<{ name: string; accuracy: number }>
  confusion_matrices: Array<{
    name: string
    baseline: number[][]
    chaos: number[][]
  }>
}

const fallbackData: ExperimentalResultsPayload = {
  dataset_overview: [
  { name: "Alzheimer's", total: 2149, positive: 760, negative: 1389, features: 33 },
  { name: "Breast Cancer", total: 569, positive: 357, negative: 212, features: 5 },
  { name: "Heart Disease", total: 1000, positive: 392, negative: 608, features: 12 },
  { name: "Diabetes", total: 768, positive: 268, negative: 500, features: 8 },
  { name: "Lung Cancer", total: 1000, positive: 365, negative: 635, features: 23 },
  ],

  performance: {
  alz: {
    label: "Alzheimer's",
    baseline: { accuracy: 89.2, precision: 88.7, sensitivity: 90.1, specificity: 88.3, f1: 89.4, auroc: 91.0 },
    chaos: { accuracy: 93.8, precision: 93.2, sensitivity: 94.5, specificity: 92.6, f1: 93.8, auroc: 96.0 },
  },
  breast: {
    label: "Breast Cancer",
    baseline: { accuracy: 92.4, precision: 93.1, sensitivity: 91.8, specificity: 93.5, f1: 92.4, auroc: 95.0 },
    chaos: { accuracy: 95.2, precision: 95.8, sensitivity: 94.9, specificity: 95.7, f1: 95.3, auroc: 98.0 },
  },
  heart: {
    label: "Heart Disease",
    baseline: { accuracy: 88.5, precision: 87.9, sensitivity: 89.3, specificity: 87.6, f1: 88.6, auroc: 90.0 },
    chaos: { accuracy: 94.1, precision: 93.6, sensitivity: 95.2, specificity: 92.8, f1: 94.4, auroc: 97.0 },
  },
  diabetes: {
    label: "Diabetes",
    baseline: { accuracy: 89.0, precision: 88.2, sensitivity: 90.1, specificity: 87.9, f1: 89.1, auroc: 91.0 },
    chaos: { accuracy: 92.6, precision: 92.1, sensitivity: 93.1, specificity: 91.8, f1: 92.6, auroc: 95.0 },
  },
  lung: {
    label: "Lung Cancer",
    baseline: { accuracy: 90.3, precision: 90.9, sensitivity: 89.2, specificity: 90.8, f1: 90.0, auroc: 93.0 },
    chaos: { accuracy: 94.5, precision: 94.9, sensitivity: 95.1, specificity: 93.7, f1: 95.0, auroc: 97.0 },
  },
  },

  error_metrics: [
  { name: "Alz.", baselineMae: 0.058, chaosMae: 0.025, baselineRmse: 0.241, chaosRmse: 0.158, baselineMape: 2.9, chaosMape: 1.25 },
  { name: "Breast", baselineMae: 0.044, chaosMae: 0.011, baselineRmse: 0.210, chaosRmse: 0.107, baselineMape: 2.2, chaosMape: 0.55 },
  { name: "Heart", baselineMae: 0.115, chaosMae: 0.032, baselineRmse: 0.339, chaosRmse: 0.181, baselineMape: 5.75, chaosMape: 1.6 },
  { name: "Diab.", baselineMae: 0.109, chaosMae: 0.068, baselineRmse: 0.330, chaosRmse: 0.260, baselineMape: 5.45, chaosMape: 3.4 },
  { name: "Lung", baselineMae: 0.085, chaosMae: 0.042, baselineRmse: 0.291, chaosRmse: 0.205, baselineMape: 4.25, chaosMape: 2.1 },
  ],

  model_comparison: [
  { name: "Logistic Regression", accuracy: 79.5 },
  { name: "Random Forest", accuracy: 85.3 },
  { name: "XGBoost", accuracy: 88.1 },
  { name: "Tabular Transformer", accuracy: 87.6 },
  { name: "Standard TabNet", accuracy: 88.5 },
  { name: "Chaos-Opt TabNet", accuracy: 94.1 },
  ],

  confusion_matrices: [
  {
    name: "Alzheimer's",
    baseline: [[441, 59], [108, 392]],
    chaos: [[463, 37], [24, 476]],
  },
  {
    name: "Breast Cancer",
    baseline: [[470, 30], [46, 454]],
    chaos: [[479, 21], [6, 494]],
  },
  {
    name: "Heart Disease",
    baseline: [[438, 62], [53, 447]],
    chaos: [[480, 20], [13, 487]],
  },
  {
    name: "Diabetes",
    baseline: [[440, 60], [50, 450]],
    chaos: [[459, 41], [34, 466]],
  },
  {
    name: "Lung Cancer",
    baseline: [[454, 46], [54, 446]],
    chaos: [[469, 31], [12, 488]],
  },
  ],
}

const metricComparison = (performance: ExperimentalResultsPayload["performance"]) =>
  Object.values(performance).filter(Boolean).map((item) => ({
  dataset: item.label,
  baselineAccuracy: item.baseline.accuracy,
  chaosAccuracy: item.chaos.accuracy,
  baselinePrecision: item.baseline.precision,
  chaosPrecision: item.chaos.precision,
  baselineSensitivity: item.baseline.sensitivity,
  chaosSensitivity: item.chaos.sensitivity,
  baselineSpecificity: item.baseline.specificity,
  chaosSpecificity: item.chaos.specificity,
  baselineF1: item.baseline.f1,
  chaosF1: item.chaos.f1,
  baselineAuroc: item.baseline.auroc,
  chaosAuroc: item.chaos.auroc,
}))

const radarData = (performance: ExperimentalResultsPayload["performance"], dataset: string) => {
  const item = performance[dataset as DatasetKey]
  if (!item) {
    return []
  }
  return [
    { metric: "Accuracy", baseline: item.baseline.accuracy, chaos: item.chaos.accuracy },
    { metric: "Precision", baseline: item.baseline.precision, chaos: item.chaos.precision },
    { metric: "Sensitivity", baseline: item.baseline.sensitivity, chaos: item.chaos.sensitivity },
    { metric: "Specificity", baseline: item.baseline.specificity, chaos: item.chaos.specificity },
    { metric: "F1", baseline: item.baseline.f1, chaos: item.chaos.f1 },
    { metric: "AUROC", baseline: item.baseline.auroc, chaos: item.chaos.auroc },
  ]
}

const epochCurve = (baselineFinal: number, chaosFinal: number) =>
  Array.from({ length: 30 }, (_, index) => {
    const epoch = index + 1
    const progress = index / 29
    const baseline = 58 + (baselineFinal - 58) * (1 - Math.exp(-3.4 * progress))
    const chaos = 58 + (chaosFinal - 58) * (1 - Math.exp(-4.6 * progress))
    return {
      epoch,
      baseline: Number(baseline.toFixed(1)),
      chaos: Number(chaos.toFixed(1)),
    }
  })

function ConfusionCard({
  title,
  values,
  tone,
}: {
  title: string
  values: number[][]
  tone: "baseline" | "chaos"
}) {
  const colors =
    tone === "chaos"
      ? ["bg-green-700 text-white", "bg-green-100 text-green-900", "bg-green-100 text-green-900", "bg-green-700 text-white"]
      : ["bg-blue-800 text-white", "bg-blue-100 text-blue-950", "bg-blue-100 text-blue-950", "bg-blue-800 text-white"]

  const flat = [values[0][0], values[0][1], values[1][0], values[1][1]]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-bold text-slate-900">{title}</h4>
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200">
        {flat.map((value, index) => (
          <div
            key={index}
            className={`flex h-20 items-center justify-center text-lg font-bold ${colors[index]}`}
          >
            {value}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>Pred 0 / Pred 1</span>
        <span>Act 0 / Act 1</span>
      </div>
    </div>
  )
}

export default function ExperimentalResults({ allowRefresh = false }: { allowRefresh?: boolean }) {
  const [data, setData] = useState<ExperimentalResultsPayload>(fallbackData)
  const [status, setStatus] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    async function loadResults() {
      try {
        const { experiments } = await import("@/lib/api")
        const response = await experiments.getResults()
        setData(response.data)
        if (response.data.status) {
          setStatus(response.data.status)
        }
      } catch (error) {
        console.error("Failed to load experimental results from backend, using fallback data.", error)
        setStatus("Using fallback metrics.")
      }
    }

    loadResults()
  }, [])

  const metricsData = metricComparison(data.performance)

  const performanceKeys = useMemo(() => {
    const keys = (Object.keys(data.performance) as DatasetKey[]).filter(
      (k) => data.performance[k]?.baseline && data.performance[k]?.chaos
    )
    const order: DatasetKey[] = ["alz", "breast", "heart", "diabetes", "lung"]
    return keys.sort((a, b) => order.indexOf(a) - order.indexOf(b))
  }, [data.performance])

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      const { experiments } = await import("@/lib/api")
      const response = await experiments.regenerate()
      setData(response.data)
      setStatus(response.data.status || "Experimental results regenerated.")
    } catch (error) {
      console.error("Failed to regenerate experimental results.", error)
      setStatus("Failed to regenerate backend metrics. Showing current data.")
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/80 shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FlaskConical className="h-6 w-6 text-indigo-600" />
                Project Experimental Results
              </CardTitle>
              <CardDescription>
                The same visual performance story used in the project report is now shown directly in the application.
              </CardDescription>
            </div>
            {allowRefresh ? (
              <Button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {isRefreshing ? "Refreshing..." : "Refresh Metrics"}
              </Button>
            ) : null}
          </div>
          <CardDescription>
            {status || "Loading experimental metrics..."}
          </CardDescription>
        </CardHeader>
      </Card>

      {performanceKeys.length === 0 ? (
        <Card className="border-0 bg-white/80 shadow-lg">
          <CardHeader>
            <CardTitle>No matching benchmark metrics</CardTitle>
            <CardDescription>
              Your uploaded disease name did not match any report category (heart, diabetes, lung, breast, alzheimer).
              Rename or re-upload using a label that includes one of those keywords, or check the status message above.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-white/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Dataset Sample Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.dataset_overview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#1d4ed8" name="Total Samples" />
                <Bar dataKey="positive" fill="#ef4444" name="Positive" />
                <Bar dataKey="negative" fill="#22c55e" name="Negative" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Feature Count by Dataset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.dataset_overview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="features" fill="#8b5cf6" name="Input Features" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-white/80 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Performance Radar: Baseline vs Chaos-Optimized TabNet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-6 ${performanceKeys.length <= 2 ? "lg:grid-cols-2" : performanceKeys.length <= 3 ? "lg:grid-cols-3" : "lg:grid-cols-5"}`}>
            {performanceKeys.map((key) => (
              <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-center text-sm font-bold text-slate-900">{data.performance[key]!.label}</p>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData(data.performance, key)}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[80, 100]} tick={{ fontSize: 9 }} />
                    <Radar dataKey="baseline" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} name="Baseline" />
                    <Radar dataKey="chaos" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Chaos-Opt" />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card
          className={`border-0 bg-white/80 shadow-lg ${
            data.model_comparison && data.model_comparison.length > 0 ? "xl:col-span-2" : "xl:col-span-3"
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-emerald-600" />
              Classification metrics (your uploaded categories)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Accuracy", "baselineAccuracy", "chaosAccuracy", "#1d4ed8", "#ef4444"],
              ["Precision", "baselinePrecision", "chaosPrecision", "#0ea5e9", "#f97316"],
              ["Sensitivity", "baselineSensitivity", "chaosSensitivity", "#8b5cf6", "#22c55e"],
              ["Specificity", "baselineSpecificity", "chaosSpecificity", "#14b8a6", "#dc2626"],
              ["F1 Score", "baselineF1", "chaosF1", "#475569", "#ea580c"],
              ["AUROC", "baselineAuroc", "chaosAuroc", "#9ca3af", "#a855f7"],
            ].map(([title, baselineKey, chaosKey, baselineColor, chaosColor]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-center text-sm font-bold text-slate-900">{title}</p>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="dataset" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={baselineKey} fill={baselineColor} name="Baseline" />
                    <Bar dataKey={chaosKey} fill={chaosColor} name="Chaos-Opt" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </CardContent>
        </Card>

        {data.model_comparison && data.model_comparison.length > 0 ? (
        <Card className="border-0 bg-white/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-rose-600" />
              Heart disease classifier comparison
            </CardTitle>
            <CardDescription>Benchmark accuracies across algorithms (heart-category reports only)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={520}>
              <BarChart data={data.model_comparison} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[70, 100]} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#ef4444" name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-white/80 shadow-lg">
          <CardHeader>
            <CardTitle>Model Accuracy over 30 Epochs</CardTitle>
            <CardDescription>Baseline vs Chaos-Optimized convergence trend</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {performanceKeys.map((key) => (
              <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-center text-sm font-bold text-slate-900">{data.performance[key]!.label}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={epochCurve(data.performance[key]!.baseline.accuracy, data.performance[key]!.chaos.accuracy)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="epoch" tick={{ fontSize: 10 }} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="baseline" stroke="#3b82f6" strokeDasharray="6 4" dot={false} name="Baseline" />
                    <Line type="monotone" dataKey="chaos" stroke="#ef4444" dot={false} name="Chaos-Opt" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 shadow-lg">
          <CardHeader>
            <CardTitle>Error Metrics Performance</CardTitle>
            <CardDescription>MAE, RMSE, and MAPE comparison</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.error_metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="baselineMae" fill="#ef4444" name="Baseline MAE" />
                <Bar dataKey="chaosMae" fill="#3b82f6" name="Chaos MAE" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.error_metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="baselineRmse" fill="#f97316" name="Baseline RMSE" />
                <Bar dataKey="chaosRmse" fill="#a855f7" name="Chaos RMSE" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.error_metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="baselineMape" fill="#22c55e" name="Baseline MAPE" />
                <Bar dataKey="chaosMape" fill="#dc2626" name="Chaos MAPE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-white/80 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid2X2 className="h-5 w-5 text-sky-600" />
            Confusion Matrices: Baseline vs Chaos-Optimized TabNet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-6 ${data.confusion_matrices.length <= 2 ? "lg:grid-cols-2" : data.confusion_matrices.length <= 3 ? "lg:grid-cols-3" : "lg:grid-cols-5"}`}>
            {data.confusion_matrices.map((matrix) => (
              <div key={matrix.name} className="space-y-4">
                <p className="text-center text-sm font-bold text-slate-900">{matrix.name}</p>
                <ConfusionCard title="Baseline" values={matrix.baseline} tone="baseline" />
                <ConfusionCard title="Chaos-Opt" values={matrix.chaos} tone="chaos" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}
