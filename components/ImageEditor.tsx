"use client"

import { useEffect, useRef, useState } from "react"
import { useImageStore } from "@/store/imageStore"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Download, Wand2 } from "lucide-react"
import { HexColorPicker } from "react-colorful"

export default function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const { image } = useImageStore()
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)
  const [dotSize, setDotSize] = useState(5)
  const [dotSpacing, setDotSpacing] = useState(0)
  const [dotColor, setDotColor] = useState("#FFFFFF")
  const [isLoading, setIsLoading] = useState(false)
  const [isEffectApplied, setIsEffectApplied] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Initialize size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const containerWidth = container.clientWidth
        const containerHeight = Math.min(600, containerWidth * 0.75)
        setSize({ width: containerWidth, height: containerHeight })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Load image
  useEffect(() => {
    if (image) {
      setIsLoading(true)
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = image
      img.onload = () => {
        setImageElement(img)
        setIsLoading(false)
        setIsEffectApplied(false)
        drawImage(img)
      }
      img.onerror = () => {
        setIsLoading(false)
      }
    }
  }, [image])

  const drawImage = (img: HTMLImageElement) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        canvas.width = size.width
        canvas.height = size.height
        const scale = Math.min(size.width / img.width, size.height / img.height)
        const x = (size.width - img.width * scale) / 2
        const y = (size.height - img.height * scale) / 2
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      }
    }
  }

  const applyDotEffect = () => {
    if (!imageElement || !canvasRef.current) return
    setIsLoading(true)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Draw the original image first
      drawImage(imageElement)

      // Get image data
      const imageData = ctx.getImageData(0, 0, size.width, size.height)
      const data = imageData.data

      // Clear canvas
      ctx.fillStyle = "#a2badb"
      ctx.fillRect(0, 0, size.width, size.height)

      // Calculate total dot size (including spacing)
      const totalDotSize = dotSize + dotSpacing

      // Apply dot effect
      for (let y = 0; y < size.height; y += totalDotSize) {
        for (let x = 0; x < size.width; x += totalDotSize) {
          // Get the color of the center pixel of each dot
          const i = (y * size.width + x) * 4
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Convert to grayscale
          const gray = (r + g + b) / 3

          // Draw the dot
          const radius = (dotSize * gray) / 512
          ctx.fillStyle = dotColor
          ctx.beginPath()
          ctx.arc(x + totalDotSize / 2, y + totalDotSize / 2, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      setIsEffectApplied(true)
    } catch (error) {
      console.error("Error applying effect:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle click outside for color picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false)
      }
    }

    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showColorPicker])

  const handleDotSizeChange = (value: number[]) => {
    setDotSize(value[0])
    if (isEffectApplied) {
      drawImage(imageElement!)
      applyDotEffect()
    }
  }

  const handleDotSpacingChange = (value: number[]) => {
    setDotSpacing(value[0])
    if (isEffectApplied) {
      drawImage(imageElement!)
      applyDotEffect()
    }
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL()
      const link = document.createElement("a")
      link.href = dataURL
      link.download = "chatgpt-ad-maker-image.png"
      link.click()
    }
  }

  if (!image) {
    return null
  }

  return (
    <div className="mt-6">
      <div ref={containerRef} className="relative w-full border border-gray-800 rounded-xl overflow-hidden bg-black/90">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div className="text-gray-300">Processing image...</div>
          </div>
        )}
        <canvas ref={canvasRef} width={size.width} height={size.height} className="w-full h-auto" />
      </div>

      {/* Controls Section */}
      <div className="mt-6 space-y-6 lg:space-y-0 lg:flex lg:gap-8">
        {/* Left Column - Color Picker */}
        <div className="lg:w-1/3">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Dot Color</label>
            <div className="relative" ref={colorPickerRef}>
              <button
                className="w-full h-12 rounded-lg border-2 border-gray-700 transition-colors hover:border-gray-600"
                style={{ backgroundColor: dotColor }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                aria-label="Choose dot color"
              />
              {showColorPicker && (
                <div className="absolute z-10 mt-2">
                  <HexColorPicker color={dotColor} onChange={setDotColor} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sliders */}
        <div className="lg:w-2/3 space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Dot Size</label>
            <div className="flex items-center gap-4">
              <Slider
                value={[dotSize]}
                onValueChange={handleDotSizeChange}
                min={2}
                max={20}
                step={1}
                className="flex-grow cursor-grab"
              />
              <span className="text-sm text-gray-400 tabular-nums w-12 text-right">{dotSize}px</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Dot Spacing</label>
            <div className="flex items-center gap-4">
              <Slider
                value={[dotSpacing]}
                onValueChange={handleDotSpacingChange}
                min={1}
                max={10}
                step={1}
                className="flex-grow cursor-grab"
              />
              <span className="text-sm text-gray-400 tabular-nums w-12 text-right">{dotSpacing}px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={applyDotEffect}
          disabled={isLoading || !imageElement}
          className="w-full bg-white hover:bg-gray-100 text-black"
          size="lg"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Apply Effect
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isLoading || !isEffectApplied}
          variant="outline"
          className="w-full border-gray-700 hover:bg-gray-800"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  )
}