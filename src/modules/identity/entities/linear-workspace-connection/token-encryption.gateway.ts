export abstract class TokenEncryptionGateway {
  abstract encrypt(plaintext: string): Promise<string>;
  abstract decrypt(ciphertext: string): Promise<string>;
}
