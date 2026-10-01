const buildInterviewFinalReportPrompt = ({
  targetRole,
  questions,
}) => {
  const interviewData = questions
    .map(
      (item, index) => `
Question ${index + 1}:
${item.question}

Candidate Answer:
${item.answer}

Evaluation:
${item.evaluation}

Score:
${item.score}/10
`
    )
    .join("\n");

  return `
You are an expert interview coach.

Create a final interview performance report for a candidate
applying for this role:

Target role:
${targetRole}

Interview results:
--------------------
${interviewData}
--------------------

Provide a concise and constructive report.

The report must include:

1. Overall performance
2. Key strengths
3. Areas for improvement
4. Technical performance
5. Communication performance
6. Practical recommendations for future interviews

IMPORTANT RULES:
- Use only information contained in the interview results.
- Do not invent candidate experience or skills.
- Do not make unsupported claims.
- Keep the feedback professional and constructive.
- Return ONLY valid JSON.

Return exactly:

{
  "overallPerformance": "Overall assessment",
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "areasForImprovement": [
    "Improvement 1",
    "Improvement 2"
  ],
  "technicalPerformance": "Technical assessment",
  "communicationPerformance": "Communication assessment",
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}
`;
};

export default buildInterviewFinalReportPrompt;