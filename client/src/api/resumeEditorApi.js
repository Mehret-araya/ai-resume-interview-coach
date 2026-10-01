import apiClient from "./apiClient.js";

export const saveResumeEditor = async (
  resumeId,
  content,
  token
) => {
  const response = await apiClient.post(
    `/resumes/${resumeId}/editor`,
    {
      content,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getResumeEditor = async (
  resumeId,
  token
) => {
  const response = await apiClient.get(
    `/resumes/${resumeId}/editor`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteResumeEditor = async (
  resumeId,
  token
) => {
  const response = await apiClient.delete(
    `/resumes/${resumeId}/editor`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};