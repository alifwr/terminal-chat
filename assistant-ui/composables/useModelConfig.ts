// composables/useModelConfig.ts
export const useModelConfig = () => {
  // Server-side data loading
  const loadConfigOnServer = () => {
    const config = useRuntimeConfig();
    return {
      modelName: String(config?.public?.modelName || config?.modelName || 'GPT-4 Turbo'),
      baseUrl: String(config?.public?.baseUrl || config?.baseUrl || ''),
      temperature: Number(config?.public?.temperature || config?.temperature || 0.2),
      maxTokens: Number(config?.public?.maxTokens || config?.maxTokens || 32768),
      apiKey: String(config?.public?.apiKey || config?.apiKey || ''), // Add this
    };
  };

  // Use useState to persist server data to client
  const serverConfigData = useState('model-config-data', loadConfigOnServer);

  // Create reactive refs with explicit typing and proper defaults
  const isLoading = ref<boolean>(true);
  const modelName = ref<string>(String(serverConfigData.value.modelName || ''));
  const baseUrl = ref<string>(String(serverConfigData.value.baseUrl || ''));
  const temperature = ref<number>(Number(serverConfigData.value.temperature || 0.2));
  const maxTokens = ref<number>(Number(serverConfigData.value.maxTokens || 32768));
  const apiKey = ref<string>(String(serverConfigData.value.apiKey || '')); // Add this

  // localStorage management
  const STORAGE_KEY = 'model-config';

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        return {
          modelName: String(parsedConfig.modelName || serverConfigData.value.modelName || ''),
          baseUrl: String(parsedConfig.baseUrl || serverConfigData.value.baseUrl || ''),
          temperature: Number(parsedConfig.temperature || serverConfigData.value.temperature || 0.2),
          maxTokens: Number(parsedConfig.maxTokens || serverConfigData.value.maxTokens || 32768),
          apiKey: String(parsedConfig.apiKey || serverConfigData.value.apiKey || ''), // Add this
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
        apiKey: String(apiKey.value || ''), // Add this
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
    } catch (error) {
      console.warn('Failed to save config to localStorage:', error);
    }
  };

  const initializeConfig = () => {
    if (process.client) {
      const localStorageConfig = loadFromLocalStorage();
      
      if (localStorageConfig) {
        modelName.value = String(localStorageConfig.modelName || '');
        baseUrl.value = String(localStorageConfig.baseUrl || '');
        temperature.value = Number(localStorageConfig.temperature || 0.2);
        maxTokens.value = Number(localStorageConfig.maxTokens || 32768);
        apiKey.value = String(localStorageConfig.apiKey || ''); // Add this
      }

      isLoading.value = false;
      
      // Set up watchers
      watch([modelName, baseUrl, temperature, maxTokens, apiKey], () => {
        saveToLocalStorage();
      });
    }
  };

  return {
    // State
    isLoading,
    modelName,
    baseUrl,
    temperature,
    maxTokens,
    apiKey, // Add this
    
    // Methods
    loadFromLocalStorage,
    saveToLocalStorage,
    initializeConfig,
    
    // Computed
    config: computed(() => ({
      modelName: String(modelName.value || ''),
      baseUrl: String(baseUrl.value || ''),
      temperature: Number(temperature.value || 0.2),
      maxTokens: Number(maxTokens.value || 32768),
      apiKey: String(apiKey.value || ''),
    }))
  };
};