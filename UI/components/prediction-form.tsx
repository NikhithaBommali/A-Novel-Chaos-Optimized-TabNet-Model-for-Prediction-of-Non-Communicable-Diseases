"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Activity, Sparkles, AlertTriangle } from "lucide-react"

interface PredictionFormProps {
  onPrediction: (data: any) => void
}

export default function PredictionForm({ onPrediction }: PredictionFormProps) {
  const [formData, setFormData] = useState({
    age: "",
    gender: "M",
    bloodPressure: "",
    cholesterol: "",
    bmi: "",
    smoker: "no",
    exerciseFrequency: "moderate",
  })

  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.age || !formData.bloodPressure || !formData.cholesterol || !formData.bmi) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      // Import API dynamically
      const response = await import('@/lib/api').then(m => m.predict.tabular({
        features: {
          age: parseInt(formData.age),
          gender: formData.gender,
          blood_pressure: parseFloat(formData.bloodPressure),
          cholesterol: parseFloat(formData.cholesterol),
          bmi: parseFloat(formData.bmi),
          smoker: formData.smoker
        }
      }));

      const backendResults = response.data;

      // Map Backend Response to Frontend UI format
      const mappedResults = backendResults.map((res: any) => {
        let color = "from-green-500 to-emerald-600";
        if (res.risk_level === "High") color = "from-red-500 to-pink-600";
        if (res.risk_level === "Medium") color = "from-yellow-500 to-orange-600";

        return {
          id: res.disease.toLowerCase().replace(" ", "_"),
          name: res.disease,
          risk: res.risk_score,
          color: color,
          explanation: res.explanation || "Risk analysis based on provided metrics."
        };
      });

      setResults(mappedResults)

      onPrediction({
        timestamp: new Date(),
        formData,
        results: mappedResults,
      })

    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Failed to get prediction from server.");
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
            <div>
              <CardTitle className="text-2xl">AI Health Assessment</CardTitle>
              <CardDescription className="text-base mt-1">
                Enter your health metrics for personalized risk analysis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  Age (years)
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  className="h-12 border-2 border-slate-200 focus:border-purple-500 rounded-xl"
                  required
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-semibold text-slate-700">
                  Gender
                </Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-12 px-4 border-2 border-slate-200 focus:border-purple-500 rounded-xl bg-white text-slate-900 font-medium"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              {/* Blood Pressure */}
              <div className="space-y-2">
                <Label htmlFor="bloodPressure" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  Blood Pressure (mmHg)
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bloodPressure"
                  name="bloodPressure"
                  type="number"
                  value={formData.bloodPressure}
                  onChange={handleChange}
                  placeholder="e.g., 120"
                  className="h-12 border-2 border-slate-200 focus:border-purple-500 rounded-xl"
                  required
                />
              </div>

              {/* Cholesterol */}
              <div className="space-y-2">
                <Label htmlFor="cholesterol" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  Cholesterol (mg/dL)
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cholesterol"
                  name="cholesterol"
                  type="number"
                  value={formData.cholesterol}
                  onChange={handleChange}
                  placeholder="e.g., 200"
                  className="h-12 border-2 border-slate-200 focus:border-purple-500 rounded-xl"
                  required
                />
              </div>

              {/* BMI */}
              <div className="space-y-2">
                <Label htmlFor="bmi" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  BMI
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bmi"
                  name="bmi"
                  type="number"
                  step="0.1"
                  value={formData.bmi}
                  onChange={handleChange}
                  placeholder="e.g., 25.5"
                  className="h-12 border-2 border-slate-200 focus:border-purple-500 rounded-xl"
                  required
                />
              </div>

              {/* Smoker */}
              <div className="space-y-2">
                <Label htmlFor="smoker" className="text-sm font-semibold text-slate-700">
                  Smoking Status
                </Label>
                <select
                  id="smoker"
                  name="smoker"
                  value={formData.smoker}
                  onChange={handleChange}
                  className="w-full h-12 px-4 border-2 border-slate-200 focus:border-purple-500 rounded-xl bg-white text-slate-900 font-medium"
                >
                  <option value="no">Non-Smoker</option>
                  <option value="yes">Smoker</option>
                  <option value="former">Former Smoker</option>
                </select>
              </div>
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