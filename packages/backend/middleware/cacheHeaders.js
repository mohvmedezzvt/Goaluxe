export const cacheHeaderMiddleware = (req, res, next) => {
  // Wrap res.json so we can set the header dynamically
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    // Check if the route handler set a flag for a cache hit
    const cacheStatus = res.locals.cacheHit ? 'HIT' : 'MISS';
    res.set({
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      'X-Cache-Status': cacheStatus,
    });
    return originalJson(data);
  };
  next();
};
