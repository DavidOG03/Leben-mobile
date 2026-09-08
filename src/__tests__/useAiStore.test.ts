/**
 * Unit tests for useAIStore
 * Covers: addMessage, removeMessage, clearChat, cache expiry logic
 */

import { act } from 'react';

// Mock AsyncStorage so persist middleware doesn't fail in Node.js
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Import after mock setup
import { useAIStore } from '../store/useAiStore';

const makeMsg = (id: string, role: 'user' | 'assistant' = 'user') => ({
  id,
  role,
  content: `Message ${id}`,
  time: '12:00',
});

describe('useAIStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useAIStore.getState().clearChat();
    });
  });

  it('starts with the greeting message', () => {
    const { messages } = useAIStore.getState();
    expect(messages.length).toBeGreaterThanOrEqual(1);
    expect(messages[0].role).toBe('assistant');
  });

  it('addMessage appends a new message', () => {
    act(() => {
      useAIStore.getState().addMessage(makeMsg('test-1'));
    });
    const { messages } = useAIStore.getState();
    expect(messages.some(m => m.id === 'test-1')).toBe(true);
  });

  it('removeMessage removes the correct message by id', () => {
    act(() => {
      useAIStore.getState().addMessage(makeMsg('del-1'));
      useAIStore.getState().addMessage(makeMsg('del-2'));
    });

    act(() => {
      useAIStore.getState().removeMessage('del-1');
    });

    const { messages } = useAIStore.getState();
    expect(messages.some(m => m.id === 'del-1')).toBe(false);
    expect(messages.some(m => m.id === 'del-2')).toBe(true);
  });

  it('clearChat resets to initial greeting', () => {
    act(() => {
      useAIStore.getState().addMessage(makeMsg('extra-1'));
      useAIStore.getState().addMessage(makeMsg('extra-2'));
      useAIStore.getState().clearChat();
    });

    const { messages } = useAIStore.getState();
    // Only the greeting message remains
    expect(messages.every(m => m.role === 'assistant')).toBe(true);
    expect(messages.some(m => m.id === 'extra-1')).toBe(false);
  });

  it('setThinking toggles isThinking', () => {
    act(() => useAIStore.getState().setThinking(true));
    expect(useAIStore.getState().isThinking).toBe(true);

    act(() => useAIStore.getState().setThinking(false));
    expect(useAIStore.getState().isThinking).toBe(false);
  });

  it('checkCacheExpiry clears chat when lastUpdated > 24h ago', () => {
    act(() => {
      useAIStore.getState().addMessage(makeMsg('stale-1'));
      // Manually set lastUpdated to 25 hours ago
      useAIStore.setState({ lastUpdated: Date.now() - 25 * 60 * 60 * 1000 });
      useAIStore.getState().checkCacheExpiry();
    });

    const { messages } = useAIStore.getState();
    expect(messages.some(m => m.id === 'stale-1')).toBe(false);
  });

  it('checkCacheExpiry does NOT clear chat when lastUpdated < 24h ago', () => {
    act(() => {
      useAIStore.getState().addMessage(makeMsg('fresh-1'));
      useAIStore.setState({ lastUpdated: Date.now() - 1 * 60 * 60 * 1000 }); // 1 hour ago
      useAIStore.getState().checkCacheExpiry();
    });

    const { messages } = useAIStore.getState();
    expect(messages.some(m => m.id === 'fresh-1')).toBe(true);
  });
});
