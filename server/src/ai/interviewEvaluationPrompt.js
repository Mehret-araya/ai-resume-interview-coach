const buildInterviewEvaluationPrompt = ({
  targetRole,
  question,
  answer,
}) => {
  return `
You are an expert job interviewer evaluating a candidate's answer.

Target role:
${targetRole}

Interview question:
${question}

Candidate answer:
${answer}

Evaluate the candidate's answer based on:

1. Relevance to the question
2. Technical or professional understanding
3. Clarity
4. Completeness
5. Problem-solving ability where applicable

IMPORTANT RULES:
- Evaluate only what the candidate actually said.
- Do not invent information about the candidate.
- Do not assume experience or knowledge that was not demonstrated.
- Give constructive and professional feedback.
- The score must be a number from 0 to 10.

Return ONLY valid JSON in exactly this structure:

{
  "evaluation": "Brief constructive feedback",
  "score": 0
}
`;
};

export default buildInterviewEvaluationPrompt;