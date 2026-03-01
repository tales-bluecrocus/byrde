/**
 * SettingsContext tests
 *
 * Tests: loading from window.byrdeSettings, updateSettings merge,
 * replaceSettings, and error when used outside provider.
 */

import { render, screen, act } from '@testing-library/react';
import { SettingsProvider, useSettingsContext } from '../SettingsContext';

// Helper component that displays settings
function SettingsDisplay() {
  const { settings } = useSettingsContext();
  return (
    <div>
      <span data-testid="phone">{settings.phone}</span>
      <span data-testid="email">{settings.email}</span>
      <span data-testid="site_name">{settings.site_name}</span>
    </div>
  );
}

// Helper component that calls updateSettings
function SettingsUpdater({ updates }: { updates: Record<string, string> }) {
  const { updateSettings } = useSettingsContext();
  return (
    <button onClick={() => updateSettings(updates)} data-testid="update-btn">
      Update
    </button>
  );
}

// Helper component that calls replaceSettings
function SettingsReplacer() {
  const { replaceSettings, settings } = useSettingsContext();
  return (
    <button
      onClick={() =>
        replaceSettings({
          ...settings,
          phone: '(999) 000-0000',
          email: 'replaced@example.com',
          site_name: 'Replaced Site',
        })
      }
      data-testid="replace-btn"
    >
      Replace
    </button>
  );
}

beforeEach(() => {
  window.byrdeSettings = {
    phone: '(555) 123-4567',
    email: 'test@example.com',
    site_name: 'Test Site',
  };
});

describe('SettingsProvider', () => {
  it('loads settings from window.byrdeSettings', () => {
    render(
      <SettingsProvider>
        <SettingsDisplay />
      </SettingsProvider>
    );

    expect(screen.getByTestId('phone')).toHaveTextContent('(555) 123-4567');
    expect(screen.getByTestId('email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('site_name')).toHaveTextContent('Test Site');
  });

  it('merges defaults when window.byrdeSettings is partial', () => {
    window.byrdeSettings = { phone: '(111) 222-3333' };

    render(
      <SettingsProvider>
        <SettingsDisplay />
      </SettingsProvider>
    );

    expect(screen.getByTestId('phone')).toHaveTextContent('(111) 222-3333');
    // email falls back to DEFAULT_SETTINGS (empty string)
    expect(screen.getByTestId('email')).toHaveTextContent('');
  });

  it('updateSettings merges partial updates', () => {
    render(
      <SettingsProvider>
        <SettingsDisplay />
        <SettingsUpdater updates={{ phone: '(999) 888-7777' }} />
      </SettingsProvider>
    );

    act(() => {
      screen.getByTestId('update-btn').click();
    });

    expect(screen.getByTestId('phone')).toHaveTextContent('(999) 888-7777');
    // Other fields unchanged
    expect(screen.getByTestId('email')).toHaveTextContent('test@example.com');
  });

  it('replaceSettings replaces entire settings object', () => {
    render(
      <SettingsProvider>
        <SettingsDisplay />
        <SettingsReplacer />
      </SettingsProvider>
    );

    act(() => {
      screen.getByTestId('replace-btn').click();
    });

    expect(screen.getByTestId('phone')).toHaveTextContent('(999) 000-0000');
    expect(screen.getByTestId('email')).toHaveTextContent('replaced@example.com');
  });
});

describe('useSettingsContext', () => {
  it('throws when used outside SettingsProvider', () => {
    // Suppress React error boundary console output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    function BareComponent() {
      useSettingsContext();
      return null;
    }

    expect(() => render(<BareComponent />)).toThrow(
      'useSettingsContext must be used within a SettingsProvider'
    );

    consoleSpy.mockRestore();
  });
});
