import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class Encryption {
  private secretKey = 'my-key';

  encrypt<T>(plainText: T): string {
    if (!plainText) {
      throw new Error('Plain text is required for encryption.');
    }

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(plainText), this.secretKey).toString();
    return encrypted;
  }
  decrypt(cipherText: string): string {
    if (!cipherText) {
      throw new Error('Cipher text is required for decryption.');
    }
    const bytes = CryptoJS.AES.decrypt(cipherText, this.secretKey);

    // const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const decrypted = CryptoJS.enc.Utf8.stringify(bytes);
    if (!decrypted) {
      throw new Error('Decryption failed. Possibly wrong key or corrupted data.');
    }
    return decrypted;
  }
}
