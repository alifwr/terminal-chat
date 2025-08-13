export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    // Replace with the actual external API URL
    const externalApiUrl = `${config.targetManagerUrl}/benchmarks`;

    // Send a GET request to the external API using $fetch
    const data = await $fetch<{ benchmarks: any[] }>(externalApiUrl);

    // Return the response data from the external API
    return {
      success: true,
      data: data.benchmarks
    };
  } catch (error: any) {
    // Handle errors and return an appropriate response
    return {
      error: true,
      message: error.message
    };
  }
});
