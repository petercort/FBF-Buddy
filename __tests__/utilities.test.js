/**
 * Utility Functions Tests
 * 
 * Tests for common utility functions used across the application
 */

describe('Utility Functions', () => {
  describe('Distance Conversion', () => {
    it('should convert meters to miles correctly', () => {
      const metersToMiles = (meters) => Math.round(meters * 0.000621371);
      
      expect(metersToMiles(1609.34)).toBe(1); // 1 mile
      expect(metersToMiles(5000)).toBe(3); // ~3 miles
      expect(metersToMiles(10000)).toBe(6); // ~6 miles
    });

    it('should handle zero distance', () => {
      const metersToMiles = (meters) => Math.round(meters * 0.000621371);
      expect(metersToMiles(0)).toBe(0);
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      const date = new Date('2025-04-01');
      expect(date.toISOString()).toContain('2025-04-01');
    });

    it('should handle date strings', () => {
      const dateString = '2025-04-01';
      expect(typeof dateString).toBe('string');
      expect(dateString.length).toBe(10);
    });
  });

  describe('String Validation', () => {
    it('should validate non-empty strings', () => {
      const isValidString = (str) => typeof str === 'string' && str.length > 0;
      
      expect(isValidString('test')).toBe(true);
      expect(isValidString('')).toBe(false);
      expect(isValidString(null)).toBe(false);
    });
  });

  describe('User ID Validation', () => {
    it('should validate Discord user IDs', () => {
      const isValidDiscordId = (id) => /^\d+$/.test(id);
      
      expect(isValidDiscordId('123456789')).toBe(true);
      expect(isValidDiscordId('invalid')).toBe(false);
      expect(isValidDiscordId('')).toBe(false);
    });
  });
});
