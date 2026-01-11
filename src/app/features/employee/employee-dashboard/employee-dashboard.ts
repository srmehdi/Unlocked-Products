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

  // products = signal([
  //     {
  //       name: 'Product Alpha',
  //       rating: 4.9,
  //       stars: '★★★★★',
  //       image: 'assets/images/logo.svg'
  //     },
  //     {
  //       name: 'Product Beta',
  //       rating: 4.7,
  //       stars: '★★★★☆',
  //       image: 'assets/images/logo.svg'
  //     },
  //     {
  //       name: 'Product Gamma',
  //       rating: 4.6,
  //       stars: '★★★★☆',
  //       image: 'assets/images/logo.svg'
  //     },
  //     {
  //       name: 'Product Delta',
  //       rating: 4.5,
  //       stars: '★★★★☆',
  //       image: 'assets/images/logo.svg'
  //     },
  //     {
  //       name: 'Product Omega',
  //       rating: 4.4,
  //       stars: '★★★★☆',
  //       image: 'assets/images/logo.svg'
  //     }
  //   ]);

  activeIndex = signal(0);

  constructor(
    private storoge: Storage,
    private http: Http,
    private router: Router // private state: State
  ) {
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
  ngOnInit() {
    // this.user = this.storoge.getUser();
    // this.user = this.state.user;
    // this.getProducts(1);
  }
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
    // this.showSpinner.set(true);
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
    this.router.navigateByUrl(`/dashboard/product/${product.id}`);
  }
}
