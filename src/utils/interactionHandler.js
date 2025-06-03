// C:\Users\riccardo\Desktop\mycasasole\src\utils\interactionHandler.js
export function createInteractionHandler(
    scene, 
    rooms, 
    selectedModel, 
    placeModelFn, 
    selectRoomFn, 
    updateFloorVisibilityFn,
    Room,
    floorHeight
  ) {
    let lastClickedFloorIndex = null
    let lastClickTime = 0
    const clickDelay = 300
  
    const handleFloorBaseClick = (intersect, currentTime) => {
      const floorIndex = intersect.object.userData.floorIndex
      
      if (currentTime - lastClickTime < clickDelay && lastClickedFloorIndex === floorIndex) {
        const point = intersect.point
        
        // Check if we're placing a model or creating a room
        if (selectedModel.value) {
          // Find the room this point belongs to
          const room = rooms.find(r => {
            return r.floorIndex === floorIndex &&
                   Math.abs(point.x - r.x) <= r.width/2 &&
                   Math.abs(point.z - r.z) <= r.depth/2
          })
          
          if (room) {
            const relativeX = point.x - room.x
            const relativeZ = point.z - room.z
            placeModelFn(selectedModel.value, room, relativeX, relativeZ)
          }
        } else {
          // Create new room
          const newRoom = new Room(point.x, point.z, floorIndex)
          rooms.push(newRoom)
          selectRoomFn(newRoom)
          updateFloorVisibilityFn()
        }
      } else {
        selectRoomFn(null)
      }
      
      lastClickedFloorIndex = floorIndex
      lastClickTime = currentTime
    }
  
    const handleRoomClick = (intersect, room, currentTime) => {
      if (intersect.object.userData.type === 'handle') {
        return {
          action: 'resize',
          dragType: intersect.object.userData.handleType,
          room
        }
      } else if (intersect.object.userData.type === 'floor') {
        if (currentTime - lastClickTime < clickDelay) {
          return null // Ignore rapid clicks
        }
        
        return {
          action: 'move',
          dragType: 'move',
          room
        }
      }
      return null
    }
  
    const handleModelClick = (intersect) => {
      if (intersect.object.userData.type === 'placedModel') {
        return {
          action: 'selectModel',
          model: intersect.object
        }
      }
      return null
    }
  
    return {
      handleFloorBaseClick,
      handleRoomClick,
      handleModelClick
    }
  }