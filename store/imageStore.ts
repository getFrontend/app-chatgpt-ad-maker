import { create } from "zustand"

interface ImageState {
  image: string | null
  setImage: (image: string | null) => void
}

export const useImageStore = create<ImageState>((set) => ({
  image: null,
  setImage: (image) => set({ image }),
}))

