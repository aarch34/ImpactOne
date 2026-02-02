// ✅ Updated Department Structure with hierarchical categories
export const departmentCategories = [
  { id: 'engineering', name: 'Engineering', color: 'hsl(210, 80%, 50%)' },
  { id: 'management', name: 'Management', color: 'hsl(120, 80%, 35%)' },
  { id: 'architecture', name: 'Architecture', color: 'hsl(30, 80%, 50%)' },
];

export const departments: Record<string, { id: string; name: string }[]> = {
  Engineering: [
    { id: 'aiml', name: 'AIML' },
    { id: 'cse', name: 'CSE' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'automation-robotics', name: 'Automation and Robotics' },
    { id: 'mechanical', name: 'Mechanical' },
    { id: 'civil', name: 'Civil' },
    { id: 'data-science', name: 'Data Science' },
    { id: 'cyber-security', name: 'Cyber Security' },
  ],
  Management: [
    { id: 'mba', name: 'MBA' },
    { id: 'bba', name: 'BBA' },
    { id: 'bcom', name: 'BCom' },
    { id: 'other-bachelors', name: "Other Bachelor's Degree" },
  ],
  Architecture: [
    { id: 'architecture', name: 'Architecture' },
  ],
};

// ✅ Updated Venues with CSE Seminar Hall
export const venues = [
  {
    id: 'auditorium',
    name: 'Auditorium',
    capacity: 500,
    facilities: ['projector', 'sound system', 'stage', 'A/C', 'drum kit'],
    imageId: 'auditorium'
  },
  {
    id: 'impact-greens',
    name: 'Impact Greens',
    capacity: 1000,
    facilities: ['kitchen', 'outdoor seating'],
    imageId: 'impact-greens'
  },
  {
    id: 'ramanujan-hall',
    name: 'Ramanujan Hall',
    capacity: 100,
    facilities: ['projector', 'whiteboard', 'sound system'],
    imageId: 'ramanujan-hall'
  },
  {
    id: 'visveswaraya-auditorium',
    name: 'Visveswaraya Auditorium',
    capacity: 300,
    facilities: ['projector', 'sound system', 'A/C', 'stage'],
    imageId: 'visveswaraya-auditorium'
  },
  {
    id: 'cse-seminar-hall',
    name: 'CSE Seminar Hall',
    capacity: 80,
    facilities: ['projector', 'whiteboard', 'A/C', 'smart board'],
    imageId: 'cse-seminar-hall'
  },
];

// ✅ Buses remain same
export const buses = [
  { id: 'bus-1', name: 'Bus 1', capacity: 45, facilities: ['A/C'] },
  { id: 'bus-2', name: 'Bus 2', capacity: 50, facilities: ['A/C', 'charging ports'] },
];

// ✅ Turf areas (optional, for reference)
export const turfAreas = [
  { id: 'football', name: 'Football Area', icon: '⚽' },
  { id: 'badminton', name: 'Badminton Area', icon: '🏸' },
  { id: 'table-tennis', name: 'Table Tennis Area', icon: '🏓' },
];
