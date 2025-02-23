export const CacheKeys = {
  GOAL: (goalId) => `goal:${goalId}`,
  GOALS: (userId, params = {}) => {
    const validatedParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || '',
      title: params.title || '',
      fromDueDate: params.fromDueDate || '',
      toDueDate: params.toDueDate || '',
      sortBy: params.sortBy || '',
      order: params.order || '',
    };

    return `goals:user:${userId}:${Object.entries(validatedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;
  },

  ANALYTICS: (userId, type, params) =>
    `analytics:user:${userId}:${type}:${stringifyParams(params)}`,
  SUBTASKS: (goalId, params) =>
    `subtasks:goal:${goalId}:${stringifyParams(params)}`,
  USER_PROFILE: (userId) => `user:${userId}:profile`,
};

const stringifyParams = (params = {}) => {
  return Object.entries(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
};
