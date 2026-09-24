import { addDays, atDaysAgo, slugify } from '@/lib/format';
import { createRng } from '@/lib/random';
import { CITY_STATE, type City, type Company, type Customer, type CustomerType } from '@/types';
import { CITY_OWNER } from './team';

interface CompanySeed {
  id: string;
  name: string;
  type: CustomerType;
  city: City;
  area: string;
  since: string;
  /** [name, role, is a buyer (becomes a Customer record)] */
  contacts: [string, string, 0 | 1][];
  /** If set, the last order was about this many days ago (used to create at-risk / dormant accounts). */
  stop?: number;
}

const SEEDS: CompanySeed[] = [
  { id: 'CMP-101', name: 'ABC Auto Care', type: 'Professional Detailer', city: 'Mumbai', area: 'Andheri East', since: '2024-03-12', contacts: [['Rakesh Shah', 'Owner', 1], ['Pooja Naik', 'Operations Manager', 1]] },
  { id: 'CMP-102', name: 'Shine Detailing Studio', type: 'Professional Detailer', city: 'Pune', area: 'Baner', since: '2023-11-05', contacts: [['Aditya Kulkarni', 'Founder', 1], ['Snehal Pawar', 'Studio Manager', 0]] },
  { id: 'CMP-103', name: 'Metro Auto Works', type: 'Workshop', city: 'Delhi', area: 'Okhla Phase 2', since: '2024-06-18', contacts: [['Sandeep Arora', 'Owner', 1], ['Deepak Bansal', 'Service Head', 1]] },
  { id: 'CMP-104', name: 'Royal Detailing Hub', type: 'Professional Detailer', city: 'Hyderabad', area: 'Jubilee Hills', since: '2024-01-22', contacts: [['Faisal Qureshi', 'Owner', 1], ['Anjali Reddy', 'Manager', 0]] },
  { id: 'CMP-105', name: 'Speed Auto Care', type: 'Car Wash', city: 'Bengaluru', area: 'Whitefield', since: '2025-02-10', contacts: [['Naveen Gowda', 'Owner', 1], ['Divya Shetty', 'Manager', 0]] },
  { id: 'CMP-106', name: 'Prime Car Wash', type: 'Car Wash', city: 'Chennai', area: 'Velachery', since: '2024-09-03', contacts: [['Suresh Pillai', 'Owner', 1], ['Lakshmi Narayanan', 'Supervisor', 0]], stop: 68 },
  { id: 'CMP-107', name: 'AutoShine Distributors', type: 'Distributor', city: 'Ahmedabad', area: 'Naroda GIDC', since: '2023-05-15', contacts: [['Jignesh Patel', 'Director', 1], ['Hitesh Desai', 'Purchase Manager', 1]] },
  { id: 'CMP-108', name: 'GreenLine Fleet Services', type: 'Fleet Customer', city: 'Mumbai', area: 'Powai', since: '2025-04-07', contacts: [['Manoj Verma', 'Fleet Manager', 1], ['Kunal Joshi', 'Procurement Lead', 0]] },
  { id: 'CMP-109', name: 'Kohinoor Motors', type: 'Dealer', city: 'Pune', area: 'Kothrud', since: '2023-08-29', contacts: [['Vijay Jadhav', 'Owner', 1], ['Shweta More', 'Accounts Head', 1]] },
  { id: 'CMP-110', name: 'Sahyadri Auto Retail', type: 'Retailer', city: 'Pune', area: 'Hadapsar', since: '2024-12-09', contacts: [['Ramesh Pawar', 'Owner', 1], ['Nikhil More', 'Store Manager', 0]] },
  { id: 'CMP-111', name: 'Deccan Car Care Depot', type: 'Distributor', city: 'Hyderabad', area: 'Kukatpally', since: '2023-09-11', contacts: [['Mahesh Rao', 'Managing Partner', 1], ['Swati Naidu', 'Purchase Lead', 1]] },
  { id: 'CMP-112', name: 'Marina Auto Spa', type: 'Car Wash', city: 'Chennai', area: 'Adyar', since: '2025-06-16', contacts: [['Karthik Menon', 'Owner', 1], ['Nisha Iyer', 'Manager', 0]] },
  { id: 'CMP-113', name: 'Namma Garage Works', type: 'Workshop', city: 'Bengaluru', area: 'Peenya', since: '2025-01-27', contacts: [['Kiran Bhat', 'Owner', 1], ['Harish Shetty', 'Workshop Head', 0]], stop: 70 },
  { id: 'CMP-114', name: 'Capital Corporate Cabs', type: 'Fleet Customer', city: 'Delhi', area: 'Mahipalpur', since: '2025-05-19', contacts: [['Amit Chopra', 'Fleet Head', 1], ['Rekha Sinha', 'Admin Executive', 1]] },
  { id: 'CMP-115', name: 'Orbit Logistics Pvt Ltd', type: 'Corporate Customer', city: 'Mumbai', area: 'Vikhroli', since: '2025-07-14', contacts: [['Gaurav Malhotra', 'Admin Head', 1], ['Anita Desai', 'Procurement Manager', 0]], stop: 64 },
  { id: 'CMP-116', name: 'Vasant Auto Mart', type: 'Retailer', city: 'Delhi', area: 'Karol Bagh', since: '2024-04-23', contacts: [['Sameer Kapoor', 'Owner', 1], ['Neelam Gupta', 'Store Manager', 0]], stop: 128 },
  { id: 'CMP-117', name: 'Ganesh Motor Garage', type: 'Workshop', city: 'Ahmedabad', area: 'Vatva GIDC', since: '2025-08-04', contacts: [['Bhavesh Shah', 'Owner', 1], ['Kirti Patel', 'Manager', 0]], stop: 121 },
  { id: 'CMP-118', name: 'Silverline Auto Dealers', type: 'Dealer', city: 'Mumbai', area: 'Goregaon East', since: '2026-02-16', contacts: [['Tejas Kamath', 'Director', 1], ['Farah Ansari', 'Sales Manager', 1]] },
  { id: 'CMP-119', name: 'Bharat Detailing Lab', type: 'Professional Detailer', city: 'Bengaluru', area: 'Indiranagar', since: '2026-07-10', contacts: [['Varun Rao', 'Founder', 1], ['Aditi Menon', 'Studio Manager', 0]] },
  { id: 'CMP-120', name: 'Zoom Wash & Wax', type: 'Car Wash', city: 'Hyderabad', area: 'Madhapur', since: '2026-07-24', contacts: [['Yash Naidu', 'Owner', 1], ['Ritu Bhatia', 'Supervisor', 0]] },
];

const STD: Record<City, string> = { Mumbai: '22', Pune: '20', Bengaluru: '80', Delhi: '11', Hyderabad: '40', Chennai: '44', Ahmedabad: '79' };
const STREETS = ['Industrial Estate', 'Main Road', 'Link Road', 'Service Road', 'Ring Road', 'Market Yard', 'Station Road'];
const MOBILE_PREFIXES = ['98', '97', '96', '99', '90', '93', '88', '70'];

export interface Accounts {
  companies: Company[];
  customers: Customer[];
  stopByCompany: Record<string, number>;
}

/** All phone numbers, emails and names here are fictional. */
export function buildAccounts(): Accounts {
  const rng = createRng(7);
  const mobile = () => `+91 ${rng.pick(MOBILE_PREFIXES)}${rng.int(100, 999)} ${rng.int(10000, 99999)}`;
  const companies: Company[] = [];
  const customers: Customer[] = [];
  const stopByCompany: Record<string, number> = {};
  let n = 1001;

  for (const s of SEEDS) {
    const since = new Date(`${s.since}T05:00:00.000Z`).toISOString();
    const domain = `${slugify(s.name)}.example`;
    const ownerId = CITY_OWNER[s.city];
    if (s.stop !== undefined) stopByCompany[s.id] = s.stop;
    let buyers = 0;

    const contacts = s.contacts.map(([name, role, buyer]) => {
      const phone = mobile();
      const parts = name.toLowerCase().split(' ');
      const email = `${parts[0]}.${parts[parts.length - 1]}@${domain}`;
      let customerId: string | undefined;
      if (buyer) {
        customerId = `CUST-${n++}`;
        const customerSince = buyers === 0 ? since : new Date(Math.min(new Date(addDays(since, rng.int(25, 220))).getTime(), new Date(atDaysAgo(30)).getTime())).toISOString();
        buyers += 1;
        customers.push({
          id: customerId,
          name,
          role,
          phone,
          email,
          companyId: s.id,
          customerType: s.type,
          city: s.city,
          state: CITY_STATE[s.city],
          customerSince,
          status: s.stop !== undefined && s.stop >= 110 ? 'Inactive' : 'Active',
          whatsappStatus: customers.length % 11 === 4 ? 'Pending' : customers.length === 19 ? 'Opted Out' : 'Opted In',
          health: 'Active',
          accountOwnerId: ownerId,
        });
      }
      return { name, role, phone, email, customerId };
    });

    companies.push({
      id: s.id,
      name: s.name,
      customerType: s.type,
      city: s.city,
      state: CITY_STATE[s.city],
      area: s.area,
      address: `${rng.int(2, 120)}, ${rng.pick(STREETS)}, ${s.area}, ${s.city}`,
      phone: `+91 ${STD[s.city]} ${rng.int(2000, 6999)} ${rng.int(1000, 9999)}`,
      email: `info@${domain}`,
      accountOwnerId: ownerId,
      since,
      contacts,
      health: 'Active',
    });
  }
  return { companies, customers, stopByCompany };
}
