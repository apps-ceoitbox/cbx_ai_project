import { useAxios } from "@/context/AppContext";

// Types for Report Agent history
export interface ReportHistoryItem {
  _id: string;
  userId: string;
  fileName: string;
  fileType: string;
  report: string;
  name?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Report History using Backend API
export const getReportHistory = async (): Promise<ReportHistoryItem[]> => {
  const axios = useAxios("user");
  try {
    const response = await axios.get("/history/report");
    if (response.status >= 200 && response.status < 300) {
      const history: ReportHistoryItem[] = response.data.data;
      return history;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching Report history from backend:", error);
    return [];
  }
};

// Get a specific Report history item
export const getReportHistoryItem = async (
  id: string
): Promise<ReportHistoryItem | null> => {
  const axios = useAxios("user");
  try {
    const response = await axios.get(`/history/report/${id}`);
    if (response.status >= 200 && response.status < 300) {
      const historyItem: ReportHistoryItem = response.data.data;
      return historyItem;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error fetching Report history item ${id}:`, error);
    return null;
  }
};

// Admin: Get all Report history across all users
export const getAllReportHistory = async (): Promise<ReportHistoryItem[]> => {
  const axios = useAxios("admin");
  try {
    const response = await axios.get("/history/admin/report");
    if (response.status >= 200 && response.status < 300) {
      const history: ReportHistoryItem[] = response.data.data;
      return history;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching all Report history from backend:", error);
    return [];
  }
};

export const saveReportHistory = async (data: {
  fileName: string;
  fileType: string;
  report: string;
}): Promise<ReportHistoryItem | null> => {
  const axios = useAxios("user");
  try {
    const response = await axios.post("/history/report", { ...data });

    if (response.status >= 200 && response.status < 300) {
      const newItem: ReportHistoryItem = response.data.data;
      return newItem;
    } else {
      console.error(
        "Error saving Report history to backend:",
        response.status,
        response.data
      );
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          response.data?.message || "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error(
      "Error saving Report history to backend (catch block):",
      error
    );

    return null;
  }
};

export const clearReportHistory = async (): Promise<boolean> => {
  const axios = useAxios("user");
  try {
    const response = await axios.delete("/history/report");
    if (response.status >= 200 && response.status < 300) {
      return true;
    } else {
      console.error(
        "Error clearing Report history:",
        response.status,
        response.data
      );
      return false;
    }
  } catch (error) {
    console.error("Error clearing Report history:", error);
    return false;
  }
};
