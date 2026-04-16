const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function parseBookingDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid booking date: ${value}`);
  }
  return date;
}

export function validateStayDates(checkInDate: Date, checkOutDate: Date): void {
  if (checkOutDate <= checkInDate) {
    throw new Error('Check-out date must be after check-in date');
  }
}

export function calculateNights(checkInDate: Date, checkOutDate: Date): number {
  validateStayDates(checkInDate, checkOutDate);
  return Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / MILLISECONDS_PER_DAY,
  );
}
