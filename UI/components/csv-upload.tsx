"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, CheckCircle, AlertCircle, FileText, Cloud } from "lucide-react"

interface CSVUploadProps {
  onFileUpload: (fileName: string) => void
}

export default function CSVUpload({ onFileUpload }: CSVUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    processFiles(files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      processFiles(files)
    }
  }

  const processFiles = async (files: FileList) => {
    const file = Array.from(files).find(f => f.type === "text/csv" || f.name.endsWith(".csv"));
    const diseaseInput = document.getElementById('diseaseType') as HTMLInputElement;
    const diseaseType = diseaseInput?.value.trim();

    if (!diseaseType) {
      setUploadMessage("Please enter a Disease Name.");
      setUploadSuccess(false);
      setTimeout(() => setUploadMessage(""), 4000);
      return;
    }

    if (file) {
      try {
        setUploadMessage("Uploading and processing...");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("disease_type", diseaseType);

        await import('@/lib/api').then(m => m.predict.uploadCsv(formData));

        onFileUpload(file.name)
        setUploadMessage(`${file.name} uploaded successfully for ${diseaseType}!`)
        setUploadSuccess(true)
        // Clear input
        if (diseaseInput) diseaseInput.value = "";
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadMessage("Upload failed. Please try again.");
        setUploadSuccess(false)
      }

      setTimeout(() => {
        setUploadMessage("")
        setUploadSuccess(false)
      }, 4000)
    } else {
      setUploadMessage(`Only CSV files are supported`)
      setUploadSuccess(false)
      setTimeout(() => setUploadMessage(""), 4000)
    }
  }

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Upload Medical Dataset</CardTitle>
            <CardDescription className="text-base mt-1">
              Import CSV files containing patient health records for analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragActive
            ? "border-blue-500 bg-blue-50 scale-[1.02]"
            : "border-slate-300 bg-gradient-to-br from-slate-50 to-blue-50/30 hover:border-blue-400 hover:bg-blue-50/50"
            }`}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>

          <div className="relative">
            <div className="inline-flex mb-6">
              <div className="relative">
                <div className={`absolute inset-0 ${isDragActive ? 'bg-blue-500' : 'bg-slate-400'} rounded-2xl blur-xl opacity-30 animate-pulse`}></div>
                <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragActive ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                  }`}>
                  <Upload className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {isDragActive ? "Drop your file here" : "Drag & drop your CSV file"}
            </h3>
            <p className="text-slate-600 mb-6 text-lg">
              or click the button below to browse from your computer
            </p>

            {/* Disease Name Input */}
            <div className="mb-6 max-w-sm mx-auto">
              <label htmlFor="diseaseType" className="block text-sm font-medium text-slate-700 mb-1 text-left">
                Disease Name (Required)
              </label>
              <input
                type="text"
                id="diseaseType"
                placeholder="e.g. Heart Disease, Diabetes"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fileInputRef.current?.click();
                }}
                // We'll use a local ref or state for this if needed, but for now let's use a simple ID selector in processFiles or add state
                // Adding state to the component for this input
                onChange={(e) => {
                  // We need a state for this. Let's add it in a subsequent tool call or assume it exists.
                  // Wait, I need to add state to the component function first.
                  // I will add the state in a separate edit block to the top of the file, 
                  // but for now I'll use a data attribute or similar? No, React state is best.
                  // Since I can't add state in this block without replacing the whole file or using multiple blocks properly,
                  // AND I can't use multiple tool calls for the same file in parallel if they overlap...
                  // I will use `document.getElementById` as a quick hack OR 
                  // BETTER: I will assume I added `diseaseName` state in the previous/next block.
                  // Actually, I'll just use a Ref for the input since I don't need re-renders for it.
                }}
              />
              <p className="text-xs text-slate-500 mt-1 text-left">
                Specify the disease this dataset is for. This name will appear in dropdowns.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv"
                onChange={handleChange}
                className="hidden"
              />
              <Button
                onClick={() => {
                  const diseaseInput = document.getElementById('diseaseType') as HTMLInputElement;
                  if (!diseaseInput || !diseaseInput.value.trim()) {
                    setUploadMessage("Please enter a Disease Name before selecting a file.");
                    setUploadSuccess(false);
                    setTimeout(() => setUploadMessage(""), 4000);
                    return;
                  }
                  fileInputRef.current?.click()
                }}
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all px-8 h-12 text-base font-semibold"
              >
                <FileText className="w-5 h-5 mr-2" />
                Select CSV File
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Message */}
        {uploadMessage && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-center gap-3 animate-slide-down shadow-md ${uploadSuccess
              ? "bg-green-50 border-2 border-green-200"
              : "bg-red-50 border-2 border-red-200"
              }`}
          >
            {uploadSuccess ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <p className={`text-base font-medium ${uploadSuccess ? 'text-green-800' : 'text-red-800'}`}>
              {uploadMessage}
            </p>
          </div>
        )}

        {/* Supported Format Information */}
        <div className="mt-8">
          <h4 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            Supported Data Format
          </h4>
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-slate-500 mt-1" />
              <div>
                <p className="text-slate-700 font-medium">Universal CSV Support</p>
                <p className="text-slate-600 text-sm mt-1">
                  You can now upload datasets with <strong>any column structure</strong>.
                  The system will automatically detect and store all headers and values dynamically.
                  <br /><br />
                  Common columns like <code>age</code>, <code>gender</code>, etc. will be automatically mapped for standard models,
                  but specialized data (e.g. <code>insulin</code>, <code>tumor_radius</code>) is also fully preserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
      `}</style>
    </Card>
  )
}