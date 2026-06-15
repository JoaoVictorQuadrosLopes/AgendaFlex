const buckets = new Map();

function getClientKey(req, keyPrefix) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  const ip = forwardedFor || req.ip || req.socket?.remoteAddress || "unknown";

  return `${keyPrefix}:${ip}`;
}

function cleanup(now) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function rateLimit({ windowMs, max, keyPrefix, message }) {
  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    cleanup(now);

    const key = getClientKey(req, keyPrefix || req.path);
    const current = buckets.get(key);
    const bucket = current && current.resetAt > now ? current : { count: 0, resetAt: now + windowMs };

    bucket.count += 1;
    buckets.set(key, bucket);

    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.setHeader("RateLimit-Reset", String(retryAfterSeconds));

    if (bucket.count > max) {
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        mensagem: message || "Muitas tentativas. Aguarde um momento e tente novamente.",
        code: "RATE_LIMITED"
      });
    }

    return next();
  };
}

module.exports = { rateLimit };
