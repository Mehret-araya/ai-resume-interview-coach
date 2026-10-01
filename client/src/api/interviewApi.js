import apiClient from "./apiClient.js";

export const startInterview = async (
  resumeId,
  targetRole,
  token
) => {
  const response = await apiClient.post(
    "/interviews/start",
    {
      resumeId,
      targetRole,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const submitInterviewAnswer = async (
  interviewId,
  answer,
  token
) => {
  const response = await apiClient.post(
    `/interviews/${interviewId}/answer`,
    {
      answer,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};