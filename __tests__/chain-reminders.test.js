import {
  buildRideReminderMessage,
  buildWeeklyReminderMessage,
  getMilesSinceWax,
  getWaxReminderLevel,
  isSupportedRideType
} from '../services/backend/src/shared-library/chain-reminders.js';

describe('Chain wax reminders', () => {
  it('supports physical and virtual rides', () => {
    expect(isSupportedRideType('Ride')).toBe(true);
    expect(isSupportedRideType('VirtualRide')).toBe(true);
    expect(isSupportedRideType('Run')).toBe(false);
  });

  it('preserves the existing rounded mileage calculation', () => {
    expect(getMilesSinceWax(500000, 100000)).toBe(249);
  });

  it('uses strict reminder thresholds', () => {
    expect(getWaxReminderLevel(150)).toBeNull();
    expect(getWaxReminderLevel(151)).toBe('approaching');
    expect(getWaxReminderLevel(250)).toBe('approaching');
    expect(getWaxReminderLevel(251)).toBe('due');
  });

  it('builds ride-specific reminders', () => {
    expect(buildRideReminderMessage('Road Bike', 251))
      .toContain("it's time to wax your chain");
    expect(buildRideReminderMessage('Road Bike', 151))
      .toContain('getting close');
  });

  it('builds one weekly message for all overdue bikes', () => {
    const message = buildWeeklyReminderMessage([
      { name: 'Road Bike', milesSinceWax: 300, level: 'due' },
      { name: 'Gravel Bike', milesSinceWax: 175, level: 'approaching' }
    ]);

    expect(message).toContain('Weekly chain wax reminder');
    expect(message).toContain('Road Bike: 300 miles');
    expect(message).toContain('Gravel Bike: 175 miles');
  });
});
