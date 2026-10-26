export const SEED_ISSUES = [
  {
    _id: 'iss-101',
    id: 'iss-101',
    title: 'Severe High-Voltage Short Circuit & Sparking in Panel Board',
    description: 'Active sparking and smell of burning plastic near the ground floor distribution board of Science Block A. Poses severe fire risk to neighboring laboratories.',
    category: 'Electricity',
    urgency: 'High',
    priorityLevel: 'CRITICAL',
    status: 'IN_PROGRESS',
    impact: 'Department',
    affectedUsers: 340,
    votesCount: 42,
    hasVoted: false,
    hasFollowed: true,
    location: {
      building: 'Science & Technology Block A',
      block: 'A',
      room: 'GF-Panel-12',
      coordinates: { lat: 11.0175, lng: 76.9545 }
    },
    images: [
      'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80'
    ],
    reportedBy: {
      _id: 'user-stu-1',
      name: 'Kavitha Raman',
      email: 'kavitha.cs@campuspulse.edu',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    },
    assignedDepartment: {
      id: 'dept-elec',
      name: 'Electrical Engineering & Power'
    },
    aiAnalysis: {
      category: 'Electricity',
      subcategory: 'Power Panel Safety Hazard',
      department: 'Electrical Engineering & Power',
      urgency: 'High',
      severity: 9.6,
      sentiment: 'Negative',
      sentimentScore: -0.85,
      summary: 'Critical electrical fire hazard detected in Block A main distribution board with active sparking.',
      keywords: ['short circuit', 'panel board', 'fire hazard', 'sparking', 'burning plastic'],
      confidence: 0.98,
      slaTargetHours: 2,
      slaDeadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString()
    },
    comments: [
      {
        _id: 'c-1',
        user: { name: 'Er. Senthil Nathan', role: 'CAMPUS_ADMIN', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
        text: 'Emergency team dispatched with breaker tools. Power to GF Wing has been temporarily isolated for safety.',
        createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
      }
    ],
    timeline: [
      { status: 'REPORTED', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), note: 'Incident logged by student' },
      { status: 'TRIAGED', timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(), note: 'Gemini AI flagged as CRITICAL severity 9.6' },
      { status: 'IN_PROGRESS', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), note: 'Assigned to Electrical Engineering Rapid Response' }
    ],
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    _id: 'iss-102',
    id: 'iss-102',
    title: 'Burst Main Supply Pipe Flooding Boys Hostel Ground Corridor',
    description: 'High-pressure water line fractured near Washroom 102. Water is leaking into the hallway and approaching student dorm rooms.',
    category: 'Water',
    urgency: 'High',
    priorityLevel: 'CRITICAL',
    status: 'ASSIGNED',
    impact: 'Hostel block',
    affectedUsers: 220,
    votesCount: 38,
    hasVoted: true,
    hasFollowed: true,
    location: {
      building: 'Boys Hostel Block 1',
      block: 'East Wing',
      room: 'Corridor 102',
      coordinates: { lat: 11.0152, lng: 76.9535 }
    },
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80'
    ],
    reportedBy: {
      _id: 'user-stu-2',
      name: 'Aditya Verma',
      email: 'aditya.mech@campuspulse.edu',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    assignedDepartment: {
      id: 'dept-water',
      name: 'Plumbing & Water Sanitation'
    },
    aiAnalysis: {
      category: 'Water',
      subcategory: 'Corridor Flooding Leak',
      department: 'Plumbing & Water Sanitation',
      urgency: 'High',
      severity: 8.9,
      sentiment: 'Negative',
      sentimentScore: -0.72,
      summary: 'Severe water pipe breach flooding Boys Hostel Ground Floor requires immediate valve cutoff.',
      keywords: ['pipe burst', 'flooding', 'hostel', 'water supply', 'corridor'],
      confidence: 0.95,
      slaTargetHours: 3,
      slaDeadline: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString()
    },
    comments: [
      {
        _id: 'c-2',
        user: { name: 'Prof. Anitha Raj', role: 'DEPARTMENT_ADMIN', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
        text: 'Hostel warden notified. Ground floor sump valve is being closed right now.',
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
      }
    ],
    timeline: [
      { status: 'REPORTED', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), note: 'Reported with GPS tag' },
      { status: 'ASSIGNED', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), note: 'Assigned to Plumbing & Water Sanitation team' }
    ],
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    _id: 'iss-103',
    id: 'iss-103',
    title: 'Core Wi-Fi Gateway Offline in Central Digital Library 2nd Floor',
    description: 'Aruba access points showing solid red. Over 150 students preparing for mid-terms cannot access IEEE journals or university portal.',
    category: 'Internet',
    urgency: 'Medium',
    priorityLevel: 'HIGH',
    status: 'IN_PROGRESS',
    impact: 'Department',
    affectedUsers: 180,
    votesCount: 29,
    hasVoted: false,
    hasFollowed: false,
    location: {
      building: 'Central Digital Library',
      block: 'Level 2',
      room: 'Quiet Study Hall B',
      coordinates: { lat: 11.0168, lng: 76.9565 }
    },
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
    ],
    reportedBy: {
      _id: 'user-stu-3',
      name: 'Sneha Patel',
      email: 'sneha.patel@campuspulse.edu',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    assignedDepartment: {
      id: 'dept-it',
      name: 'IT Infrastructure & Networking'
    },
    aiAnalysis: {
      category: 'Internet',
      subcategory: 'Wi-Fi AP Outage',
      department: 'IT Infrastructure & Networking',
      urgency: 'Medium',
      severity: 7.2,
      sentiment: 'Negative',
      sentimentScore: -0.45,
      summary: 'Central Library Floor 2 Wi-Fi gateway down affecting academic exam prep.',
      keywords: ['wifi', 'access point', 'library', 'network failure', 'gateway offline'],
      confidence: 0.94,
      slaTargetHours: 4,
      slaDeadline: new Date(Date.now() + 3.2 * 3600 * 1000).toISOString()
    },
    comments: [],
    timeline: [
      { status: 'REPORTED', timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), note: 'Logged by Sneha Patel' },
      { status: 'IN_PROGRESS', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), note: 'Network switch reboot initiated remotely' }
    ],
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    _id: 'iss-104',
    id: 'iss-104',
    title: 'Food Warmer Temperature Sensor Fault in Main Cafeteria',
    description: 'Hot food serving counter #3 is failing to maintain regulation temperature (measuring 42°C instead of required 65°C). Food safety compliance risk.',
    category: 'Food',
    urgency: 'Medium',
    priorityLevel: 'HIGH',
    status: 'REPORTED',
    impact: 'Multiple departments',
    affectedUsers: 400,
    votesCount: 19,
    hasVoted: false,
    hasFollowed: true,
    location: {
      building: 'Main Food Court & Cafeteria',
      block: 'North Hall',
      room: 'Counter 3',
      coordinates: { lat: 11.0182, lng: 76.9572 }
    },
    images: [],
    reportedBy: {
      _id: 'user-stu-4',
      name: 'Rahul Mukherji',
      email: 'rahul.m@campuspulse.edu',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    assignedDepartment: {
      id: 'dept-food',
      name: 'Campus Food Safety & Canteen'
    },
    aiAnalysis: {
      category: 'Food',
      subcategory: 'Canteen Equipment / Safety',
      department: 'Campus Food Safety & Canteen',
      urgency: 'Medium',
      severity: 7.5,
      sentiment: 'Negative',
      sentimentScore: -0.6,
      summary: 'Food warmer temperature regulation fault posing potential food hygiene risk.',
      keywords: ['cafeteria', 'food warmer', 'temperature', 'safety compliance', 'hygiene'],
      confidence: 0.91,
      slaTargetHours: 4,
      slaDeadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString()
    },
    comments: [],
    timeline: [
      { status: 'REPORTED', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), note: 'Incident submitted' }
    ],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    _id: 'iss-105',
    id: 'iss-105',
    title: 'Pathway Lighting Inoperative Between Emerald Hostel and Sports Complex',
    description: 'Three consecutive solar LED poles on the southern perimeter walkway are completely dark after sunset. Safety hazard for students returning late from labs.',
    category: 'Security',
    urgency: 'Medium',
    priorityLevel: 'HIGH',
    status: 'TRIAGED',
    impact: 'Hostel block',
    affectedUsers: 150,
    votesCount: 24,
    hasVoted: false,
    hasFollowed: false,
    location: {
      building: 'Girls Hostel Block Emerald',
      block: 'South Walkway',
      room: 'Pole P-14 through P-16',
      coordinates: { lat: 11.0142, lng: 76.9575 }
    },
    images: [],
    reportedBy: {
      _id: 'user-stu-5',
      name: 'Deepa Krishnan',
      email: 'deepa.k@campuspulse.edu',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
    },
    assignedDepartment: {
      id: 'dept-sec',
      name: 'Campus Security & Emergency Response'
    },
    aiAnalysis: {
      category: 'Security',
      subcategory: 'Perimeter Night Lighting',
      department: 'Campus Security & Emergency Response',
      urgency: 'Medium',
      severity: 7.8,
      sentiment: 'Negative',
      sentimentScore: -0.55,
      summary: 'Perimeter lights out between Girls Hostel and Sports Arena creating night safety concern.',
      keywords: ['walkway lighting', 'security hazard', 'night path', 'girls hostel', 'led outage'],
      confidence: 0.93,
      slaTargetHours: 6,
      slaDeadline: new Date(Date.now() + 5 * 3600 * 1000).toISOString()
    },
    comments: [],
    timeline: [
      { status: 'REPORTED', timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(), note: 'Reported by Deepa Krishnan' },
      { status: 'TRIAGED', timestamp: new Date(Date.now() - 160 * 60 * 1000).toISOString(), note: 'AI routed to Security & Electrical' }
    ],
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 160 * 60 * 1000).toISOString()
  },
  {
    _id: 'iss-106',
    id: 'iss-106',
    title: 'HVAC Air Conditioning Condenser Replaced & Fully Calibrated',
    description: 'Chilled water unit in Biotech Seminar Hall 3 was malfunctioning and causing 34°C room temperature during conferences. Condenser coils replaced and temperature stabilized at 21°C.',
    category: 'Infrastructure',
    urgency: 'Low',
    priorityLevel: 'LOW',
    status: 'RESOLVED',
    impact: 'Department',
    affectedUsers: 95,
    votesCount: 31,
    hasVoted: false,
    hasFollowed: false,
    location: {
      building: 'BioTech Research Center',
      block: '3rd Floor',
      room: 'Seminar Hall 3',
      coordinates: { lat: 11.0185, lng: 76.9538 }
    },
    images: [],
    reportedBy: {
      _id: 'user-stu-6',
      name: 'Tarun Saxena',
      email: 'tarun.bt@campuspulse.edu',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80'
    },
    assignedDepartment: {
      id: 'dept-maint',
      name: 'Civil Infrastructure & Maintenance'
    },
    aiAnalysis: {
      category: 'Infrastructure',
      subcategory: 'HVAC Climate Control',
      department: 'Civil Infrastructure & Maintenance',
      urgency: 'Low',
      severity: 4.2,
      sentiment: 'Positive',
      sentimentScore: 0.7,
      summary: 'AC refrigeration repaired and temperature restored to 21°C.',
      keywords: ['ac cooling', 'biotech hall', 'condenser replacement', 'repaired'],
      confidence: 0.99,
      slaTargetHours: 24,
      slaDeadline: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    comments: [
      {
        _id: 'c-3',
        user: { name: 'Er. Prakash S.', role: 'CAMPUS_ADMIN', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80' },
        text: 'Condenser replaced under warranty. Temperature telemetry verified at 21°C.',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
      }
    ],
    timeline: [
      { status: 'REPORTED', timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(), note: 'Reported' },
      { status: 'IN_PROGRESS', timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), note: 'Technicians on site' },
      { status: 'RESOLVED', timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), note: 'Completed and signed off' }
    ],
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  }
];

export const DEMO_USERS = {
  student: {
    id: 'user-stu-demo',
    name: 'Saravanan S. (Student)',
    email: 'student@campuspulse.demo',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    studentId: '2026-CS-412',
    phone: '+91 98401 23456',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    stats: { reported: 4, upvoted: 12, resolved: 3 }
  },
  departmentAdmin: {
    id: 'user-dept-admin-demo',
    name: 'Er. Senthil Nathan (Dept Admin)',
    email: 'dept@campuspulse.demo',
    role: 'DEPARTMENT_ADMIN',
    department: 'Electrical Engineering & Power',
    employeeId: 'FAC-ELEC-08',
    phone: '+91 98402 34567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    stats: { assigned: 8, resolvedToday: 3, pendingSLA: 2 }
  },
  campusAdmin: {
    id: 'user-admin-demo',
    name: 'Dr. Ramesh Kumar (Campus Admin)',
    email: 'admin@campuspulse.demo',
    role: 'CAMPUS_ADMIN',
    department: 'Central Campus Administration',
    employeeId: 'ADM-EXEC-01',
    phone: '+91 98403 45678',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    stats: { totalCampusIssues: 46, systemHealthScore: 94, slaCompliance: 92.4 }
  }
};
