<!-- C:\Users\riccardo\Desktop\mycasasole\src\components\ModelSelectionPanel.vue -->
<template>
    <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10 border max-w-xs">
      <label class="text-sm font-medium text-gray-700">3D Models:</label>
      <div class="mt-2 max-h-40 overflow-y-auto">
        <div v-if="isLoadingModels" class="text-xs text-gray-500 text-center py-2">
          Loading models...
        </div>
        <div v-else>
          <div 
            v-for="model in availableModels" 
            :key="model.filename"
            @click="selectModel(model)"
            :class="[
              'p-2 mb-1 rounded cursor-pointer text-xs border transition-colors',
              selectedModel?.filename === model.filename 
                ? 'bg-blue-100 border-blue-300 text-blue-800' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            ]"
          >
            <div class="font-medium">{{ model.name }}</div>
            <div class="text-gray-500 text-xs">{{ model.filename }}</div>
          </div>
        </div>
      </div>
      <div v-if="selectedModel" class="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
        <div class="flex items-center justify-between">
          <div>
            <strong>Selected:</strong> {{ selectedModel.name }}<br>
            <span class="text-green-600">Click in a room to place</span>
          </div>
          <button 
            @click="clearSelection"
            class="text-gray-400 hover:text-gray-600 transition-colors ml-2"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    availableModels: Array,
    isLoadingModels: Boolean,
    selectedModel: Object
  })
  
  defineEmits(['selectModel', 'clearSelection'])
  
  const selectModel = (model) => {
    emit('selectModel', model)
  }
  
  const clearSelection = () => {
    emit('clearSelection')
  }
  
  const emit = defineEmits(['selectModel', 'clearSelection'])
  </script>