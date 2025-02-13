"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useImageStore } from "@/store/imageStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link } from "lucide-react"

export default function ImageUploader() {
  const [dragActive, setDragActive] = useState(false)
  const { setImage } = useImageStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState("")

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      setImage(url)
      setUrl("")
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors
          ${dragActive ? "border-primary" : "border-border"}
          dark:bg-gray-800 bg-gray-50`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={handleChange} />
        <div className="cursor-pointer" onClick={handleButtonClick}>
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-base sm:text-lg text-foreground mb-2">Drag and drop your image here</p>
            <p className="text-sm text-muted-foreground mb-4">or</p>
            <Button variant="outline">Choose Image</Button>
          </div>
        </div>
      </div>
      <form onSubmit={handleUrlSubmit} className="flex space-x-2">
        <Input
          type="url"
          placeholder="Enter image URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit">
          <Link className="w-4 h-4 mr-2" />
          Add URL
        </Button>
      </form>
    </div>
  )
}