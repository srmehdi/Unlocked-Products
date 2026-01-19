import { Component, HostListener, inject, signal, ViewChild } from '@angular/core';
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
  autoPlayInterval!: any;
  AUTO_PLAY_DELAY = 5000;

  constructor(
    private http: Http,
    private router: Router,
  ) {}
  next() {
    this.activeIndex.update((i) => (i + 1) % this.products()?.length);
  }
  isPaused = false;

  toggleAutoPlay() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  goTo(index: number) {
    this.activeIndex.set(index);

    if (!this.isPaused) {
      this.startAutoPlay();
    }
  }
  state = inject(State);
  user = this.state.user();
  ngOnInit() {
    setTimeout(() => {
      this.startAutoPlay();
    }, 1200);
  }
  startAutoPlay() {
    this.stopAutoPlay();

    this.autoPlayInterval = setInterval(() => {
      const total = this.products().length;
      if (!total) return;

      this.activeIndex.set((this.activeIndex() + 1) % total);
    }, this.AUTO_PLAY_DELAY);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  ngAfterViewInit() {
    // if (!(this.state.products()!?.length > 0)) {
    //   this.getProducts(1);
    // } else {
    //   this.products.set(this.state.products()!);
    // }
    this.getProducts(1);
  }
  zoomImage = signal<string | null>(null);

  openImageZoom(event: MouseEvent, src: string | undefined) {
    event.stopPropagation();
    if (!src) return;
    this.zoomImage.set(src);
    document.body.style.overflow = 'hidden';
  }
  closeImageZoom() {
    this.zoomImage.set(null);
    document.body.style.overflow = '';
  }
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.zoomImage()) {
      this.closeImageZoom();
    }
  }
  products = signal<Product[]>([]);
  topProducts = signal<Product[]>([]);
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
          const tp = this.getTop5Products(products);
          this.topProducts.set(tp);
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
  getTop5Products(productz: Product[]): Product[] {
    return [...productz].sort((a, b) => b.editorRating - a.editorRating).slice(0, 5);
  }
  navigateToProductPage(product: Product) {
    // this.state.setProduct(product);
    this.router.navigateByUrl(`/product/${product.id}`);
  }
}
