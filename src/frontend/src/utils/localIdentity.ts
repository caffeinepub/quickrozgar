import { Ed25519KeyIdentity } from "@dfinity/identity";

const LOCAL_IDENTITY_PREFIX = "qr_local_identity_";

export async function getOrCreateLocalIdentity(
  sessionKey: string,
): Promise<Ed25519KeyIdentity> {
  const storageKey = LOCAL_IDENTITY_PREFIX + sessionKey;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return Ed25519KeyIdentity.fromJSON(JSON.stringify(parsed));
    } catch {
      // regenerate if corrupted
    }
  }

  // Generate new identity
  const identity = Ed25519KeyIdentity.generate();
  localStorage.setItem(storageKey, JSON.stringify(identity.toJSON()));
  return identity;
}

export function clearLocalIdentity(sessionKey: string): void {
  localStorage.removeItem(LOCAL_IDENTITY_PREFIX + sessionKey);
}
