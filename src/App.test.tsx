import React, { act } from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMapEvents: () => null,
}));

// Mock leaflet
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: jest.fn(),
    },
  },
}));

// Mock digipinjs to avoid fs module issues in tests
jest.mock('digipinjs', () => ({
  getDigiPin: jest.fn((lat: number, lng: number) => {
    // Mock implementation for testing
    if (lat === 28.6139 && lng === 77.2090) {
      return '39J-438-TJC7';
    }
    if (lat === 19.0760 && lng === 72.8777) {
      return '4FK-595-8823';
    }
    throw new Error('Invalid coordinates');
  }),
  getLatLngFromDigiPin: jest.fn((digipin: string) => {
    // Mock implementation for testing
    if (digipin === '39J-438-TJC7') {
      return { latitude: 28.613901, longitude: 77.208998 };
    }
    if (digipin === '4FK-595-8823') {
      return { latitude: 19.076001, longitude: 72.877701 };
    }
    throw new Error('Invalid DIGIPIN');
  }),
}));

describe('DIGIPIN UI', () => {
  beforeEach(() => {
    render(<App />);
  });

  describe('App Rendering', () => {
    test('renders main heading', () => {
      expect(screen.getByText('DIGIPIN Encoder & Decoder')).toBeInTheDocument();
    });

    test('renders encode section', () => {
      expect(screen.getByText('Encode (Lat/Lng → DIGIPIN)')).toBeInTheDocument();
    });

    test('renders decode section', () => {
      expect(screen.getByText('Decode (DIGIPIN → Lat/Lng)')).toBeInTheDocument();
    });

    test('renders input fields for encoding', () => {
      expect(screen.getByPlaceholderText('Latitude (e.g. 28.6139)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Longitude (e.g. 77.2090)')).toBeInTheDocument();
    });

    test('renders input field for decoding', () => {
      expect(screen.getByPlaceholderText('DIGIPIN (e.g. 39J-438-TJC7)')).toBeInTheDocument();
    });

    test('renders encode and decode buttons', () => {
      expect(screen.getByText('Encode')).toBeInTheDocument();
      expect(screen.getByText('Decode')).toBeInTheDocument();
    });
  });

  describe('Encoding Functionality', () => {
    test('successfully encodes valid coordinates', async () => {
      const latInput = screen.getByPlaceholderText('Latitude (e.g. 28.6139)');
      const lngInput = screen.getByPlaceholderText('Longitude (e.g. 77.2090)');
      const encodeForm = latInput.closest('form');

      await userEvent.type(latInput, '28.6139');
      await userEvent.type(lngInput, '77.2090');
      await act(async () => {
        encodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const result = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('DIGIPIN:') && node.textContent.includes('39J-438-TJC7'))
        );
        expect(result).toBeInTheDocument();
      });
    });

    test('shows error for invalid latitude', async () => {
      const latInput = screen.getByPlaceholderText('Latitude (e.g. 28.6139)');
      const lngInput = screen.getByPlaceholderText('Longitude (e.g. 77.2090)');
      const encodeForm = latInput.closest('form');

      await userEvent.type(latInput, 'invalid');
      await userEvent.type(lngInput, '77.2090');
      await act(async () => {
        encodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const error = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('Please enter valid numbers for latitude and longitude.'))
        );
        expect(error).toBeInTheDocument();
      });
    });

    test('shows error for invalid longitude', async () => {
      const latInput = screen.getByPlaceholderText('Latitude (e.g. 28.6139)');
      const lngInput = screen.getByPlaceholderText('Longitude (e.g. 77.2090)');
      const encodeForm = latInput.closest('form');

      await userEvent.type(latInput, '28.6139');
      await userEvent.type(lngInput, 'invalid');
      await act(async () => {
        encodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const error = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('Please enter valid numbers for latitude and longitude.'))
        );
        expect(error).toBeInTheDocument();
      });
    });

    test('shows error for empty coordinates', async () => {
      const latInput = screen.getByPlaceholderText('Latitude (e.g. 28.6139)');
      const encodeForm = latInput.closest('form');
      
      await act(async () => {
        encodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const error = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('Please enter valid numbers for latitude and longitude.'))
        );
        expect(error).toBeInTheDocument();
      });
    });

    test('clears previous result when encoding again', async () => {
      // First encode
      const latInput = screen.getByPlaceholderText('Latitude (e.g. 28.6139)');
      const lngInput = screen.getByPlaceholderText('Longitude (e.g. 77.2090)');
      const encodeForm = latInput.closest('form');

      await userEvent.type(latInput, '28.6139');
      await userEvent.type(lngInput, '77.2090');
      await act(async () => {
        encodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const result = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('DIGIPIN:') && node.textContent.includes('39J-438-TJC7'))
        );
        expect(result).toBeInTheDocument();
      });

      // Clear inputs and encode again
      await userEvent.clear(latInput);
      await userEvent.clear(lngInput);
      await userEvent.type(latInput, '19.0760');
      await userEvent.type(lngInput, '72.8777');
      await act(async () => {
        encodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const result = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('DIGIPIN:') && node.textContent.includes('4FK-595-8823'))
        );
        expect(result).toBeInTheDocument();
      });
    });
  });

  describe('Decoding Functionality', () => {
    test('successfully decodes valid DIGIPIN', async () => {
      const digipinInput = screen.getByPlaceholderText('DIGIPIN (e.g. 39J-438-TJC7)');
      const decodeForm = digipinInput.closest('form');

      await userEvent.type(digipinInput, '39J-438-TJC7');
      await act(async () => {
        decodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const result = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('Latitude:') && node.textContent.includes('28.613901') && node.textContent.includes('Longitude:') && node.textContent.includes('77.208998'))
        );
        expect(result).toBeInTheDocument();
      });
    });

    test('shows error for invalid DIGIPIN', async () => {
      const digipinInput = screen.getByPlaceholderText('DIGIPIN (e.g. 39J-438-TJC7)');
      const decodeForm = digipinInput.closest('form');

      await userEvent.type(digipinInput, 'INVALID-PIN');
      await act(async () => {
        decodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const error = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('Invalid DIGIPIN'))
        );
        expect(error).toBeInTheDocument();
      });
    });

    test('shows error for empty DIGIPIN', async () => {
      const digipinInput = screen.getByPlaceholderText('DIGIPIN (e.g. 39J-438-TJC7)');
      const decodeForm = digipinInput.closest('form');
      
      await act(async () => {
        decodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const error = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('Invalid DIGIPIN'))
        );
        expect(error).toBeInTheDocument();
      });
    });

    test('clears previous result when decoding again', async () => {
      // First decode
      const digipinInput = screen.getByPlaceholderText('DIGIPIN (e.g. 39J-438-TJC7)');
      const decodeForm = digipinInput.closest('form');

      await userEvent.type(digipinInput, '39J-438-TJC7');
      await act(async () => {
        decodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const result = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('Latitude:') && node.textContent.includes('28.613901') && node.textContent.includes('Longitude:') && node.textContent.includes('77.208998'))
        );
        expect(result).toBeInTheDocument();
      });

      // Clear input and decode again
      await userEvent.clear(digipinInput);
      await userEvent.type(digipinInput, '4FK-595-8823');
      await act(async () => {
        decodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        const result = screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('Latitude:') && node.textContent.includes('19.076001') && node.textContent.includes('Longitude:') && node.textContent.includes('72.877701'))
        );
        expect(result).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('prevents default form submission for encode', async () => {
      const latInput = screen.getByPlaceholderText('Latitude (e.g. 28.6139)');
      const lngInput = screen.getByPlaceholderText('Longitude (e.g. 77.2090)');
      const encodeForm = latInput.closest('form');

      await userEvent.type(latInput, '28.6139');
      await userEvent.type(lngInput, '77.2090');
      
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      await act(async () => {
        encodeForm?.dispatchEvent(submitEvent);
      });

      // Form should not cause page reload
      expect(submitEvent.defaultPrevented).toBe(true);
    });

    test('prevents default form submission for decode', async () => {
      const digipinInput = screen.getByPlaceholderText('DIGIPIN (e.g. 39J-438-TJC7)');
      const decodeForm = digipinInput.closest('form');

      await userEvent.type(digipinInput, '39J-438-TJC7');
      
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      await act(async () => {
        decodeForm?.dispatchEvent(submitEvent);
      });

      // Form should not cause page reload
      expect(submitEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Input Validation', () => {
    test('accepts decimal numbers for coordinates', async () => {
      const latInput = screen.getByPlaceholderText('Latitude (e.g. 28.6139)');
      const lngInput = screen.getByPlaceholderText('Longitude (e.g. 77.2090)');

      await userEvent.type(latInput, '28.6139');
      await userEvent.type(lngInput, '77.2090');

      expect(latInput).toHaveValue('28.6139');
      expect(lngInput).toHaveValue('77.2090');
    });

    test('accepts DIGIPIN with hyphens', async () => {
      const digipinInput = screen.getByPlaceholderText('DIGIPIN (e.g. 39J-438-TJC7)');

      await userEvent.type(digipinInput, '39J-438-TJC7');

      expect(digipinInput).toHaveValue('39J-438-TJC7');
    });

    test('trims whitespace from DIGIPIN input', async () => {
      const digipinInput = screen.getByPlaceholderText('DIGIPIN (e.g. 39J-438-TJC7)');
      const decodeForm = digipinInput.closest('form');

      await userEvent.type(digipinInput, '  39J-438-TJC7  ');
      await act(async () => {
        decodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        expect(screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('DIGIPIN:') && node.textContent.includes('39J-438-TJC7'))
        )).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('clears error messages when starting new operation', async () => {
      // First, create an error
      const latInput = screen.getByPlaceholderText('Latitude (e.g. 28.6139)');
      const lngInput = screen.getByPlaceholderText('Longitude (e.g. 77.2090)');
      const encodeForm = latInput.closest('form');

      await userEvent.type(latInput, 'invalid');
      await userEvent.type(lngInput, '77.2090');
      await act(async () => {
        encodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        expect(screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('Please enter valid numbers for latitude and longitude.'))
        )).toBeInTheDocument();
      });

      // Now fix the input and encode again
      await userEvent.clear(latInput);
      await userEvent.type(latInput, '28.6139');
      await act(async () => {
        encodeForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await waitFor(() => {
        expect(screen.queryByText('Please enter valid numbers for latitude and longitude.', { exact: false })).not.toBeInTheDocument();
        expect(screen.getByText((content, node) =>
          Boolean(node?.textContent?.includes('DIGIPIN:') && node.textContent.includes('39J-438-TJC7'))
        )).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels and placeholders', () => {
      expect(screen.getByPlaceholderText('Latitude (e.g. 28.6139)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Longitude (e.g. 77.2090)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('DIGIPIN (e.g. 39J-438-TJC7)')).toBeInTheDocument();
    });

    test('buttons are clickable', () => {
      const encodeButton = screen.getByText('Encode');
      const decodeButton = screen.getByText('Decode');

      expect(encodeButton).toBeEnabled();
      expect(decodeButton).toBeEnabled();
    });
  });
});
