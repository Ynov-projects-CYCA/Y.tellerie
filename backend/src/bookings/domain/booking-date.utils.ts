const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function parseBookingDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Date de reservation invalide : ${value}`);
  }
  return date;
}

export function validateStayDates(checkInDate: Date, checkOutDate: Date): void {
  if (checkOutDate <= checkInDate) {
    throw new Error("La date de depart doit etre posterieure a la date d'arrivee");
  }
}

export function calculateNights(checkInDate: Date, checkOutDate: Date): number {
  validateStayDates(checkInDate, checkOutDate);
  return Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / MILLISECONDS_PER_DAY,
  );
}
