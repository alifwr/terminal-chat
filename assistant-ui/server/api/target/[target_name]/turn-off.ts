export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const targetName = getRouterParam(event, 'target_name');
    // Replace with the actual external API URL
    const externalApiUrl = `${config.targetManagerUrl}/${targetName}/turn-off`;

    // Send a GET request to the external API using $fetch
    const data = await $fetch<{
      message?: string;
      containers?: {
        name: string;
        id: string;
        status: string;
        ports: Record<string, Array<{ HostIp: string; HostPort: string }> | null>;
      }[];
      command_output?: string;
      error?: string;
    }>(externalApiUrl);

    // Check if the external API returned an error
    if (data.error) {
      return {
        success: false,
        message: data.error
      };
    }

    // Return the response data from the external API
    return {
      success: true,
      message: data.message,
      containers: data.containers,
      commandOutput: data.command_output
    };
  } catch (error: any) {
    // Handle errors and return an appropriate response
    return {
      error: true,
      message: error.message
    };
  }
});
