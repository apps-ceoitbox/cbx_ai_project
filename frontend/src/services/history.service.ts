import { useAxios } from "@/context/AppContext";

// Types for Zoomary history
export interface ZoomaryHistoryItem {
  _id: string;
  userId: string;
  title: string;
  summary: string;
  name?: string;
  email?: string;
  meetingDate?: Date;
  recordingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types for Resume Analyzer history
export interface ResumeHistoryItem {
  _id: string;
  userId: string;
  title: string;
  content: string;
  candidateName: string;
  jobTitle: string;
  matchScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types for Company Profile history
export interface CompanyProfileHistoryItem {
  _id: string;
  userId: string;
  companyName: string;
  report: string;
  sourcedFrom?: string;
  name?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types for Mail Sender history
export interface MailSenderHistoryItem {
  _id: string;
  userId: string;
  recipient: string;
  subject: string;
  message: string;
  response: string;
  name?: string; // Add name field
  email?: string; // Add email field
  createdAt: Date;
  updatedAt: Date;
}

// Zoomary History using Backend API
export const getZoomaryHistory = async (): Promise<ZoomaryHistoryItem[]> => {
  const axios = useAxios("user");
  try {
    const response = await axios.get("/history/zoomary");
    if (response.status >= 200 && response.status < 300) {
      const history: ZoomaryHistoryItem[] = response.data.data;
      return history;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching Zoomary history from backend:", error);
    return [];
  }
};

// Admin: Get all Zoomary history across all users
export const getAllZoomaryHistory = async (): Promise<ZoomaryHistoryItem[]> => {
  const axios = useAxios("admin");
  try {
    const response = await axios.get("/history/admin/zoomary");
    if (response.status >= 200 && response.status < 300) {
      const history: ZoomaryHistoryItem[] = response.data.data;
      return history;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching all Zoomary history from backend:", error);
    return [];
  }
};

export const deleteZoomaryHistoryItem = async (
  id: string
): Promise<boolean> => {
  const axios = useAxios("user");
  try {
    const response = await axios.delete(`/history/zoomary/${id}`);
    if (response.status >= 200 && response.status < 300) {
      return true;
    } else {
      console.error(
        `Error deleting Zoomary history item ${id}:`,
        response.status,
        response.data
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Error calling delete API for Zoomary history item ${id}:`,
      error
    );
    return false;
  }
};

export const saveZoomaryHistory = async (data: {
  title: string;
  summary: string;
  meetingDate?: Date;
  recordingLink?: string;
}): Promise<ZoomaryHistoryItem | null> => {
  const axios = useAxios("user");
  try {
    const response = await axios.post("/history/zoomary", { ...data });

    if (response.status >= 200 && response.status < 300) {
      const newItem: ZoomaryHistoryItem = response.data.data;
      return newItem;
    } else {
      console.error(
        "Error saving Zoomary history to backend:",
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
      "Error saving Zoomary history to backend (catch block):",
      error
    );

    return null;
  }
};

export const clearZoomaryHistory = async (): Promise<boolean> => {
  try {
    // localStorage.removeItem('zoomaryHistory'); // Remove if you want to keep client-side clear as fallback
    return true;
  } catch (error) {
    console.error("Error clearing Zoomary history:", error);
    return false;
  }
};

export const clearResumeHistory = () => {
  try {
    localStorage.removeItem("resumeHistory");
    return { success: true };
  } catch (error) {
    console.error("Error clearing Resume history from localStorage:", error);
    throw error;
  }
};

export const clearCompanyProfileHistory = async (): Promise<boolean> => {
  try {
    console.log("Attempting to clear Company Profile history...");
    return true;
  } catch (error) {
    console.error("Error clearing Company Profile history:", error);
    return false;
  }
};

export const deleteCompanyProfileHistoryItem = async (
  id: string
): Promise<boolean> => {
  const axios = useAxios("user");
  try {
    const response = await axios.delete(`/history/company-profile/${id}`);
    if (response.status >= 200 && response.status < 300) {
      return true;
    } else {
      console.error(
        `Error deleting Company Profile history item ${id}:`,
        response.status,
        response.data
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Error calling delete API for Company Profile history item ${id}:`,
      error
    );
    return false;
  }
};

export const clearMailSenderHistory = async (): Promise<boolean> => {
  const axios = useAxios("user");
  try {
    const response = await axios.delete("/history/mail-sender");
    if (response.status >= 200 && response.status < 300) {
      console.log("Mail Sender history cleared successfully from backend.");
      return true;
    } else {
      console.error(
        "Error clearing Mail Sender history:",
        response.status,
        response.data
      );
      return false;
    }
  } catch (error) {
    console.error("Error clearing Mail Sender history:", error);
    return false;
  }
};

// Company Profile History using Backend API
export const getCompanyProfileHistory = async (): Promise<
  CompanyProfileHistoryItem[]
> => {
  const axios = useAxios("user");
  try {
    const response = await axios.get("/history/company-profile");

    if (response.status >= 200 && response.status < 300) {
      const history: CompanyProfileHistoryItem[] = response.data.data;
      return history;
    } else {
      // Handle non-successful statuses if needed, or let Axios's default error handling catch it
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error(
      "Error fetching Company Profile history from backend:",
      error
    );
    return [];
  }
};

// Admin: Get all Company Profile history across all users
export const getAllCompanyProfileHistory = async (): Promise<
  CompanyProfileHistoryItem[]
> => {
  const axios = useAxios("admin");
  try {
    const response = await axios.get("/history/admin/company-profile");
    if (response.status >= 200 && response.status < 300) {
      const history: CompanyProfileHistoryItem[] = response.data.data;
      return history;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error(
      "Error fetching all Company Profile history from backend:",
      error
    );
    return [];
  }
};

export const saveMailSenderHistory = async (data: {
  recipient: string;
  subject: string;
  message: string;
  response: string;
}): Promise<MailSenderHistoryItem | null> => {
  const axios = useAxios("user");
  try {
    const response = await axios.post("/history/mail-sender", data);

    if (response.status >= 200 && response.status < 300) {
      const newItem: MailSenderHistoryItem = response.data.data;
      return newItem;
    } else {
      console.error(
        "Error saving Mail Sender history to backend:",
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
      "Error saving Mail Sender history to backend (catch block):",
      error
    );
    return null;
  }
};

export const saveCompanyProfileHistory = async (data: {
  companyName: string;
  report: string;
  sourcedFrom?: string;
}): Promise<CompanyProfileHistoryItem | null> => {
  const axios = useAxios("user");
  try {
    const response = await axios.post("/history/company-profile", data);

    if (response.status >= 200 && response.status < 300) {
      const newItem: CompanyProfileHistoryItem = response.data.data;
      return newItem;
    } else {
      console.error(
        "Error saving company profile history to backend:",
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
      "Error saving company profile history to backend (catch block):",
      error
    );
    return null;
  }
};

// Resume Analyzer History using localStorage
export const getResumeHistory = async () => {
  try {
    const historyJson = localStorage.getItem("resumeHistory");
    const history = historyJson ? JSON.parse(historyJson) : [];

    console.log("Resume history from localStorage:", history);
    return history;
  } catch (error) {
    console.error("Error fetching Resume history from localStorage:", error);
    return [];
  }
};

export const getResumeHistoryItem = async (id: string) => {
  try {
    const historyJson = localStorage.getItem("resumeHistory");
    const history = historyJson ? JSON.parse(historyJson) : [];

    // Find the item by id
    const item = history.find((item: ResumeHistoryItem) => item._id === id);

    if (!item) {
      throw new Error(`Resume history item with id ${id} not found`);
    }

    console.log("Resume history item from localStorage:", item);
    return item;
  } catch (error) {
    console.error(
      "Error fetching Resume history item from localStorage:",
      error
    );
    throw error;
  }
};

export const deleteResumeHistoryItem = async (id: string) => {
  try {
    const historyJson = localStorage.getItem("resumeHistory");
    const history = historyJson ? JSON.parse(historyJson) : [];

    // Filter out the item to delete
    const updatedHistory = history.filter(
      (item: ResumeHistoryItem) => item._id !== id
    );

    // Save back to localStorage
    localStorage.setItem("resumeHistory", JSON.stringify(updatedHistory));

    console.log("Resume history item deleted from localStorage");
    return true;
  } catch (error) {
    console.error(
      "Error deleting Resume history item from localStorage:",
      error
    );
    throw error;
  }
};

export const saveResumeHistory = async (data: {
  title: string;
  content: string;
  candidateName: string;
  jobTitle: string;
  matchScore: number;
}) => {
  try {
    const historyJson = localStorage.getItem("resumeHistory");
    const history = historyJson ? JSON.parse(historyJson) : [];

    // Check if there's an exact match for this content
    const exactDuplicate = history.findIndex(
      (item) => item.content === data.content
    );

    // If this is an exact duplicate, update the existing item instead of creating a new one
    if (exactDuplicate !== -1) {
      console.log("Found exact duplicate content, updating existing item");

      const updatedItem = {
        ...history[exactDuplicate],
        updatedAt: new Date(),
      };

      // Remove the existing item and add the updated one to the top
      history.splice(exactDuplicate, 1);
      history.unshift(updatedItem);

      // Save back to localStorage
      localStorage.setItem("resumeHistory", JSON.stringify(history));

      console.log("Resume history updated in localStorage:", updatedItem);
      return updatedItem;
    }

    // Create new item with unique ID and timestamps
    const newItem: ResumeHistoryItem = {
      _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: "local_user",
      title: data.title,
      content: data.content,
      candidateName: data.candidateName,
      jobTitle: data.jobTitle,
      matchScore: data.matchScore,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to history array
    history.unshift(newItem);

    // Keep only the last 20 items to prevent localStorage from getting too large
    const trimmedHistory = history.slice(0, 20);

    // Save back to localStorage
    localStorage.setItem("resumeHistory", JSON.stringify(trimmedHistory));

    console.log("Resume history saved to localStorage:", newItem);
    return newItem;
  } catch (error) {
    console.error("Error saving Resume history to localStorage:", error);
    throw error;
  }
};

// Mail Sender History using Backend API
export const getMailSenderHistory = async (): Promise<
  MailSenderHistoryItem[]
> => {
  const axios = useAxios("user");
  try {
    const response = await axios.get("/history/mail-sender");
    if (response.status >= 200 && response.status < 300) {
      const history: MailSenderHistoryItem[] = response.data.data;
      return history;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching Mail Sender history from backend:", error);
    return [];
  }
};

// Admin: Get all Mail Sender history across all users
export const getAllMailSenderHistory = async (): Promise<
  MailSenderHistoryItem[]
> => {
  // Explicitly use admin token for this endpoint
  const axios = useAxios("admin");
  try {
    const response = await axios.get("/history/admin/mail-sender");
    if (response.status >= 200 && response.status < 300) {
      const history: MailSenderHistoryItem[] = response.data.data;
      return history;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error(
      "Error fetching all Mail Sender history from backend:",
      error
    );
    return [];
  }
};

export const deleteMailSenderHistoryItem = async (
  id: string
): Promise<boolean> => {
  const axios = useAxios("user");
  try {
    const response = await axios.delete(`/history/mail-sender/${id}`);
    if (response.status >= 200 && response.status < 300) {
      console.log(
        `Mail Sender history item ${id} deleted successfully from backend.`
      );
      return true;
    } else {
      console.error(
        `Error deleting Mail Sender history item ${id}:`,
        response.status,
        response.data
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Error calling delete API for Mail Sender history item ${id}:`,
      error
    );
    return false;
  }
};
