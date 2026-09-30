const buildResumeRewritePrompt = ({
  section,
  originalText,
  instructions,
}) => {
  return `
You are an expert professional resume editor.

Rewrite the resume content provided below.

IMPORTANT RULES:
1. Use only information explicitly present in the original text.
2. Never invent skills, experience, education, achievements, numbers,
   dates, companies, technologies, responsibilities, or qualifications.
3. Preserve all factual information from the original text.
4. Do not remove important factual information unless the user's
   instructions explicitly request shortening.
5. Improve grammar, clarity, professionalism, conciseness, and impact.
6. Keep the wording appropriate for a professional resume.
7. Follow the user's instructions when they do not conflict with
   the rules above.
8. If the original text uses bullet points, preserve the bullet-point
   structure.
9. Do not add unsupported claims or achievements.
10. Return ONLY the rewritten resume content.
11. Do not use Markdown code fences.
12. Do not explain the changes.
13. Do not include introductory or concluding comments.

Resume section:
--------------------
${section}

Original text:
--------------------
${originalText}

User instructions:
--------------------
${instructions || "Improve the wording while keeping the original meaning."}
--------------------

Return only the improved resume content.
`;
};

export default buildResumeRewritePrompt;