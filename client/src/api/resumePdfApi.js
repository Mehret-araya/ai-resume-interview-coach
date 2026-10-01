import apiClient from "./apiClient.js";

export const downloadResumePdf = async (
  resumeId,
  token
) => {
  const response = await apiClient.get(
    `/resumes/${resumeId}/pdf`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );

  return response.data;
};