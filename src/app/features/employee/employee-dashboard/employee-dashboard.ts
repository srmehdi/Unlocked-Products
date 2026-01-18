import { Component, inject, signal, ViewChild } from '@angular/core';
import { Storage } from '../../../core/services/storage/storage';
import { Product, User } from '../../../core/models/interface';
import { Http } from '../../../core/services/http/http';
import { Subject } from 'rxjs';
import { StatusModal } from '../../../shared/modals/status-modal/status-modal';
import { Router } from '@angular/router';
import { State } from '../../../core/services/state/state';

@Component({
  selector: 'app-employee-dashboard',
  imports: [StatusModal],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard {
  @ViewChild('modal') modal!: StatusModal;
  showSpinner = signal<boolean>(false);

  activeIndex = signal(0);

  constructor(private http: Http, private router: Router) {
    setInterval(() => {
      this.next();
    }, 4000);
  }
  next() {
    this.activeIndex.update((i) => (i + 1) % this.products()?.length);
  }

  goTo(index: number) {
    this.activeIndex.set(index);
  }
  state = inject(State);
  user = this.state.user();
  ngOnInit() {}
  ngAfterViewInit() {
    if (!(this.state.products()!?.length > 0)) {
      this.getProducts(1);
    } else {
      this.products.set(this.state.products()!);
    }
    // this.getProducts(1);
  }
  products = signal<Product[]>([]);
  // products = this.state.products();

  getProducts(category: number) {
    this.modal.showLoading();
    const $destroyed: Subject<void> = new Subject();
    const payload = {
      category: category,
    };
    this.http.getProducts(payload).subscribe({
      next: (products: Product[]) => {
        if (products && products.length > 0) {
          // this.products.set(products);
          this.state.setProduct(products);
          this.products.set(products);
          this.modal.close();
        } else {
          this.modal.showError({ message: 'No products available.' });
        }
      },
      error: (err) => {
        console.log('Products API error: ', err);
        this.modal.showError({ message: 'Network error. Please try again later.' });
      },
      complete: () => {
        $destroyed.next();
        $destroyed.complete();
      },
    });
  }
  navigateToProductPage(product: Product) {
    // this.state.setProduct(product);
    this.router.navigateByUrl(`/product/${product.id}`);
  }
}
