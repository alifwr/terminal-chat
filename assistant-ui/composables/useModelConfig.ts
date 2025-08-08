// composables/useModelConfig.ts
export const useModelConfig = () => {
  // Create reactive refs with explicit typing and proper defaults
  const modelName = useState<string>('modelName', () => String(''));
  const baseUrl = useState<string>('baseUrl', () => String(''));
  const temperature = useState<number>('temperature', () => Number(0.0));
  const maxTokens = useState<number>('maxTokens', () => Number(32768));
  const apiKey = useState<string>('apiKey', () => String(''));

  return {
    // State
    modelName,
    baseUrl,
    temperature,
    maxTokens,
    apiKey,
    
    // Computed
    // config: computed(() => ({
    //   modelName: String(modelName.value || ''),
    //   baseUrl: String(baseUrl.value || ''),
    //   temperature: Number(temperature.value || 0.2),
    //   maxTokens: Number(maxTokens.value || 32768),
    //   apiKey: String(apiKey.value || ''),
    // }))
  };
};