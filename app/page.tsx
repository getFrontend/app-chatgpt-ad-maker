import ImageUploader from "@/components/ImageUploader"
import ImageEditor from "@/components/ImageEditor"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-8 md:p-12 lg:p-24 bg-background">
      <ThemeToggle />
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-foreground text-center">ChatGPT AD Maker</h1>
      <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <ImageUploader />
        <ImageEditor />
      </div>
    </main>
  )
}