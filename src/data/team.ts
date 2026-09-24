import type { City, TeamMember } from '@/types';

export const TEAM: TeamMember[] = [
  { id: 'tm-00', name: 'Demo Admin', role: 'Owner', email: 'admin@yanamotors.example', active: true },
  { id: 'tm-01', name: 'Aarav Mehta', role: 'Sales Head', email: 'aarav.mehta@yanamotors.example', city: 'Mumbai', active: true },
  { id: 'tm-02', name: 'Neha Kulkarni', role: 'Sales Executive', email: 'neha.kulkarni@yanamotors.example', city: 'Pune', active: true },
  { id: 'tm-03', name: 'Rohan Deshmukh', role: 'Sales Executive', email: 'rohan.deshmukh@yanamotors.example', city: 'Ahmedabad', active: true },
  { id: 'tm-04', name: 'Priya Nair', role: 'Sales Executive', email: 'priya.nair@yanamotors.example', city: 'Bengaluru', active: true },
  { id: 'tm-05', name: 'Imran Sheikh', role: 'Sales Executive', email: 'imran.sheikh@yanamotors.example', city: 'Delhi', active: true },
  { id: 'tm-06', name: 'Kavita Reddy', role: 'Sales Executive', email: 'kavita.reddy@yanamotors.example', city: 'Hyderabad', active: true },
  { id: 'tm-07', name: 'Sneha Patil', role: 'Support Agent', email: 'sneha.patil@yanamotors.example', active: true },
  { id: 'tm-08', name: 'Arjun Iyer', role: 'Support Agent', email: 'arjun.iyer@yanamotors.example', active: true },
  { id: 'tm-09', name: 'Meera Joshi', role: 'Customer Success Manager', email: 'meera.joshi@yanamotors.example', active: true },
  { id: 'tm-10', name: 'Vikram Chauhan', role: 'Quality Manager', email: 'vikram.chauhan@yanamotors.example', active: true },
];

/** Which salesperson looks after which city. */
export const CITY_OWNER: Record<City, string> = {
  Mumbai: 'tm-01',
  Pune: 'tm-02',
  Ahmedabad: 'tm-03',
  Bengaluru: 'tm-04',
  Chennai: 'tm-04',
  Delhi: 'tm-05',
  Hyderabad: 'tm-06',
};

export const CURRENT_USER = TEAM[0];
export const SALES_TEAM = TEAM.filter((m) => m.role.startsWith('Sales'));
export const SUPPORT_TEAM = TEAM.filter((m) => m.role === 'Support Agent');
export const AI_AGENTS = { sales: 'Aria (Sales)', support: 'Sahaayak (Support)', success: 'Mitra (Success)' };
