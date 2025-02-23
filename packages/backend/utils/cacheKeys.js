const CACHE_VERSION = 'v1';

export const CacheKeys = {
  GOAL: (goalId) => `${CACHE_VERSION}:goal:${goalId}`,
  GOALS: (userId, params = {}) => {
    const safeParams = {
      page: params.page?.toString() || '1',
      limit: params.limit?.toString() || '10',
      status: params.status || 'all',
      title: params.title?.slice(0, 50) || '', // Prevent long keys
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

  ANALYTICS: (userId, type, params) =>
    `${CACHE_VERSION}:analytics:${type}:user:${userId}:` +
    Object.entries(params || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&'),

  USER_PROFILE: (userId) => `${CACHE_VERSION}:user:${userId}:profile`,
};
