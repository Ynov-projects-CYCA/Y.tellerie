import { CheckAvailabilityUseCase } from '../../../../../src/reservations/application/use-cases/check-availability.use-case';

describe('CheckAvailabilityUseCase', () => {
  it('returns available when there are no conflicts', async () => {
    const mockRepo = {
      findOverlapping: jest.fn().mockResolvedValue([]),
    } as any;

    const useCase = new CheckAvailabilityUseCase(mockRepo);
    const res = await useCase.execute('room-1', new Date('2026-03-01'), new Date('2026-03-05'));

    expect(res.available).toBe(true);
    expect(res.conflicts).toHaveLength(0);
    expect(mockRepo.findOverlapping).toHaveBeenCalled();
  });

  it('returns not available when there are conflicts', async () => {
    const mockRepo = {
      findOverlapping: jest.fn().mockResolvedValue([{ id: 'r1' }]),
    } as any;

    const useCase = new CheckAvailabilityUseCase(mockRepo);
    const res = await useCase.execute('room-1', new Date('2026-03-01'), new Date('2026-03-05'));

    expect(res.available).toBe(false);
    expect(res.conflicts).toHaveLength(1);
  });

  it('throws when start >= end', async () => {
    const mockRepo = { findOverlapping: jest.fn() } as any;
    const useCase = new CheckAvailabilityUseCase(mockRepo);

    await expect(useCase.execute('r', new Date('2026-03-05'), new Date('2026-03-05'))).rejects.toThrow();
  });
});
