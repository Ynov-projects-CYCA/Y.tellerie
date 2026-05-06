import { Room, RoomStatus, RoomType } from './models';

const ROOM_LABELS: Record<RoomType, string> = {
  [RoomType.SIMPLE]: 'Chambre Simple',
  [RoomType.DOUBLE]: 'Chambre Double',
  [RoomType.SUITE]: 'Suite Signature',
};

const ROOM_IMAGE_FALLBACKS: Record<RoomType, { card: string; hero: string }> = {
  [RoomType.SIMPLE]: {
    card: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
    hero: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1400',
  },
  [RoomType.DOUBLE]: {
    card: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    hero: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1400',
  },
  [RoomType.SUITE]: {
    card: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800',
    hero: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1400',
  },
};

const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  [RoomStatus.AVAILABLE]: 'Disponible',
  [RoomStatus.OCCUPIED]: 'Occupée',
  [RoomStatus.DIRTY]: 'À nettoyer',
  [RoomStatus.MAINTENANCE]: 'Maintenance',
};

export function getRoomLabel(room: Pick<Room, 'type'>): string {
  // Les labels sont gardes cote front pour eviter d'exposer les enums brutes dans l'interface.
  return ROOM_LABELS[room.type] ?? room.type;
}

export function getRoomImage(room: Pick<Room, 'type' | 'image'>, size: 'card' | 'hero' = 'card'): string {
  if (room.image) {
    return room.image;
  }

  // L'API ne fournit pas encore toujours d'image, donc on garde un visuel coherent par type.
  return ROOM_IMAGE_FALLBACKS[room.type]?.[size] ?? ROOM_IMAGE_FALLBACKS[RoomType.SUITE][size];
}

export function getRoomStatusLabel(status: RoomStatus): string {
  return ROOM_STATUS_LABELS[status] ?? status;
}
