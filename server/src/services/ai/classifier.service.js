const CATEGORY_KEYWORDS = {
  Water: ['water','pipeline','tap','leak','supply','tank','drinking','borewell','plumbing','shortage'],
  Electricity: ['electricity','power','light','fan','current','outage','voltage','wiring','switch','bulb','electric'],
  Internet: ['wifi','internet','router','network','connectivity','bandwidth','signal','lan','hotspot','speed'],
  Hostel: ['hostel','room','dorm','block','warden','accommodation','bed','mess','hosteller'],
  Transport: ['bus','transport','driver','vehicle','shuttle','commute','pickup','drop','route'],
  Food: ['food','canteen','mess','meal','cafeteria','kitchen','hygiene','taste','lunch','dinner','breakfast'],
  Security: ['security','theft','guard','gate','cctv','unsafe','harassment','intruder','lock'],
  Cleanliness: ['clean','dirty','garbage','dust','sweep','washroom','toilet','smell','hygiene','trash'],
  Infrastructure: ['building','infrastructure','crack','ceiling','wall','floor','lift','elevator','construction','drainage'],
  Academic: ['classroom','academic','lecture','faculty','teaching','bench','projector','board','timetable'],
  Laboratory: ['lab','laboratory','equipment','chemical','experiment','apparatus','pc','computer lab'],
  Library: ['library','book','journal','reading','librarian','borrow','return'],
  Administration: ['admin','administration','office','fee','certificate','admission','scholarship','staff','document'],
  Other: []
};

const SUBCATEGORIES = {
  Water: ['Supply Disruption','Low Pressure','Leakage','Contamination','No Water'],
  Electricity: ['Power Outage','Fluctuation','Equipment Failure','Wiring Issue'],
  Internet: ['No Connectivity','Slow Speed','Frequent Disconnection','Router Issue'],
  Hostel: ['Room Maintenance','Water Issue','Electricity Issue','Cleanliness'],
  Transport: ['Delay','Overcrowding','Route Issue','Driver Behavior'],
  Food: ['Quality Issue','Hygiene','Shortage','Pricing'],
  Security: ['Theft','Safety Concern','Access Control'],
  Cleanliness: ['Washroom','Garbage','Classroom Cleaning'],
  Infrastructure: ['Structural','Plumbing','Electrical Infra','Lift'],
  Academic: ['Classroom Facilities','Teaching Aid','Seating'],
  Laboratory: ['Equipment Failure','Maintenance','Safety'],
  Library: ['Book Availability','Facility','Timing'],
  Administration: ['Process Delay','Staff Behavior','Documentation'],
  Other: ['General']
};

const DEPT_MAP = {
  Water: 'Hostel Maintenance',
  Electricity: 'Electrical',
  Internet: 'IT',
  Hostel: 'Hostel',
  Transport: 'Transport',
  Food: 'Food Services',
  Security: 'Security',
  Cleanliness: 'Maintenance',
  Infrastructure: 'Maintenance',
  Academic: 'Academic',
  Laboratory: 'Laboratory',
  Library: 'Library',
  Administration: 'Administration',
  Other: 'Administration'
};

export const classifyLocal = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  let bestCategory = 'Other';
  let maxScore = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) if (text.includes(kw)) score++;
    if (score > maxScore) { maxScore = score; bestCategory = cat; }
  }
  // subcategory: pick first that matches keyword or default first
  const subs = SUBCATEGORIES[bestCategory] || ['General'];
  let sub = subs[0];
  // simple heuristic: if text contains leak -> leakage
  const lowerSubs = subs.map(s=>s.toLowerCase());
  for (let i=0;i<lowerSubs.length;i++) {
    const words = lowerSubs[i].split(' ');
    if (words.some(w=> text.includes(w))) { sub = subs[i]; break; }
  }

  // Derive urgency: Low, Medium, High
  let urgency = 'Medium';
  if (
    text.includes('outage') ||
    text.includes('emergency') ||
    text.includes('hazard') ||
    text.includes('critical') ||
    text.includes('no water') ||
    text.includes('no internet') ||
    text.includes('stale') ||
    text.includes('fire') ||
    text.includes('danger') ||
    text.includes('burst') ||
    text.includes('overflow')
  ) {
    urgency = 'High';
  } else if (
    text.includes('slow') ||
    text.includes('minor') ||
    text.includes('low pressure') ||
    text.includes('suggestion') ||
    text.includes('routine') ||
    text.includes('dust')
  ) {
    urgency = 'Low';
  }

  return { category: bestCategory, subcategory: sub, department: DEPT_MAP[bestCategory], urgency, confidence: maxScore > 0 ? Math.min(0.95, 0.5 + maxScore*0.1) : 0.4 };
};

export const classifyWithOpenAI = async (title, description, openaiClient, model) => {
  try {
    const prompt = `Classify this campus issue. Categories: Water, Electricity, Internet, Hostel, Transport, Food, Security, Cleanliness, Infrastructure, Academic, Laboratory, Library, Administration, Other.
Title: ${title}
Description: ${description}
Return JSON with category, subcategory, department (IT, Hostel Maintenance, Electrical, Maintenance, Transport, Food Services, Security, Academic, Laboratory, Library, Administration), urgency ('Low', 'Medium', 'High'), confidence 0-1.`;
    const res = await openaiClient.chat.completions.create({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });
    const parsed = JSON.parse(res.choices[0].message.content);
    let urgency = 'Medium';
    if (parsed.urgency) {
      const u = String(parsed.urgency).toLowerCase();
      if (u.includes('high') || u.includes('critical') || u.includes('urgent')) urgency = 'High';
      else if (u.includes('low')) urgency = 'Low';
    }
    return { category: parsed.category || 'Other', subcategory: parsed.subcategory || 'General', department: parsed.department || 'Administration', urgency, confidence: parsed.confidence || 0.8 };
  } catch (e) {
    return classifyLocal(title, description);
  }
};
