// Temporary stub for Redis cache — disabled to avoid connection errors.
// This file exports a `cache` object with the same async methods used
// across the app but implemented as no-ops so the application works
// without a running Redis instance.

const cache = {
  async get(/* key */) {
    return null;
  },
  async set(/* key, value, ttl */) {
    return true;
  },
  async del(/* key */) {
    return true;
  },
  async invalidatePattern(/* pattern */) {
    return true;
  },
};

export { cache };
export default null;