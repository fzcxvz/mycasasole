// C:\Users\riccardo\Desktop\mycasasole\src\composables\useModelLoader.js
import { ref } from 'vue'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export function useModelLoader() {
  const availableModels = ref([])
  const isLoadingModels = ref(false)
  const selectedModel = ref(null)
  const gltfLoader = new GLTFLoader()
  const loadedModels = new Map()

  const loadAvailableModels = async () => {
    isLoadingModels.value = true
    try {
      // You can replace this with actual file system reading or API call
      const modelFiles = [
        'chair.glb',
        'table.glb', 
        'sofa.glb',
        'bed.glb',
        'desk.glb',
        'lamp.glb',
        'bookshelf.glb',
        'wardrobe.glb'
        // Add your actual model filenames here
      ]
      
      availableModels.value = modelFiles.map(filename => ({
        name: filename.replace('.glb', '').replace(/[-_]/g, ' '),
        filename,
        path: `/src/assets/models/${filename}`,
        thumbnail: null
      }))
    } catch (error) {
      console.error('Error loading model list:', error)
    } finally {
      isLoadingModels.value = false
    }
  }

  const loadModel = async (modelPath) => {
    if (loadedModels.has(modelPath)) {
      return loadedModels.get(modelPath).clone()
    }
    
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          
          // Cache the original model
          loadedModels.set(modelPath, model)
          resolve(model.clone())
        },
        (progress) => {
          console.log(`Loading ${modelPath}:`, (progress.loaded / progress.total * 100) + '%')
        },
        (error) => {
          console.error('Error loading model:', error)
          reject(error)
        }
      )
    })
  }

  const selectModel = (model) => {
    selectedModel.value = selectedModel.value?.filename === model.filename ? null : model
  }

  const clearSelection = () => {
    selectedModel.value = null
  }

  return {
    availableModels,
    isLoadingModels,
    selectedModel,
    loadAvailableModels,
    loadModel,
    selectModel,
    clearSelection
  }
}