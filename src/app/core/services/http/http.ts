import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  HttpResponse,
  Product,
  ProductExperience,
  ProductPayload,
  User,
} from '../../models/interface';

@Injectable({ providedIn: 'root' })
export class Http {
  constructor(private http: HttpClient) {}

  getUser(payload: User): Observable<HttpResponse<User[]>> {
    return this.http.post<HttpResponse<User[]>>('/api/user', payload);
    // return this.http.get<User[]>(`/api/user?email=${encodeURIComponent(email)}`);
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
  sendResetMail(payload: {}) {
    return this.http.post<any>('/api/send-reset', payload);
    // return this.http.get<Product>('./assets/jsons/products.json');
  }
  resetPassword(payload: {
    token: string | null;
    userId: string | null;
    newPassword: string | null | undefined;
  }) {
    return this.http.post<any>('/api/reset-password', payload);
    // return this.http.get<Product>('./assets/jsons/products.json');
  }
  submitExperience(experience: ProductExperience) {
    return this.http.post<any>('/api/submit-experience', experience);
    // return this.http.get<User>('./assets/jsons/user.json');
  }
  fetchExperiences(productId: { productId: number }) {
    return this.http.post<any>('/api/get-experiences', productId);
    // return this.http.get<User>('./assets/jsons/user.json');
  }
}
