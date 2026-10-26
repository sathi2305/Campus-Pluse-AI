export const generateSummaryLocal = (title, description) => {
  return `Campus incident report: ${title}. Flagged for departmental priority triage.`;
};

export const generateWithOpenAI = async (title, description, client, model) => {
  return generateSummaryLocal(title, description);
};
