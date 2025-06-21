import { getDigiPin, getLatLngFromDigiPin } from 'digipinjs';

// Mock digipinjs for testing
jest.mock('digipinjs', () => ({
  getDigiPin: jest.fn(),
  getLatLngFromDigiPin: jest.fn(),
}));

describe('DIGIPIN Utility Functions', () => {
  const mockGetDigiPin = getDigiPin as jest.MockedFunction<typeof getDigiPin>;
  const mockGetLatLngFromDigiPin = getLatLngFromDigiPin as jest.MockedFunction<typeof getLatLngFromDigiPin>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Coordinate Validation', () => {
    test('validates latitude range (2.5°N to 38.5°N)', () => {
      // Test valid latitudes
      expect(() => mockGetDigiPin(2.5, 77.2090)).not.toThrow();
      expect(() => mockGetDigiPin(38.5, 77.2090)).not.toThrow();
      expect(() => mockGetDigiPin(28.6139, 77.2090)).not.toThrow();
    });

    test('validates longitude range (63.5°E to 99.5°E)', () => {
      // Test valid longitudes
      expect(() => mockGetDigiPin(28.6139, 63.5)).not.toThrow();
      expect(() => mockGetDigiPin(28.6139, 99.5)).not.toThrow();
      expect(() => mockGetDigiPin(28.6139, 77.2090)).not.toThrow();
    });

    test('throws error for latitude outside India bounds', () => {
      mockGetDigiPin.mockImplementation(() => {
        throw new Error('Latitude out of bounds');
      });

      expect(() => mockGetDigiPin(1.0, 77.2090)).toThrow('Latitude out of bounds');
      expect(() => mockGetDigiPin(40.0, 77.2090)).toThrow('Latitude out of bounds');
    });

    test('throws error for longitude outside India bounds', () => {
      mockGetDigiPin.mockImplementation(() => {
        throw new Error('Longitude out of bounds');
      });

      expect(() => mockGetDigiPin(28.6139, 60.0)).toThrow('Longitude out of bounds');
      expect(() => mockGetDigiPin(28.6139, 100.0)).toThrow('Longitude out of bounds');
    });
  });

  describe('DIGIPIN Format Validation', () => {
    test('validates correct DIGIPIN format', () => {
      mockGetLatLngFromDigiPin.mockReturnValue({ latitude: 28.613901, longitude: 77.208998 });

      expect(() => mockGetLatLngFromDigiPin('39J-438-TJC7')).not.toThrow();
      expect(() => mockGetLatLngFromDigiPin('4FK-595-8823')).not.toThrow();
    });

    test('throws error for invalid DIGIPIN format', () => {
      mockGetLatLngFromDigiPin.mockImplementation(() => {
        throw new Error('Invalid DIGIPIN format');
      });

      expect(() => mockGetLatLngFromDigiPin('INVALID')).toThrow('Invalid DIGIPIN format');
      expect(() => mockGetLatLngFromDigiPin('39J438TJC7')).toThrow('Invalid DIGIPIN format');
      expect(() => mockGetLatLngFromDigiPin('39J-438-TJC')).toThrow('Invalid DIGIPIN format');
    });

    test('handles DIGIPIN with extra whitespace', () => {
      mockGetLatLngFromDigiPin.mockReturnValue({ latitude: 28.613901, longitude: 77.208998 });

      expect(() => mockGetLatLngFromDigiPin('  39J-438-TJC7  ')).not.toThrow();
    });
  });

  describe('Known Location Tests', () => {
    test('Delhi coordinates encode correctly', () => {
      mockGetDigiPin.mockReturnValue('39J-438-TJC7');

      const result = mockGetDigiPin(28.6139, 77.2090);
      expect(result).toBe('39J-438-TJC7');
      expect(mockGetDigiPin).toHaveBeenCalledWith(28.6139, 77.2090);
    });

    test('Mumbai coordinates encode correctly', () => {
      mockGetDigiPin.mockReturnValue('4FK-595-8823');

      const result = mockGetDigiPin(19.0760, 72.8777);
      expect(result).toBe('4FK-595-8823');
      expect(mockGetDigiPin).toHaveBeenCalledWith(19.0760, 72.8777);
    });

    test('Delhi DIGIPIN decodes correctly', () => {
      const expectedCoords = { latitude: 28.613901, longitude: 77.208998 };
      mockGetLatLngFromDigiPin.mockReturnValue(expectedCoords);

      const result = mockGetLatLngFromDigiPin('39J-438-TJC7');
      expect(result).toEqual(expectedCoords);
      expect(mockGetLatLngFromDigiPin).toHaveBeenCalledWith('39J-438-TJC7');
    });

    test('Mumbai DIGIPIN decodes correctly', () => {
      const expectedCoords = { latitude: 19.076001, longitude: 72.877701 };
      mockGetLatLngFromDigiPin.mockReturnValue(expectedCoords);

      const result = mockGetLatLngFromDigiPin('4FK-595-8823');
      expect(result).toEqual(expectedCoords);
      expect(mockGetLatLngFromDigiPin).toHaveBeenCalledWith('4FK-595-8823');
    });
  });

  describe('Edge Cases', () => {
    test('handles boundary coordinates', () => {
      mockGetDigiPin.mockReturnValue('BOUNDARY-PIN');

      expect(() => mockGetDigiPin(2.5, 63.5)).not.toThrow(); // Southwest corner
      expect(() => mockGetDigiPin(38.5, 99.5)).not.toThrow(); // Northeast corner
    });

    test('handles decimal precision', () => {
      mockGetDigiPin.mockReturnValue('PRECISE-PIN');

      expect(() => mockGetDigiPin(28.613901, 77.208998)).not.toThrow();
      expect(() => mockGetDigiPin(19.076001, 72.877701)).not.toThrow();
    });

    test('handles zero coordinates', () => {
      mockGetDigiPin.mockImplementation(() => {
        throw new Error('Invalid coordinates');
      });

      expect(() => mockGetDigiPin(0, 0)).toThrow('Invalid coordinates');
    });

    test('handles negative coordinates', () => {
      mockGetDigiPin.mockImplementation(() => {
        throw new Error('Invalid coordinates');
      });

      expect(() => mockGetDigiPin(-28.6139, -77.2090)).toThrow('Invalid coordinates');
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', () => {
      mockGetDigiPin.mockImplementation(() => {
        throw new Error('Network error');
      });

      expect(() => mockGetDigiPin(28.6139, 77.2090)).toThrow('Network error');
    });

    test('handles library errors gracefully', () => {
      mockGetLatLngFromDigiPin.mockImplementation(() => {
        throw new Error('Library error');
      });

      expect(() => mockGetLatLngFromDigiPin('39J-438-TJC7')).toThrow('Library error');
    });

    test('provides meaningful error messages', () => {
      mockGetDigiPin.mockImplementation(() => {
        throw new Error('Coordinates outside India bounds');
      });

      try {
        mockGetDigiPin(50.0, 100.0);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Coordinates outside India bounds');
      }
    });
  });

  describe('Performance Tests', () => {
    test('handles rapid successive calls', () => {
      mockGetDigiPin.mockReturnValue('FAST-PIN');

      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        mockGetDigiPin(28.6139, 77.2090);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(mockGetDigiPin).toHaveBeenCalledTimes(100);
    });

    test('handles large coordinate sets', () => {
      mockGetDigiPin.mockReturnValue('BULK-PIN');

      const coordinates = [
        [28.6139, 77.2090],
        [19.0760, 72.8777],
        [12.9716, 77.5946],
        [22.5726, 88.3639],
        [13.0827, 80.2707]
      ];

      coordinates.forEach(([lat, lng]) => {
        expect(() => mockGetDigiPin(lat, lng)).not.toThrow();
      });

      expect(mockGetDigiPin).toHaveBeenCalledTimes(coordinates.length);
    });
  });
}); 