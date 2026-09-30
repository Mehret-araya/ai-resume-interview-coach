const buildResumeAnalysisPrompt = (resumeText) => {
  return `
Analyze the resume below.

RULES:
- Use only facts explicitly present in the resume.
- Never invent skills, experience, qualifications, achievements, dates, employers, or certifications.
- Extract skills from the resume's competencies, experience, education, training, certifications, and tools.
- Base strengths on evidence from the resume.
- Give practical improvement suggestions.
- Do not mark a section missing if it is present.
- Do not invent numerical achievements.
- Return ONLY valid JSON.
- Do not use Markdown or code fences.
- Return the complete JSON object, including the final closing brace.

Return exactly this structure:

{
  "summary": "2-3 sentence summary",
  "skills": ["skill supported by resume"],
  "strengths": ["strength supported by resume"],
  "improvementAreas": ["practical improvement"],
  "experienceObservations": ["observation supported by resume"],
  "educationObservations": ["observation supported by resume"],
  "missingSections": ["section that is actually missing"],
  "atsSuggestions": ["practical ATS suggestion"]
}

RESUME:
--------------------
${resumeText}
--------------------

Return the complete JSON object now.
`;
};

export default buildResumeAnalysisPrompt;