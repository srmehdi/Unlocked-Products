import { Injectable } from '@angular/core';
import { User } from '../../models/interface';
import { Encryption } from '../encryption/encryption';

@Injectable({
  providedIn: 'root',
})
export class Storage {
  constructor(private encryption: Encryption) {}
  setUser(user: User) {
    return this.setItem('user', user);
  }
  getUser() {
    const result = this.getItem('user');
    return result ? JSON.parse(result) : {};
  }
  private setItem<T>(key: string, value: T): void {
    try {
      const encrypted = this.encryption.encrypt<T>(value);
      return localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error(`Error saving ${key} to localStorage`, error);
    }
  }

  private getItem(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) {
        return null;
      }
      const decrypted = this.encryption.decrypt(encrypted);
      return decrypted || null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage`, error);
      return null;
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage`, error);
    }
  }

  clearStorage(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  hasKey(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
