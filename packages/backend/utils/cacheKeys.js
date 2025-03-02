const CACHE_VERSION = 'v1';

export const CacheKeys = {
  // Key for a single goal
  GOAL: (goalId) => `${CACHE_VERSION}:goal:${goalId}`,

  // Key for a list of goals based on query params
  GOALS: (userId, params = {}) => {
    const safeParams = {
      page: params.page?.toString() || '1',
      limit: params.limit?.toString() || '10',
      status: params.status || 'all',
      title: params.title?.slice(0, 50) || '',
      from: params.fromDueDate || '',
      to: params.toDueDate || '',
      sort: params.sortBy || 'createdAt',
      order: params.order || 'desc',
    };

    return (
      `${CACHE_VERSION}:goals:user:${userId}:` +
      Object.entries(safeParams)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    );
  },

  // Pattern key to delete all goal caches for a user
  GOALS_PATTERN: (userId) => `${CACHE_VERSION}:goals:user:${userId}:*`,

  // Key for analytics with an optional type and params (defaults to 'default')
  ANALYTICS: (userId, type = 'default', params = {}) =>
    `${CACHE_VERSION}:analytics:${type}:user:${userId}:` +
    Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&'),

  // Dedicated key for dashboard analytics (no wildcards)
  ANALYTICS_DASHBOARD: (userId) =>
    `${CACHE_VERSION}:analytics:dashboard:user:${userId}`,

  // Pattern key for analytics (useful for bulk deletion)
  ANALYTICS_PATTERN: (userId, type = '*') =>
    `${CACHE_VERSION}:analytics:${type}:user:${userId}:*`,

  // Key for a user profile cache
  USER_PROFILE: (userId) => `${CACHE_VERSION}:user:${userId}:profile`,
  // Key for subtasks of a specific goal with pagination parameters.
  SUBTASKS: (goalId, params = {}) => {
    const safeParams = {
      page: params.page?.toString() || '1',
      limit: params.limit?.toString() || '10',
    };

    return (
      `${CACHE_VERSION}:subtasks:goal:${goalId}:` +
      Object.entries(safeParams)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    );
  },
};
