<template>
  <div ref="threeCanvas" class="w-full h-full relative">
    <!-- Floor Selection Panel -->
    <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10 border">
      <label class="text-sm font-medium text-gray-700">Select Floor:</label>
      <select v-model="selectedFloor" @change="zoomToSelectedFloor" class="mt-1 block w-full">
        <option value="">Show All Floors</option>
        <option v-for="floor in floors" :key="floor.id" :value="floor.id">{{ floor.name }}</option>
      </select>
    </div>
    
    <!-- Instructions Panel -->
    <div class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg z-10 border">
      <div class="text-xs text-gray-600 text-center">
        <div><strong>Click</strong> room to select • <strong>Drag walls</strong> to resize • <strong>Drag floor</strong> to move • <strong>Double-click</strong> floor to add room</div>
      </div>
    </div>
    
    <!-- Room Properties Panel -->
    <div 
      v-if="selectedRoom" 
      ref="propertiesPanel"
      :style="{ left: panelPosition.x + 'px', top: panelPosition.y + 'px' }"
      class="absolute bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl z-20 border-2 border-blue-200 min-w-[200px]"
      @mousedown="startDragPanel"
    >
      <!-- Panel Header -->
      <div class="flex items-center justify-between mb-3 cursor-move bg-blue-50 -m-4 p-3 rounded-t-lg border-b">
        <h3 class="font-bold text-blue-800 text-sm">Room Info</h3>
        <button @click="selectRoom(null)" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      
      <!-- Properties Content -->
      <div class="space-y-3">
        <div class="text-xs text-gray-600">
          <div><strong>Size:</strong> {{ selectedRoom.width.toFixed(1) }} × {{ selectedRoom.depth.toFixed(1) }} × {{ selectedRoom.height.toFixed(1) }}m</div>
          <div><strong>Floor:</strong> {{ selectedRoom.floorIndex + 1 }}</div>
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="duplicateRoom" 
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            Copy
          </button>
          <button 
            @click="deleteRoom" 
            class="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    
    <!-- Room Counter -->
    <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg z-10 border">
      <div class="text-sm text-gray-600">
        <strong>{{ visibleRooms }}</strong> rooms {{ selectedFloor ? `on ${floors.find(f => f.id === selectedFloor)?.name}` : 'total' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, ref, nextTick, computed } from 'vue'
import gsap from 'gsap'

const threeCanvas = ref(null)
const propertiesPanel = ref(null)
const selectedFloor = ref('')
const selectedRoom = ref(null)
const panelPosition = ref({ x: window.innerWidth - 220, y: 100 })

const floors = ref([
  { id: 'floor0', name: 'Floor 1' },
  { id: 'floor1', name: 'Floor 2' },
  { id: 'floor2', name: 'Floor 3' }
])

const visibleRooms = computed(() => {
  if (!selectedFloor.value) return rooms.length
  const floorIndex = parseInt(selectedFloor.value.replace('floor', ''))
  return rooms.filter(room => room.floorIndex === floorIndex).length
})

let scene, camera, renderer, controls
let raycaster, mouse
let isDragging = false
let isDraggingPanel = false
let dragObject = null
let dragType = null // 'move', 'resize-width', 'resize-depth', 'resize-height'
let dragPlane = new THREE.Plane()
let dragStartPos = new THREE.Vector3()
let dragStartSize = { width: 0, depth: 0, height: 0 }
let panelDragOffset = { x: 0, y: 0 }
let lastClickTime = 0
let clickDelay = 300

const floorMeshes = {}
const rooms = []
const floorHeight = 15
const numFloors = 3

// Room class with interactive handles
class Room {
  constructor(x, z, floorIndex, width = 5, depth = 5, height = 4) {
    this.x = x
    this.z = z
    this.floorIndex = floorIndex
    this.width = width
    this.depth = depth
    this.height = height
    this.walls = []
    this.handles = []
    this.id = `room_${Date.now()}_${Math.random()}`
    
    this.createRoom()
  }
  
  createRoom() {
    this.clearRoom()
    
    const isSelected = selectedRoom.value?.id === this.id
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: isSelected ? 0x4CAF50 : 0x666666 
    })
    const baseY = this.floorIndex * floorHeight + 0.5
    const wallY = baseY + this.height / 2
    const wallThickness = 0.15
    
    const createWall = (width, height, depth, posX, posY, posZ, wallType) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMaterial)
      wall.position.set(posX, posY, posZ)
      wall.userData = { roomId: this.id, type: 'wall', wallType }
      scene.add(wall)
      this.walls.push(wall)
      return wall
    }

    // Create room walls with doorway
    const doorWidth = 1.5
    const wallSegmentWidth = (this.width - doorWidth) / 2
    
    // Front wall segments (with door)
    createWall(wallSegmentWidth, this.height, wallThickness, 
              this.x - doorWidth/2 - wallSegmentWidth/2, wallY, this.z - this.depth / 2, 'front-left')
    createWall(wallSegmentWidth, this.height, wallThickness, 
              this.x + doorWidth/2 + wallSegmentWidth/2, wallY, this.z - this.depth / 2, 'front-right')
    
    // Other walls
    createWall(this.width, this.height, wallThickness, this.x, wallY, this.z + this.depth / 2, 'back')
    createWall(wallThickness, this.height, this.depth, this.x - this.width / 2, wallY, this.z, 'left')
    createWall(wallThickness, this.height, this.depth, this.x + this.width / 2, wallY, this.z, 'right')
    
    // Floor area for moving
    const floorGeometry = new THREE.PlaneGeometry(this.width, this.depth)
    const floorMaterial = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: isSelected ? 0.3 : 0.05,
      color: isSelected ? 0x4CAF50 : 0x0077ff
    })
    const floorArea = new THREE.Mesh(floorGeometry, floorMaterial)
    floorArea.rotation.x = -Math.PI / 2
    floorArea.position.set(this.x, baseY + 0.01, this.z)
    floorArea.userData = { roomId: this.id, type: 'floor', room: this }
    scene.add(floorArea)
    this.walls.push(floorArea)
    
    // Create resize handles if selected
    if (isSelected) {
      this.createResizeHandles()
    }
  }
  
  createResizeHandles() {
    const handleSize = 0.3
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b6b })
    const baseY = this.floorIndex * floorHeight + 0.5
    
    // Width handles (left and right)
    const leftHandle = new THREE.Mesh(new THREE.SphereGeometry(handleSize), handleMaterial)
    leftHandle.position.set(this.x - this.width/2, baseY + this.height/2, this.z)
    leftHandle.userData = { roomId: this.id, type: 'handle', handleType: 'width-left' }
    scene.add(leftHandle)
    this.handles.push(leftHandle)
    
    const rightHandle = new THREE.Mesh(new THREE.SphereGeometry(handleSize), handleMaterial)
    rightHandle.position.set(this.x + this.width/2, baseY + this.height/2, this.z)
    rightHandle.userData = { roomId: this.id, type: 'handle', handleType: 'width-right' }
    scene.add(rightHandle)
    this.handles.push(rightHandle)
    
    // Depth handles (front and back)
    const frontHandle = new THREE.Mesh(new THREE.SphereGeometry(handleSize), handleMaterial)
    frontHandle.position.set(this.x, baseY + this.height/2, this.z - this.depth/2)
    frontHandle.userData = { roomId: this.id, type: 'handle', handleType: 'depth-front' }
    scene.add(frontHandle)
    this.handles.push(frontHandle)
    
    const backHandle = new THREE.Mesh(new THREE.SphereGeometry(handleSize), handleMaterial)
    backHandle.position.set(this.x, baseY + this.height/2, this.z + this.depth/2)
    backHandle.userData = { roomId: this.id, type: 'handle', handleType: 'depth-back' }
    scene.add(backHandle)
    this.handles.push(backHandle)
    
    // Height handle (top center)
    const topHandle = new THREE.Mesh(new THREE.SphereGeometry(handleSize), handleMaterial)
    topHandle.position.set(this.x, baseY + this.height, this.z)
    topHandle.userData = { roomId: this.id, type: 'handle', handleType: 'height' }
    scene.add(topHandle)
    this.handles.push(topHandle)
  }
  
  clearRoom() {
    [...this.walls, ...this.handles].forEach(obj => {
      scene.remove(obj)
      obj.geometry.dispose()
      obj.material.dispose()
    })
    this.walls = []
    this.handles = []
  }
  
  updatePosition(x, z) {
    this.x = x
    this.z = z
    this.createRoom()
  }
  
  updateSize(width, depth, height) {
    this.width = Math.max(2, parseFloat(width))
    this.depth = Math.max(2, parseFloat(depth))
    this.height = Math.max(1, parseFloat(height))
    this.createRoom()
  }
  
  resize(handleType, deltaX, deltaZ, deltaY) {
    const minSize = 2
    const maxSize = 12
    
    switch(handleType) {
      case 'width-left':
        const newWidthLeft = this.width + deltaX
        if (newWidthLeft >= minSize && newWidthLeft <= maxSize) {
          this.width = newWidthLeft
          this.x -= deltaX / 2
        }
        break
      case 'width-right':
        const newWidthRight = this.width - deltaX
        if (newWidthRight >= minSize && newWidthRight <= maxSize) {
          this.width = newWidthRight
          this.x += deltaX / 2
        }
        break
      case 'depth-front':
        const newDepthFront = this.depth + deltaZ
        if (newDepthFront >= minSize && newDepthFront <= maxSize) {
          this.depth = newDepthFront
          this.z -= deltaZ / 2
        }
        break
      case 'depth-back':
        const newDepthBack = this.depth - deltaZ
        if (newDepthBack >= minSize && newDepthBack <= maxSize) {
          this.depth = newDepthBack
          this.z += deltaZ / 2
        }
        break
      case 'height':
        const newHeight = Math.max(1, Math.min(8, this.height - deltaY))
        this.height = newHeight
        break
    }
    this.createRoom()
  }
  
  destroy() {
    this.clearRoom()
  }
  
  clone() {
    return new Room(this.x + 2, this.z + 2, this.floorIndex, this.width, this.depth, this.height)
  }
  
  setVisible(visible) {
    [...this.walls, ...this.handles].forEach(obj => {
      obj.visible = visible
    })
  }
}

const initScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf5f5f5)

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(25, 25, 25)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  threeCanvas.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1.2)
  light.position.set(15, 30, 15)
  light.castShadow = true
  scene.add(light)

  const ambient = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambient)

  // Create floors
  for (let i = 0; i < numFloors; i++) {
    const baseGeometry = new THREE.BoxGeometry(20, 1, 20)
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xdddddd,
      roughness: 0.8
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = i * floorHeight
    base.name = `floor${i}`
    base.userData = { type: 'floorBase', floorIndex: i }
    scene.add(base)
    floorMeshes[base.name] = base

    // Create 2 rooms per floor
    const positions = [[-5, -3], [5, 3]]
    positions.forEach(([x, z]) => {
      const room = new Room(x, z, i)
      rooms.push(room)
    })
  }

  // Event listeners
  renderer.domElement.addEventListener('mousedown', onMouseDown, false)
  renderer.domElement.addEventListener('mousemove', onMouseMove, false)
  renderer.domElement.addEventListener('mouseup', onMouseUp, false)
  window.addEventListener('mousemove', onWindowMouseMove, false)
  window.addEventListener('mouseup', onWindowMouseUp, false)

  animate()
}

const onMouseDown = (event) => {
  if (isDraggingPanel) return
  
  event.preventDefault()
  updateMousePosition(event)
  
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)
  
  if (intersects.length > 0) {
    const intersect = intersects[0]
    const currentTime = Date.now()
    
    if (intersect.object.userData.roomId) {
      const room = rooms.find(r => r.id === intersect.object.userData.roomId)
      if (!room) return
      
      if (intersect.object.userData.type === 'handle') {
        // Handle resize
        isDragging = true
        dragObject = room
        dragType = intersect.object.userData.handleType
        controls.enabled = false
        selectRoom(room)
        
        dragStartPos.copy(intersect.point)
        dragStartSize = { width: room.width, depth: room.depth, height: room.height }
        
      } else if (intersect.object.userData.type === 'floor') {
        // Handle move
        if (currentTime - lastClickTime < clickDelay) {
          return // Ignore rapid clicks
        }
        
        isDragging = true
        dragObject = room
        dragType = 'move'
        controls.enabled = false
        selectRoom(room)
        
        const floorY = room.floorIndex * floorHeight + 0.5
        dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, floorY, 0)
        )
        
        dragStartPos.set(room.x, 0, room.z)
        lastClickTime = currentTime
      }
    } else if (intersect.object.userData.type === 'floorBase') {
      // Handle floor interaction
      if (currentTime - lastClickTime < clickDelay) {
        const floorIndex = intersect.object.userData.floorIndex
        const point = intersect.point
        const newRoom = new Room(point.x, point.z, floorIndex)
        rooms.push(newRoom)
        selectRoom(newRoom)
        updateFloorVisibility()
      } else {
        selectRoom(null)
      }
      lastClickTime = currentTime
    }
  }
}

const onMouseMove = (event) => {
  if (isDraggingPanel) return
  
  event.preventDefault()
  updateMousePosition(event)
  
  if (isDragging && dragObject) {
    raycaster.setFromCamera(mouse, camera)
    
    if (dragType === 'move') {
      const intersection = new THREE.Vector3()
      if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        const maxBound = 8
        intersection.x = Math.max(-maxBound, Math.min(maxBound, intersection.x))
        intersection.z = Math.max(-maxBound, Math.min(maxBound, intersection.z))
        dragObject.updatePosition(intersection.x, intersection.z)
      }
    } else {
      // Handle resizing
      const intersects = raycaster.intersectObjects([floorMeshes[`floor${dragObject.floorIndex}`]], false)
      if (intersects.length > 0) {
        const currentPos = intersects[0].point
        const deltaX = currentPos.x - dragStartPos.x
        const deltaZ = currentPos.z - dragStartPos.z
        const deltaY = currentPos.y - dragStartPos.y
        
        dragObject.resize(dragType, deltaX, deltaZ, deltaY)
        dragStartPos.copy(currentPos)
      }
    }
  }
}

const onMouseUp = (event) => {
  event.preventDefault()
  isDragging = false
  dragObject = null
  dragType = null
  controls.enabled = true
}

const startDragPanel = (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON') return
  
  isDraggingPanel = true
  const rect = propertiesPanel.value.getBoundingClientRect()
  panelDragOffset.x = event.clientX - rect.left
  panelDragOffset.y = event.clientY - rect.top
  controls.enabled = false
}

const onWindowMouseMove = (event) => {
  if (isDraggingPanel) {
    panelPosition.value = {
      x: Math.max(0, Math.min(window.innerWidth - 220, event.clientX - panelDragOffset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 200, event.clientY - panelDragOffset.y))
    }
  }
}

const onWindowMouseUp = () => {
  if (isDraggingPanel) {
    isDraggingPanel = false
    controls.enabled = true
  }
}

const updateMousePosition = (event) => {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

const selectRoom = (room) => {
  const previousRoom = selectedRoom.value
  selectedRoom.value = room
  
  if (previousRoom) {
    previousRoom.createRoom()
  }
  if (room) {
    room.createRoom()
  }
}

const updateFloorVisibility = () => {
  if (selectedFloor.value) {
    const selectedFloorIndex = parseInt(selectedFloor.value.replace('floor', ''))
    
    // Hide/show floor bases
    Object.values(floorMeshes).forEach((floor, index) => {
      floor.visible = (index === selectedFloorIndex)
    })
    
    // Hide/show rooms
    rooms.forEach(room => {
      room.setVisible(room.floorIndex === selectedFloorIndex)
    })
  } else {
    // Show all floors and rooms
    Object.values(floorMeshes).forEach(floor => {
      floor.visible = true
    })
    rooms.forEach(room => {
      room.setVisible(true)
    })
  }
}

const duplicateRoom = () => {
  if (selectedRoom.value) {
    const newRoom = selectedRoom.value.clone()
    rooms.push(newRoom)
    selectRoom(newRoom)
    updateFloorVisibility()
  }
}

const deleteRoom = () => {
  if (selectedRoom.value) {
    const roomIndex = rooms.findIndex(r => r.id === selectedRoom.value.id)
    if (roomIndex > -1) {
      rooms[roomIndex].destroy()
      rooms.splice(roomIndex, 1)
      selectedRoom.value = null
    }
  }
}

const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

const zoomToSelectedFloor = () => {
  updateFloorVisibility()
  
  if (selectedFloor.value) {
    const mesh = floorMeshes[selectedFloor.value]
    if (mesh) {
      const floorIndex = parseInt(selectedFloor.value.replace('floor', ''))
      const floorCenter = new THREE.Vector3(0, floorIndex * floorHeight, 0)
      
      const optimalDistance = 30
      const optimalHeight = floorIndex * floorHeight + 20
      const angle = Math.PI / 4
      
      const newCameraPos = new THREE.Vector3(
        Math.cos(angle) * optimalDistance,
        optimalHeight,
        Math.sin(angle) * optimalDistance
      )

      gsap.to(camera.position, {
        x: newCameraPos.x,
        y: newCameraPos.y,
        z: newCameraPos.z,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(floorCenter)
          controls.target.copy(floorCenter)
          controls.update()
        },
        onComplete: () => {
          controls.target.copy(floorCenter)
        }
      })
    }
  } else {
    // Show all floors - zoom out
    const centerPos = new THREE.Vector3(0, floorHeight, 0)
    const wideViewPos = new THREE.Vector3(35, 35, 35)
    
    gsap.to(camera.position, {
      x: wideViewPos.x,
      y: wideViewPos.y,
      z: wideViewPos.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(centerPos)
        controls.target.copy(centerPos)
        controls.update()
      }
    })
  }
}

onMounted(() => {
  initScene()
  
  nextTick(() => {
    panelPosition.value = {
      x: Math.min(window.innerWidth - 220, window.innerWidth * 0.8),
      y: 100
    }
  })
})
</script>

<style scoped>
select {
  @apply w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.cursor-move {
  cursor: move;
}
</style>