const METERS_TO_MILES = 0.000621371;

export const WAX_APPROACHING_MILES = 150;
export const WAX_DUE_MILES = 250;
export const SUPPORTED_RIDE_TYPES = new Set(['Ride', 'VirtualRide']);

export function isSupportedRideType(type) {
  return SUPPORTED_RIDE_TYPES.has(type);
}

export function getMilesSinceWax(currentDistance, lastWaxedDistance) {
  const totalMiles = Math.round(currentDistance * METERS_TO_MILES);
  const lastWaxedMiles = Math.round(lastWaxedDistance * METERS_TO_MILES);
  return totalMiles - lastWaxedMiles;
}

export function getWaxReminderLevel(milesSinceWax) {
  if (milesSinceWax > WAX_DUE_MILES) {
    return 'due';
  }
  if (milesSinceWax > WAX_APPROACHING_MILES) {
    return 'approaching';
  }
  return null;
}

export function getOverdueBikes(bikes) {
  return bikes
    .filter((bike) => bike.retired !== true)
    .map((bike) => {
      const milesSinceWax = getMilesSinceWax(bike.distance, bike.lastWaxedDistance);
      return {
        name: bike.name,
        milesSinceWax,
        level: getWaxReminderLevel(milesSinceWax)
      };
    })
    .filter((bike) => bike.level);
}

export function buildRideReminderMessage(bikeName, milesSinceWax) {
  if (getWaxReminderLevel(milesSinceWax) === 'due') {
    return bikeName
      ? `Nice ride and it's time to wax your chain! ${bikeName} has ridden ${milesSinceWax} miles since its last wax.`
      : `Nice ride and it's time to wax your chain! You've ridden ${milesSinceWax} miles since your last wax.`;
  }

  return bikeName
    ? `Nice ride! You're getting close to needing to wax your chain. ${bikeName} has ${milesSinceWax} miles since its last wax.`
    : `Nice ride! You're getting close to needing to wax your chain. You've ridden ${milesSinceWax} miles since your last wax.`;
}

export function buildWeeklyReminderMessage(bikes) {
  const lines = bikes.map(({ name, milesSinceWax, level }) => {
    const status = level === 'due' ? 'needs waxing' : 'is getting close';
    return `- ${name}: ${milesSinceWax} miles since its last wax (${status})`;
  });

  return [
    'Weekly chain wax reminder:',
    ...lines,
    'Use /i_waxed_my_chain after waxing a bike.'
  ].join('\n');
}
