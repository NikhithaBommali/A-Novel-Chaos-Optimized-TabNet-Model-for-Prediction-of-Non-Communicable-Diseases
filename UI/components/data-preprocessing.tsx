"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Zap, Loader2, Database, BarChart3 } from "lucide-react"

interface DataPreprocessingProps {
  uploadedFiles: string[]
  onPreprocess: (data: any[]) => void
}

export default function DataPreprocessing({ uploadedFiles, onPreprocess }: DataPreprocessingProps) {
  const [selectedFile, setSelectedFile] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [preprocessingSteps, setPreprocessingSteps] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      name: "Data Validation",
      description: "Verifying data integrity and format compliance",
      icon: Database,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Missing Values Handler",
      description: "Intelligent imputation of missing data points",
      icon: BarChart3,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Feature Scaling",
      description: "Normalizing numerical features for optimal training",
      icon: Zap,
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Outlier Detection",
      description: "Identifying and handling statistical outliers",
      icon: AlertCircle,
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Feature Engineering",
      description: "Creating derived features for enhanced predictions",
      icon: CheckCircle2,
      color: "from-indigo-500 to-purple-500"
    },
  ]

  const handlePreprocess = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setPreprocessingSteps([])
    setCurrentStep(0)

    // Simulate preprocessing steps with progress
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setPreprocessingSteps((prev) => [...prev, { ...steps[i], status: "completed" }])
    }

    setIsProcessing(false)
    setCurrentStep(steps.length)

    // Generate mock processed data
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      age: 45 + Math.random() * 20,
      gender: Math.random() > 0.5 ? "M" : "F",
      heartDisease: Math.random() > 0.7,
      diabetes: Math.random() > 0.8,
      cancer: Math.random() > 0.9,
    }))

    onPreprocess(mockData)
  }

  const progress = preprocessingSteps.length > 0 ? (preprocessingSteps.length / steps.length) * 100 : 0

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Data Preprocessing Pipeline</CardTitle>
              <CardDescription className="text-base mt-1">
                Transform raw data into ML-ready features
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {uploadedFiles.length === 0 ? (
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-yellow-900 text-lg mb-1">No Dataset Available</p>
                <p className="text-sm text-yellow-700">Please upload a CSV file first to begin preprocessing</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Select Dataset
                </label>
                <select
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  disabled={isProcessing}
                >
                  <option value="">Choose a dataset to process...</option>
                  {uploadedFiles.map((file, idx) => (
                    <option key={idx} value={file}>
                      {file}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handlePreprocess}
                disabled={!selectedFile || isProcessing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all h-14 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Pipeline...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Start Preprocessing
                  </>
                )}
              </Button>

              {/* Overall Progress */}
              {isProcessing && (
                <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-purple-900">Overall Progress</span>
                    <span className="text-sm font-bold text-purple-600">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-purple-100" />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Processing Steps */}
      {preprocessingSteps.length > 0 && (
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl flex items-center gap-2">
              <Loader2 className={`w-5 h-5 ${isProcessing ? 'animate-spin text-purple-600' : 'text-green-600'}`} />
              Pipeline Execution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {preprocessingSteps.map((step, idx) => {
                const StepIcon = step.icon
                return (
                  <div
                    key={idx}
                    className="animate-slide-in"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                      <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                        <StepIcon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg text-slate-900">{step.name}</h3>
                          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{step.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-progress"></div>
                          </div>
                          <span className="text-xs font-semibold text-green-600">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Completion Message */}
              {!isProcessing && preprocessingSteps.length === steps.length && (
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl animate-slide-in">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-green-900 mb-1">Processing Complete!</h3>
                      <p className="text-sm text-green-700">Dataset successfully preprocessed and ready for model training</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes progress {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-progress {
          animation: progress 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}