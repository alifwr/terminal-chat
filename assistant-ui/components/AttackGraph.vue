<!-- components/AttackGraph.vue -->
<template>
  <div class="h-full bg-gray-50 rounded-lg p-4">
    <h3 class="text-lg font-semibold mb-4">Attack Graph Visualization</h3>
    
    <div class="bg-white rounded-lg border h-full p-4 relative overflow-hidden">
      <!-- Attack Graph SVG would go here -->
      <svg class="w-full h-full">
        <!-- Initial Node -->
        <circle cx="100" cy="100" r="30" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
        <text x="100" y="105" text-anchor="middle" fill="white" font-size="12">Start</text>
        
        <!-- Reconnaissance Node -->
        <circle cx="250" cy="100" r="30" fill="#10B981" stroke="#059669" stroke-width="2"/>
        <text x="250" y="105" text-anchor="middle" fill="white" font-size="12">Recon</text>
        
        <!-- Exploitation Node -->
        <circle cx="400" cy="100" r="30" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
        <text x="400" y="105" text-anchor="middle" fill="white" font-size="12">Exploit</text>
        
        <!-- Target Node -->
        <circle cx="550" cy="100" r="30" fill="#EF4444" stroke="#DC2626" stroke-width="2"/>
        <text x="550" y="105" text-anchor="middle" fill="white" font-size="12">Target</text>
        
        <!-- Arrows -->
        <path d="M 130 100 L 220 100" stroke="#6B7280" stroke-width="2" marker-end="url(#arrowhead)"/>
        <path d="M 280 100 L 370 100" stroke="#6B7280" stroke-width="2" marker-end="url(#arrowhead)"/>
        <path d="M 430 100 L 520 100" stroke="#6B7280" stroke-width="2" marker-end="url(#arrowhead)"/>
        
        <!-- Arrow marker -->
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280"/>
          </marker>
        </defs>
      </svg>
      
      <div class="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow border">
        <div class="text-sm font-medium mb-2">Attack Progress</div>
        <div class="space-y-1 text-xs">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Reconnaissance Complete</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Exploitation In Progress</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span>Post-Exploitation Pending</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>