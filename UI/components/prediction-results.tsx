"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Calendar, Activity } from "lucide-react"

interface PredictionResultsProps {
  predictions: any[]
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