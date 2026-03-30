import { describe, it, expect } from 'vitest';
import { TokenEncryptionInCryptoGateway } from '@modules/identity/interface-adapters/gateways/token-encryption.in-crypto.gateway.js';

describe('TokenEncryptionInCryptoGateway', () => {
  const encryptionKey = 'a'.repeat(64);
  const gateway = new TokenEncryptionInCryptoGateway(encryptionKey);

  it('encrypts and decrypts a token back to its original value', async () => {
    const originalToken = 'lin_api_abc123def456';

    const encrypted = await gateway.encrypt(originalToken);
    const decrypted = await gateway.decrypt(encrypted);

    expect(decrypted).toBe(originalToken);
  });

  it('produces different ciphertext than the original plaintext', async () => {
    const originalToken = 'my-secret-token';

    const encrypted = await gateway.encrypt(originalToken);

    expect(encrypted).not.toBe(originalToken);
  });

  it('produces different ciphertext for the same input due to random IV', async () => {
    const token = 'same-token';

    const encrypted1 = await gateway.encrypt(token);
    const encrypted2 = await gateway.encrypt(token);

    expect(encrypted1).not.toBe(encrypted2);
  });
});
