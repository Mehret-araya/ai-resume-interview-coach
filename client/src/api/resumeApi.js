import apiClient from "./apiClient.js";

export const uploadResume = async (file, token) => {
  const formData = new FormData();

  formData.append("resume", file);

  const response = await apiClient.post(
    "/resumes/upload",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getMyResumes = async (token) => {
  const response = await apiClient.get("/resumes", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const analyzeResume = async (resumeId, token) => {
  const response = await apiClient.post(
    `/resumes/${resumeId}/analyze`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

