<!-- components/ModelConfigPanel.vue -->
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <h4 class="font-semibold text-gray-800 mb-3">Model Configurations</h4>

      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Provider</label>
          <select v-if="!isLoading" v-model="selectedProvider"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            @change="onProviderChange">
            <option value="custom">Custom</option>
            <option value="openrouter">OpenRouter</option>
          </select>
          <select v-else disabled class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>Loading...</option>
          </select>
        </div>

        <div v-if="selectedProvider === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
          <input v-if="!isLoading" v-model="baseUrl" type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
          <input v-else value="" disabled type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></input>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input v-if="!isLoading" v-model="apiKey" type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
          <input v-else value="" disabled type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></input>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
          <select v-if="!isLoading && !loadingModels" v-model="modelName"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option v-for="model in availableModels" :key="model.id" :value="model.id">
              {{ model.name || model.id }}
            </option>
          </select>
          <select v-else disabled class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>{{ loadingModels ? 'Loading models...' : 'Loading...' }}</option>
          </select>
          <div v-if="selectedProvider === 'openrouter' && !loadingModels" class="text-xs text-gray-500 mt-1">
            {{ availableModels.length }} models available
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
          <input v-if="!isLoading" v-model="temperature" type="range" min="0" max="1" step="0.1" class="w-full">
          <input v-else value="0" type="range" min="0" max="1" step="0.1" class="w-full">
          <div v-if="!isLoading" class="text-xs text-gray-500 mt-1">Current: {{ temperature }}</div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
          <input v-if="!isLoading" v-model="maxTokens" type="number"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
          <input v-else value="" disabled type="number"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const STORAGE_KEY = 'model-config';

const config = useRuntimeConfig();

const {
  modelName,
  baseUrl,
  apiKey,
  temperature,
  maxTokens,
} = useModelConfig();

const isLoading = ref(false);
const loadingModels = ref(false);
const selectedProvider = ref('custom');

// Model management
interface ModelInfo {
  id: string;
  name?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

const availableModels = ref<ModelInfo[]>([
  { id: 'aliframadhan/Qwen3-8B-Tool-Calling', name: 'Qwen3-8B-Tool-Calling' }
]);

// OpenRouter configuration
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Fetch OpenRouter models
const fetchOpenRouterModels = async () => {
  if (loadingModels.value) return;
  
  loadingModels.value = true;
  try {
    console.log('Fetching OpenRouter models...');
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey.value}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter and sort models
    const models = data.data
      // .filter((model: any) => model.id && !model.id.includes('free'))
      .map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        context_length: model.context_length,
        pricing: model.pricing
      }))
      .sort((a: ModelInfo, b: ModelInfo) => a.name!.localeCompare(b.name!));
    
    availableModels.value = models;
    console.log(`Loaded ${models.length} OpenRouter models`);
    
    // Set default model if none selected
    if (!modelName.value && models.length > 0) {
      modelName.value = models[0].id;
    }
    
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    // Fallback to default models
    availableModels.value = [
      { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B Instruct (Free)' },
      { id: 'microsoft/wizardlm-2-8x22b', name: 'WizardLM-2 8x22B' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' }
    ];
  } finally {
    loadingModels.value = false;
  }
};

// Provider change handler
const onProviderChange = async () => {
  console.log('Provider changed to:', selectedProvider.value);
  
  if (selectedProvider.value === 'openrouter') {
    baseUrl.value = OPENROUTER_BASE_URL;
    await fetchOpenRouterModels();
  } else {
    // Custom provider - reset to default models
    availableModels.value = [
      { id: 'aliframadhan/Qwen3-8B-Tool-Calling', name: 'Qwen3-8B-Tool-Calling' }
    ];
    
    // Reset base URL if it was OpenRouter
    if (baseUrl.value === OPENROUTER_BASE_URL) {
      baseUrl.value = String(config.public.baseUrl) || '';
    }
  }
  
  // Save provider selection
  saveToLocalStorage();
};

onMounted(() => {
  const localStorageConfig = loadFromLocalStorage();

  if (localStorageConfig) {
    modelName.value = localStorageConfig.modelName;
    baseUrl.value = localStorageConfig.baseUrl;
    temperature.value = localStorageConfig.temperature;
    maxTokens.value = localStorageConfig.maxTokens;
    apiKey.value = localStorageConfig.apiKey;
    selectedProvider.value = localStorageConfig.provider || 'custom'; // Load provider
  } else {
    modelName.value = String(config.public.modelName);
    baseUrl.value = String(config.public.baseUrl);
    temperature.value = 0.5;
    maxTokens.value = 32768;
    apiKey.value = String(config.public.apiKey);
    selectedProvider.value = 'custom';
  }

  isLoading.value = false;

  // Initialize models based on provider
  if (selectedProvider.value === 'openrouter' && apiKey.value) {
    fetchOpenRouterModels();
  }

  watch([modelName, baseUrl, temperature, maxTokens, apiKey, selectedProvider], () => {
    saveToLocalStorage();
  });
});

const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedConfig = JSON.parse(stored);
      return {
        modelName: String(parsedConfig.modelName || ''),
        baseUrl: String(parsedConfig.baseUrl || ''),
        temperature: Number(parsedConfig.temperature || 0.2),
        maxTokens: Number(parsedConfig.maxTokens || 32768),
        apiKey: String(parsedConfig.apiKey || ''),
        provider: String(parsedConfig.provider || 'custom'), // Add provider
      };
    }
  } catch (error) {
    console.warn('Failed to load config from localStorage:', error);
  }
  return null;
};

const saveToLocalStorage = () => {
  try {
    const configToSave = {
      modelName: String(modelName.value || ''),
      baseUrl: String(baseUrl.value || ''),
      temperature: Number(temperature.value || 0.2),
      maxTokens: Number(maxTokens.value || 32768),
      apiKey: String(apiKey.value || ''),
      provider: String(selectedProvider.value || 'custom'), // Add provider
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
  } catch (error) {
    console.warn('Failed to save config to localStorage:', error);
  }
};
</script>