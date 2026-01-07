import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/interface';

export interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getUserByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(`/api/user?email=${encodeURIComponent(email)}`);
  }

  createUser(user: Partial<User & { name?: string }>) {
    return this.http.post<User>('/api/createUser', user);
  }
}
