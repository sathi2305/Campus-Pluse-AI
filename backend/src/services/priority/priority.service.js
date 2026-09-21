export const calculatePriority = ({ severity=5, affectedUsers=1, recurrenceScore=0, urgency='Normal', sentimentScore=-0.3, voteCount=0 }) => {
  // Normalize inputs 0-10
  const sevNorm = Math.min(10, severity) /10;
  let affNorm = Math.min(1, Math.log10(Math.max(1,affectedUsers))/3); // log scale: 1->0, 1000->1
  const recurNorm = Math.min(10, recurrenceScore)/10;
  const urgencyMap = { Low: 2, Medium: 5, High: 8, Normal: 5, Urgent: 8, Critical: 10 };
  const urgNorm = (urgencyMap[urgency]||5)/10;
  const sentNorm = Math.abs(sentimentScore); // 0-1 negative is higher priority, so abs
  // vote boosts affected
  if (voteCount>0) affNorm = Math.min(1, affNorm + Math.log10(voteCount+1)/10);

  const score = Math.round((sevNorm*30 + affNorm*25 + recurNorm*20 + urgNorm*15 + sentNorm*10));
  const clamped = Math.max(0, Math.min(100, score));

  let level='LOW';
  if (clamped>=90) level='CRITICAL';
  else if (clamped>=70) level='HIGH';
  else if (clamped>=40) level='MEDIUM';

  const reasons=[];
  if (sevNorm>=0.7) reasons.push({ reason: `High severity (${severity}/10)`, weight: 30 });
  if (affNorm>=0.5) reasons.push({ reason: `${affectedUsers} students affected`, weight: 25 });
  if (recurNorm>=0.4) reasons.push({ reason: `Repeated ${Math.round(recurrenceScore)} times trend`, weight: 20 });
  if (urgNorm>=0.8) reasons.push({ reason: `${urgency} urgency`, weight: 15 });
  if (sentNorm>=0.5) reasons.push({ reason: `${sentNorm>0.6?'Strong negative':'Negative'} sentiment`, weight: 10 });
  if (voteCount>10) reasons.push({ reason: `${voteCount} votes from community`, weight: 5 });

  if (reasons.length===0) reasons.push({ reason: 'Standard priority based on category and impact', weight: 10 });

  return { score: clamped, level, reasons, breakdown: { severity: sevNorm*30, affected: affNorm*25, recurrence: recurNorm*20, urgency: urgNorm*15, sentiment: sentNorm*10 } };
};
