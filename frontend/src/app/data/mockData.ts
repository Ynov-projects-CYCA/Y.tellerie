export type RoomStatus = 'available' | 'occupied';
export type ReservationStatus = 'confirmed' | 'pending' | 'completed';
export type EmployeeStatus = 'active' | 'inactive';

export interface Room {
  id: number;
  status: RoomStatus;
}

export interface Reservation {
  id: number;
  guestName: string;
  roomNumber: number;
  status: ReservationStatus;
  totalPrice: number;
  checkIn: string;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  status: EmployeeStatus;
  shift: string;
}

export interface CurrentUser {
  id: number;
  name: string;
  isAdmin: boolean;
}

export const mockRooms: Room[] = [
  { id: 1, status: 'available' },
  { id: 2, status: 'occupied' },
  { id: 3, status: 'available' },
  { id: 4, status: 'occupied' },
  { id: 5, status: 'available' },
  { id: 6, status: 'available' },
  { id: 7, status: 'occupied' },
  { id: 8, status: 'available' },
];

export const mockReservations: Reservation[] = [
  {
    id: 1,
    guestName: 'Jean Dupont',
    roomNumber: 101,
    status: 'confirmed',
    totalPrice: 150,
    checkIn: '2026-03-28',
  },
  {
    id: 2,
    guestName: 'Marie Martin',
    roomNumber: 102,
    status: 'pending',
    totalPrice: 200,
    checkIn: '2026-03-29',
  },
  {
    id: 3,
    guestName: 'Pierre Durand',
    roomNumber: 103,
    status: 'confirmed',
    totalPrice: 180,
    checkIn: '2026-03-30',
  },
  {
    id: 4,
    guestName: 'Sophie Leroy',
    roomNumber: 104,
    status: 'completed',
    totalPrice: 220,
    checkIn: '2026-03-25',
  },
  {
    id: 5,
    guestName: 'Luc Moreau',
    roomNumber: 105,
    status: 'confirmed',
    totalPrice: 190,
    checkIn: '2026-03-31',
  },
];

export const mockEmployees: Employee[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    role: 'Réceptionniste',
    status: 'active',
    shift: 'Matin',
  },
  {
    id: 2,
    name: 'Bob Smith',
    role: 'Manager',
    status: 'active',
    shift: 'Après-midi',
  },
  {
    id: 3,
    name: 'Charlie Brown',
    role: 'Serveur',
    status: 'active',
    shift: 'Soir',
  },
  {
    id: 4,
    name: 'Diana Prince',
    role: 'Cuisinier',
    status: 'inactive',
    shift: 'Matin',
  },
];

export const currentUser: CurrentUser = {
  id: 1,
  name: 'Admin User',
  isAdmin: true,
};