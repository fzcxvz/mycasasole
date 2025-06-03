// C:\Users\riccardo\Desktop\mycasasole\src\composables\useModelManager.js
import { ref, computed } from 'vue'

export function useModelManager(scene, rooms, selectedFloor, floorHeight) {
  const placedObjects = ref([])

  const visibleObjects = computed(() => {
    if (!selectedFloor.value) return placedObjects.value.length
    const selectedFloorIndex = parseInt(selectedFloor.value.replace('floor', ''))
    return placedObjects.value.filter(obj => {
      const room = rooms.find(r => r.id === obj.userData.roomId)
      return room && room.floorIndex === selectedFloorIndex
    }).length
  })

  const placeModelInRoom = async (modelData, room, x = 0, z = 0, loadModelFn) => {
    try {
      const model = await loadModelFn(modelData.path)
      
      // Position the model within the room
      const roomY = room.floorIndex * floorHeight + 0.5
      model.position.set(room.x + x, roomY, room.z + z)
      
      // Scale model if needed (adjust based on your models)
      model.scale.setScalar(1)
      
      // Add interaction data
      model.userData = {
        type: 'placedModel',
        modelData,
        roomId: room.id,
        id: `model_${Date.now()}_${Math.random()}`
      }
      
      scene.add(model)
      placedObjects.value.push(model)
      
      return model
    } catch (error) {
      console.error('Error placing model:', error)
      return null
    }
  }

  const updateModelVisibility = () => {
    if (selectedFloor.value) {
      const selectedFloorIndex = parseInt(selectedFloor.value.replace('floor', ''))
      
      placedObjects.value.forEach(obj => {
        const room = rooms.find(r => r.id === obj.userData.roomId)
        if (room) {
          obj.visible = room.floorIndex === selectedFloorIndex
        }
      })
    } else {
      placedObjects.value.forEach(obj => {
        obj.visible = true
      })
    }
  }

  const cleanupRoomModels = (roomId) => {
    const roomModels = placedObjects.value.filter(obj => obj.userData.roomId === roomId)
    roomModels.forEach(model => {
      scene.remove(model)
      // Clean up geometry and materials
      model.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    })
    
    // Remove from placedObjects array
    for (let i = placedObjects.value.length - 1; i >= 0; i--) {
      if (placedObjects.value[i].userData.roomId === roomId) {
        placedObjects.value.splice(i, 1)
      }
    }
  }

  const removeModel = (modelId) => {
    const modelIndex = placedObjects.value.findIndex(obj => obj.userData.id === modelId)
    if (modelIndex !== -1) {
      const model = placedObjects.value[modelIndex]
      scene.remove(model)
      
      model.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
      
      placedObjects.value.splice(modelIndex, 1)
    }
  }

  const getModelsInRoom = (roomId) => {
    return placedObjects.value.filter(obj => obj.userData.roomId === roomId)
  }

  return {
    placedObjects,
    visibleObjects,
    placeModelInRoom,
    updateModelVisibility,
    cleanupRoomModels,
    removeModel,
    getModelsInRoom
  }
}