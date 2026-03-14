import { AxiosError } from "axios";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { ServiceHealthResponse } from "@/types/admin";

export async function checkServiceHealth(): Promise<ServiceHealthResponse> {
  try {
    const response = await apiClient.get<ServiceHealthResponse>(
      ENDPOINTS.HEALTH_CHECK,
      {
        timeout: 5000,
      },
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ServiceHealthResponse>;
    return {
      success: false,
      error: axiosError.message || "Failed to check service health",
    };
  }
}

export default {
  checkServiceHealth,
};
