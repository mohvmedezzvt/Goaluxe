import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useSearchParams } from '../use-search-params'; 

// Define a mock function for router.replace
const mockReplace = vi.fn();

// Mock the Next.js navigation module
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  usePathname: () => '/test-path',
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Define the expected return type of useSearchParams
interface URLParams {
  title: string | null;
  status: string | null;
  sortBy: string | null;
  page: number;
  order: 'asc' | 'desc' | null;
  handlePagination: (newPage: number) => void;
}

describe('useSearchParams', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    // Reset window.location.search before each test
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
    });
  });

  test('extracts all parameters correctly', () => {
    window.location.search = '?title=test&status=active&sortBy=name&order=asc&page=3';
    const { result } = renderHook(() => useSearchParams());

    expect(result.current.title).toBe('test');
    expect(result.current.status).toBe('active');
    expect(result.current.sortBy).toBe('name');
    expect(result.current.order).toBe('asc');
    expect(result.current.page).toBe(3);
  });

  test('defaults page to 1 when not set', () => {
    window.location.search = '';
    const { result } = renderHook(() => useSearchParams());

    expect(result.current.page).toBe(1);
    expect(result.current.title).toBe(null);
    expect(result.current.status).toBe(null);
    expect(result.current.sortBy).toBe(null);
    expect(result.current.order).toBe(null);
  });

  test('defaults page to 1 when set to 0', () => {
    window.location.search = '?page=0';
    const { result } = renderHook(() => useSearchParams());

    expect(result.current.page).toBe(1);
  });

  test('defaults page to 1 when set to a negative number', () => {
    window.location.search = '?page=-5';
    const { result } = renderHook(() => useSearchParams());

    expect(result.current.page).toBe(1);
  });

  test('defaults page to 1 when set to a non-number', () => {
    window.location.search = '?page=abc';
    const { result } = renderHook(() => useSearchParams());

    expect(result.current.page).toBe(1);
  });

  test('handles pagination correctly with all parameters', () => {
    window.location.search = '?title=test&status=active&sortBy=name&order=asc&page=3';
    const { result } = renderHook(() => useSearchParams());

    result.current.handlePagination(4);
    expect(mockReplace).toHaveBeenCalledWith('/test-path?title=test&status=active&sortBy=name&order=asc&page=4');
  });

  test('handles pagination correctly with no other parameters', () => {
    window.location.search = '';
    const { result } = renderHook(() => useSearchParams());

    result.current.handlePagination(2);
    expect(mockReplace).toHaveBeenCalledWith('/test-path?page=2');
  });

  test('handles pagination correctly with some parameters', () => {
    window.location.search = '?title=test&page=2';
    const { result } = renderHook(() => useSearchParams());

    result.current.handlePagination(3);
    expect(mockReplace).toHaveBeenCalledWith('/test-path?title=test&page=3');
  });
});