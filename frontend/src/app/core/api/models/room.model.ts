export enum RoomType {
  SIMPLE = 'SIMPLE',
  DOUBLE = 'DOUBLE',
  SUITE = 'SUITE',
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  DIRTY = 'DIRTY',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  capacity: number;
  price: number;
  currency: string;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  // Optionnels (non présents dans le DTO backend actuel)
  amenities?: string[];
  image?: string;
}
