"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Activity, Sparkles, AlertTriangle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DiseasePredictionFormProps {
  onPrediction: (data: any) => void
}

interface PredictionResult {
  id: string;
  name: string;
  risk: number;
  color: string;
  explanation: string;
}

interface BackendPredictionResponse {
  risk_score: number;
  risk_level: string;
  disease: string;
  explanation: string;
}

// Disease-specific field configurations
// Disease-specific field configurations
interface FieldConfig {
  name: string;
  label: string;
  type: string;
  required: boolean;
  step?: string;
  options?: string[];
}

const diseaseFields: Record<string, FieldConfig[]> = {
  "Heart Disease": [
    { name: "age", label: "Age (years)", type: "number", required: true },
    { name: "blood_pressure", label: "Blood Pressure (mmHg)", type: "number", required: true },
    { name: "cholesterol", label: "Cholesterol (mg/dL)", type: "number", required: true },
    { name: "bmi", label: "BMI", type: "number", step: "0.1", required: true },
    { name: "chest_pain", label: "Chest Pain Type (0-3)", type: "number", required: false },
    { name: "resting_ecg", label: "Resting ECG (0-2)", type: "number", required: false },
    { name: "max_heart_rate", label: "Max Heart Rate", type: "number", required: false },
    { name: "exercise_angina", label: "Exercise Angina (0-1)", type: "number", required: false },
  ],
  "Breast Cancer": [
    { name: "radius_mean", label: "Radius Mean", type: "number", step: "0.01", required: true },
    { name: "texture_mean", label: "Texture Mean", type: "number", step: "0.01", required: true },
    { name: "perimeter_mean", label: "Perimeter Mean", type: "number", step: "0.01", required: true },
    { name: "area_mean", label: "Area Mean", type: "number", step: "0.01", required: true },
    { name: "smoothness_mean", label: "Smoothness Mean", type: "number", step: "0.0001", required: false },
    { name: "compactness_mean", label: "Compactness Mean", type: "number", step: "0.0001", required: false },
    { name: "concavity_mean", label: "Concavity Mean", type: "number", step: "0.0001", required: false },
    { name: "symmetry_mean", label: "Symmetry Mean", type: "number", step: "0.0001", required: false },
  ],
  "Lung Cancer": [
    { name: "age", label: "Age (years)", type: "number", required: true },
    { name: "smoking", label: "Smoking (Yes/No)", type: "select", options: ["No", "Yes"], required: true },
    { name: "yellow_fingers", label: "Yellow Fingers (Yes/No)", type: "select", options: ["No", "Yes"], required: false },
    { name: "anxiety", label: "Anxiety (Yes/No)", type: "select", options: ["No", "Yes"], required: false },
    { name: "peer_pressure", label: "Peer Pressure (Yes/No)", type: "select", options: ["No", "Yes"], required: false },
    { name: "chronic_disease", label: "Chronic Disease (Yes/No)", type: "select", options: ["No", "Yes"], required: false },
    { name: "fatigue", label: "Fatigue (Yes/No)", type: "select", options: ["No", "Yes"], required: false },
    { name: "wheezing", label: "Wheezing (Yes/No)", type: "select", options: ["No", "Yes"], required: false },
  ],
}

export default function DiseasePredictionForm({ onPrediction }: DiseasePredictionFormProps) {
  const [selectedDisease, setSelectedDisease] = useState<string>("")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [results, setResults] = useState<PredictionResult[]>([]) // Use typed array
  const [isLoading, setIsLoading] = useState(false)
  const [availableDiseases, setAvailableDiseases] = useState<string[]>([])

  // Fetch unique diseases
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const res = await import('@/lib/api').then(m => m.predict.getUniqueDiseases());
        setAvailableDiseases(res.data);
        if (res.data.length > 0) {
          setSelectedDisease(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch diseases", err);
      }
    }
    fetchDiseases();
  }, []);

  const currentFields = diseaseFields[selectedDisease as keyof typeof diseaseFields] || diseaseFields["Heart Disease"]

  const handleDiseaseChange = (value: string) => {
    setSelectedDisease(value)
    setFormData({}) // Reset form when disease changes
    setResults([]) // Clear previous results
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const requiredFields = currentFields.filter(f => f.required)
    const missingFields = requiredFields.filter(f => !formData[f.name] || formData[f.name].trim() === "")

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(", ")}`)
      return
    }

    setIsLoading(true)

    try {
      // Convert form data to API format
      const features: Record<string, any> = {}
      currentFields.forEach(field => {
        const value = formData[field.name]
        if (value !== undefined && value !== "") {
          if (field.type === "number") {
            features[field.name] = parseFloat(value)
          } else if (field.type === "select") {
            // Convert Yes/No to 1/0 for backend
            features[field.name] = value === "Yes" ? 1 : 0
          } else {
            features[field.name] = value
          }
        }
      })

      // Import API dynamically
      const response = await import('@/lib/api').then(m => m.predict.tabular(
        { features },
        selectedDisease
      ))

      const backendResults = response.data

      // Map Backend Response to Frontend UI format
      const mappedResults = backendResults.map((res: BackendPredictionResponse) => {
        let color = "from-green-500 to-emerald-600"
        if (res.risk_level === "High") color = "from-red-500 to-pink-600"
        if (res.risk_level === "Medium") color = "from-yellow-500 to-orange-600"

        return {
          id: res.disease.toLowerCase().replace(" ", "_"),
          name: res.disease,
          risk: res.risk_score,
          color: color,
          explanation: res.explanation || "Risk analysis based on provided metrics."
        }
      })

      setResults(mappedResults)

      onPrediction({
        timestamp: new Date(),
        formData,
        results: mappedResults,
        disease: selectedDisease,
      })

    } catch (error) {
      console.error("Prediction failed:", error)
      alert("Failed to get prediction from server.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl blur-md"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">AI Health Assessment</CardTitle>
              <CardDescription className="text-base mt-1">
                Select a disease type and enter your health metrics for personalized risk analysis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Disease Selection */}
          <div className="mb-6">
            <Label htmlFor="disease" className="text-sm font-semibold text-slate-700 mb-2 block">
              Select Disease Type
            </Label>
            <Select value={selectedDisease} onValueChange={handleDiseaseChange}>
              <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-purple-500 rounded-xl bg-white">
                <SelectValue placeholder="Select Disease" />
              </SelectTrigger>
              <SelectContent>
                {availableDiseases.length > 0 ? (
                  availableDiseases.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No Datasets Uploaded</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {currentFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {field.type === "select" ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full h-12 px-4 border-2 border-slate-200 focus:border-purple-500 rounded-xl bg-white text-slate-900 font-medium"
                      required={field.required}
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      step={field.step}
                      min="0"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="h-12 border-2 border-slate-200 focus:border-purple-500 rounded-xl"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all h-14 text-lg font-bold disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Brain className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing Health Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Risk Assessment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden animate-slide-up">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-600" />
              Risk Assessment Results
            </CardTitle>
            <CardDescription className="text-base">
              AI-generated predictions based on your health parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-5">
              {results.map((disease, idx) => (
                <div
                  key={disease.id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${disease.color}`}></div>
                      <span className="font-bold text-lg text-slate-900">{disease.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {disease.risk > 70 && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <span
                        className={`text-lg font-bold px-3 py-1 rounded-lg ${disease.risk > 70 ? "text-red-700 bg-red-100" :
                          disease.risk > 40 ? "text-yellow-700 bg-yellow-100" :
                            "text-green-700 bg-green-100"
                          }`}
                      >
                        {disease.risk.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${disease.color} transition-all duration-1000 ease-out shadow-lg`}
                      style={{ width: `${disease.risk}%` }}
                    >
                      <div className="h-full w-full bg-gradient-to-r from-white/30 to-transparent"></div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    {disease.risk > 70 ? "High risk - Consult a healthcare provider" :
                      disease.risk > 40 ? "Moderate risk - Monitor closely" :
                        "Low risk - Maintain healthy lifestyle"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 italic">{disease.explanation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
