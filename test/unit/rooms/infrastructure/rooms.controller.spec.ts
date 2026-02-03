import { RoomsController } from '../../../../src/rooms/infrastructure/rooms.controller';

describe('RoomsController - availability', () => {
  it('returns availability result', async () => {
    const mockCheckAvailabilityUseCase = {
      execute: jest.fn().mockResolvedValue({ available: true, conflicts: [] }),
    };

    // Create dummy other use case mocks required by controller
    const controller = new RoomsController(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      mockCheckAvailabilityUseCase as any,
    );

    const result = await controller.availability('room-1', '2026-02-01', '2026-02-03');
    expect(result).toEqual({ available: true, conflicts: [] });
    expect(mockCheckAvailabilityUseCase.execute).toHaveBeenCalledWith(
      'room-1',
      new Date('2026-02-01'),
      new Date('2026-02-03'),
    );
  });

  it('propagates error when dates invalid', async () => {
    const mockCheckAvailabilityUseCase = {
      execute: jest.fn().mockRejectedValue(new Error('Start must be before end')),
    };

    const controller = new RoomsController(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      mockCheckAvailabilityUseCase as any,
    );

    await expect(controller.availability('room-1', '2026-02-05', '2026-02-03')).rejects.toThrow(
      'Start must be before end',
    );
  });
});
