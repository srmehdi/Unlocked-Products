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
  resetUser() {
    this._user.set(null);
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
  private readonly _productId = signal<number | null>(this.storage.getProductId());
  readonly productId = this._productId.asReadonly();
  setProductId(productId: number | null) {
    this.storage.setProductId(productId);
    this._productId.set(productId);
  }
  private readonly KEY = 'visitor_id';
  getVisitorId(): string {
    try {
      let id = localStorage.getItem(this.KEY);
      if (id) return id;
      id = crypto.randomUUID();

      try {
        localStorage.setItem(this.KEY, id);
        return id;
      } catch (err) {
        console.log('localStorage error', err);
      }
      sessionStorage.setItem(this.KEY, id);
      return id;
    } catch {
      return crypto.randomUUID();
    }
  }
  categories = [
    {
      name: 'All',
      slug: 'all',
    },
    {
      name: 'Smartphones',
      slug: 'smartphones',
      subcategories: [
        { name: 'Android Phones', slug: 'android' },
        { name: 'iPhones', slug: 'iphone' },
      ],
    },
    {
      name: 'Laptops',
      slug: 'laptops',
      subcategories: [
        { name: 'Notebooks', slug: 'notebooks' },
        { name: 'Ultrabooks', slug: 'ultrabooks' },
        { name: 'Gaming', slug: 'gaming' },
      ],
    },
    {
      name: 'Headphones',
      slug: 'headphones',
      subcategories: [
        { name: 'Wireless', slug: 'wireless' },
        { name: 'Wired', slug: 'wired' },
      ],
    },
    {
      name: 'Wearables',
      slug: 'wearables',
      subcategories: [
        { name: 'Smartwatches', slug: 'smartwatch' },
        { name: 'Fitness Bands', slug: 'fitness-band' },
      ],
    },
    {
      name: 'Beauty Products',
      slug: 'beauty',
      subcategories: [
        { name: 'Skincare', slug: 'skincare' },
        { name: 'Makeup', slug: 'makeup' },
        { name: 'Hair Care', slug: 'hair-care' },
        { name: 'Fragrances', slug: 'fragrance' },
      ],
    },
  ];
}
