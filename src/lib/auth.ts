import { timingSafeEqual } from "crypto";

// The placeholder from local setups, never a real secret.
const PLACEHOLDER_SECRET = "local-dev-secret";

/**
 * Checks an `Authorization: Bearer <secret>` header against a configured secret.
 * Fails closed: a missing secret, or one still set to the placeholder, rejects every request.
 */
export function isAuthorized(authHeader: string | null, secret: string | undefined): boolean {
  if (!secret || secret === PLACEHOLDER_SECRET || !authHeader) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(authHeader);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
