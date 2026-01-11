import { inject, Injectable, signal } from '@angular/core';
import { Product, User } from '../../models/interface';
import { Storage } from '../storage/storage';

@Injectable({
  providedIn: 'root',
})
export class State {
  storage = inject(Storage);

  private readonly _user = signal<User | null>(this.storage.getUser());
  readonly user = this._user.asReadonly();
  setUser(user: User) {
    this.storage.setUser(user);
    this._user.set(user);
  }
  // private readonly _product = signal<Product | null>(this.storage.getProduct());
  // readonly product = this._product.asReadonly();
  // setProduct(product: Product) {
  //   this.storage.setProduct(product);
  //   this._product.set(product);
  // }
  private readonly _product = signal<Product[] | null>(this.storage.getProduct());
  readonly products = this._product.asReadonly();
  setProduct(products: Product[]) {
    this.storage.setProduct(products);
    this._product.set(products);
  }
}
