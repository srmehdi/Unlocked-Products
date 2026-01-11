import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductPayload, User } from '../../models/interface';

@Injectable({ providedIn: 'root' })
export class Http {
  constructor(private http: HttpClient) {}

  getUserByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(`/api/user?email=${encodeURIComponent(email)}`);
    // return this.http.get<User[]>('./assets/jsons/user.json');
  }

  createUser(user: Partial<User>) {
    return this.http.post<User>('/api/createUser', user);
    // return this.http.get<User>('./assets/jsons/user.json');
  }
  getProducts(category: { category: number }) {
    return this.http.post<Product[]>('/api/getProducts', category);
    // return this.http.get<Product[]>('./assets/jsons/products.json');
  }
  addProducts(product: ProductPayload) {
    return this.http.post<any>('/api/addProduct', product);
    // return this.http.get<Product>('./assets/jsons/products.json');
  }
}
