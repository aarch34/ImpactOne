export const departments = [
  { id: 'eng', name: 'Engineering', color: 'hsl(210, 80%, 50%)' },
  { id: 'arch', name: 'Architecture', color: 'hsl(30, 80%, 50%)' },
  { id: 'mba', name: 'MBA', color: 'hsl(120, 80%, 35%)' },
];

export const venues = [
  { id: 'auditorium', name: 'Auditorium', capacity: 500, facilities: ['projector', 'sound system', 'stage', 'A/C', 'drum kit'], imageId: 'auditorium' },
  { id: 'impact-greens', name: 'Impact Greens', capacity: 1000, facilities: ['kitchen'], imageId: 'impact-greens' },
  { id: 'ramanujan-hall', name: 'Ramanujan Hall', capacity: 100, facilities: ['projector', 'whiteboard', 'sound system'], imageId: 'ramanujan-hall' },
];

export const buses = [
  { id: 'bus-1', name: 'Bus 1', capacity: 45, facilities: ['A/C'] },
  { id: 'bus-2', name: 'Bus 2', capacity: 45, facilities: ['A/C'] },
];

export const bookingHistory = [
  { id: 'B001', resource: 'Auditorium', department: 'Engineering', date: '2024-07-15', status: 'Approved' },
  { id: 'B002', resource: 'Ramanujan Hall', department: 'MBA', date: '2024-07-16', status: 'Approved' },
  { id: 'B003', resource: 'Bus 1', department: 'Architecture', date: '2024-07-18', status: 'Pending' },
  { id: 'B004', resource: 'Impact Greens', department: 'Engineering', date: '2024-07-20', status: 'Rejected' },
  { id: 'B005', resource: 'Auditorium', department: 'MBA', date: '2024-08-01', status: 'Pending' },
  { id: 'B006', resource: 'Bus 2', department: 'Engineering', date: '2024-08-05', status: 'Approved' },
];
