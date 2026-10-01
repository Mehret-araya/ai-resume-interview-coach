const buildInterviewQuestionPrompt = ({
  resumeText,
  targetRole,
}) => {
  return `
You are conducting a professional job interview.

TARGET ROLE:
${targetRole}

Generate exactly 5 interview questions for this TARGET ROLE.

IMPORTANT:
The questions must be about the TARGET ROLE only.

For a Software Engineer role, ask ONLY about:
- programming
- software development
- software projects
- databases
- APIs
- debugging
- problem solving
- software engineering practices
- teamwork and software development

Do NOT ask about:
- medicine
- clinical care
- nursing
- healthcare
- maternal health
- patient care
- BEmONC
- CEmONC
- rape
- fistula
- pelvic organ prolapse
- public health
- any unrelated profession or subject.

Generate these 5 types of questions:

1. Software development experience
2. Programming/technical knowledge
3. Database or API knowledge
4. Debugging/problem solving
5. Behavioral/teamwork question for a software engineer

Do not provide answers.
Do not provide explanations.
Return ONLY valid JSON.

Return exactly:

{
  "questions": [
    { "question": "Question 1" },
    { "question": "Question 2" },
    { "question": "Question 3" },
    { "question": "Question 4" },
    { "question": "Question 5" }
  ]
}
`;
};

export default buildInterviewQuestionPrompt;