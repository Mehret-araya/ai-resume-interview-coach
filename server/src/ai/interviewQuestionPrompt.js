const buildInterviewQuestionPrompt = ({
  resumeText,
  targetRole,
}) => {
  return `
You are an expert technical interviewer.

Generate exactly 5 interview questions for the candidate described below.

Target role:
${targetRole}

Candidate resume:
--------------------
${resumeText}
--------------------

IMPORTANT RULES:
1. Generate exactly 5 questions.
2. Base the questions on the candidate's actual resume.
3. Tailor the questions to the target role.
4. Do not assume skills, technologies, experience, education, or achievements that are not present in the resume.
5. Include a mixture of:
   - experience-based questions
   - technical questions
   - problem-solving questions
   - behavioral questions
6. Questions should be appropriate for a real job interview.
7. Questions should allow the candidate to explain their own experience.
8. Do not provide answers.
9. Do not provide explanations.
10. Return ONLY valid JSON.

Return the JSON in exactly this structure:

{
  "questions": [
    {
      "question": "Question 1"
    },
    {
      "question": "Question 2"
    },
    {
      "question": "Question 3"
    },
    {
      "question": "Question 4"
    },
    {
      "question": "Question 5"
    }
  ]
}
`;
};

export default buildInterviewQuestionPrompt;