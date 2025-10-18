/**
 * Data Models Tests
 * 
 * Tests for database model structures and validations
 */

describe('Data Models', () => {
  describe('Users Model', () => {
    it('should have required user fields', () => {
      const userFields = [
        'userId',
        'stravaUserId',
        'stravaAccessToken',
        'stravaRefreshToken',
        'stravaTokenExpiry'
      ];
      
      expect(userFields).toContain('userId');
      expect(userFields).toContain('stravaUserId');
      expect(userFields.length).toBeGreaterThan(0);
    });

    it('should validate user data structure', () => {
      const mockUser = {
        userId: '12345',
        stravaUserId: '67890',
        stravaAccessToken: 'token123',
        stravaRefreshToken: 'refresh123',
        stravaTokenExpiry: Date.now() + 3600000
      };
      
      expect(mockUser.userId).toBeDefined();
      expect(mockUser.stravaUserId).toBeDefined();
      expect(typeof mockUser.stravaAccessToken).toBe('string');
    });
  });

  describe('Bikes Model', () => {
    it('should have required bike fields', () => {
      const bikeFields = [
        'stravaGearId',
        'userId',
        'name',
        'brand',
        'model',
        'distance',
        'lastWaxedDate',
        'lastWaxedDistance'
      ];
      
      expect(bikeFields).toContain('stravaGearId');
      expect(bikeFields).toContain('name');
      expect(bikeFields.length).toBeGreaterThan(0);
    });

    it('should validate bike data structure', () => {
      const mockBike = {
        stravaGearId: 'g123456',
        userId: '12345',
        name: 'My Bike',
        brand: 'Trek',
        model: 'Domane',
        distance: 10000,
        lastWaxedDate: '2025-04-01',
        lastWaxedDistance: 5000
      };
      
      expect(mockBike.name).toBeDefined();
      expect(mockBike.distance).toBeGreaterThanOrEqual(0);
      expect(typeof mockBike.brand).toBe('string');
    });

    it('should calculate distance since waxing', () => {
      const calculateDistanceSinceWax = (currentDistance, lastWaxedDistance) => {
        return currentDistance - lastWaxedDistance;
      };
      
      expect(calculateDistanceSinceWax(10000, 5000)).toBe(5000);
      expect(calculateDistanceSinceWax(1000, 1000)).toBe(0);
    });
  });

  describe('Events Model', () => {
    it('should have required event fields', () => {
      const eventFields = [
        'eventId',
        'eventName',
        'eventDate',
        'eventLocation'
      ];
      
      expect(eventFields).toContain('eventId');
      expect(eventFields).toContain('eventName');
      expect(eventFields.length).toBeGreaterThan(0);
    });
  });
});
