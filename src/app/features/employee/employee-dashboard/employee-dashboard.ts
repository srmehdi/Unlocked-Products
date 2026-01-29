import { Component, computed, HostListener, inject, signal, ViewChild } from '@angular/core';
import { Storage } from '../../../core/services/storage/storage';
import { Product, User } from '../../../core/models/interface';
import { Http } from '../../../core/services/http/http';
import { Subject } from 'rxjs';
import { StatusModal } from '../../../shared/modals/status-modal/status-modal';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from '../../../core/services/state/state';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-dashboard',
  imports: [StatusModal, CommonModule, FormsModule],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard {
  @ViewChild('modal') modal!: StatusModal;
  isLoading = signal(true);
  SUMMARY_LIMIT = 80;
  REVIEW_LIMIT = 100;
  expandedSummaries = signal<Set<number>>(new Set());
  expandedEditorReviews = signal<Set<number>>(new Set());
  showSpinner = signal<boolean>(false);

  activeIndex = signal(0);
  autoPlayInterval!: any;
  AUTO_PLAY_DELAY = 6000;

  constructor(
    private http: Http,
    private router: Router,
  ) {}
  getStarFill(rating: number, starIndex: number): number {
    const fill = Math.min(Math.max(rating - (starIndex - 1), 0), 1);
    return fill * 100;
  }

  isSummaryExpanded(index: number): boolean {
    return this.expandedSummaries().has(index);
  }

  toggleSummary(index: number) {
    if (!this.isPaused) {
      this.toggleAutoPlay();
    }
    this.resetCarouselInactivityTimer();
    const set = new Set(this.expandedSummaries());
    set.has(index) ? set.delete(index) : set.add(index);
    this.expandedSummaries.set(set);
  }

  getSummary(text: string, index: number): string {
    if (!text) return '';
    return this.isSummaryExpanded(index) || text.length <= this.SUMMARY_LIMIT
      ? text
      : text.slice(0, this.SUMMARY_LIMIT) + '…';
  }
  VAROUSEL_SUMMARY_LIMIT = 140;
  getCarouselSummary(text: string, index: number): string {
    if (!text) return '';
    return text.length <= this.VAROUSEL_SUMMARY_LIMIT
      ? text
      : text.slice(0, this.VAROUSEL_SUMMARY_LIMIT) + '…';
  }
  isReviewExpanded(index: number): boolean {
    return this.expandedEditorReviews().has(index);
  }

  toggleReview(index: number) {
    const set = new Set(this.expandedEditorReviews());
    set.has(index) ? set.delete(index) : set.add(index);
    this.expandedEditorReviews.set(set);
  }

  getReview(text: string, index: number): string {
    if (!text) return '';
    return this.isReviewExpanded(index) || text.length <= this.REVIEW_LIMIT
      ? text
      : text.slice(0, this.REVIEW_LIMIT) + '…';
  }

  // next() {
  //   this.activeIndex.update((i) => (i + 1) % this.products()?.length);
  // }
  isPaused = false;

  toggleAutoPlay() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }
  cardImageMap = new Map<number, number>();

  cardImageIndex(productId: number): number {
    return this.cardImageMap.get(productId) ?? 0;
  }

  nextCardImage(event: Event, productId: number, total: number) {
    event.stopPropagation();
    const current = this.cardImageIndex(productId);
    this.cardImageMap.set(productId, (current + 1) % total);
  }

  prevCardImage(event: Event, productId: number, total: number) {
    event.stopPropagation();
    const current = this.cardImageIndex(productId);
    this.cardImageMap.set(productId, (current - 1 + total) % total);
  }
  touchStartX = 0;

  onTouchStart(event: TouchEvent, id: number) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent, id: number, total: number) {
    const deltaX = event.changedTouches[0].screenX - this.touchStartX;
    if (Math.abs(deltaX) > 10) {
      deltaX > 0 ? this.prevCardImage(event, id, total) : this.nextCardImage(event, id, total);
    }
  }
  private zoomTouchStartX = 0;
  private zoomTouchEndX = 0;

  private readonly SWIPE_THRESHOLD = 20;
  onZoomTouchStart(event: TouchEvent) {
    this.zoomTouchStartX = event.touches[0].clientX;
  }

  onZoomTouchEnd(event: TouchEvent) {
    this.zoomTouchEndX = event.changedTouches[0].clientX;
    this.handleZoomSwipe();
  }

  private handleZoomSwipe() {
    const diff = this.zoomTouchStartX - this.zoomTouchEndX;

    if (Math.abs(diff) < this.SWIPE_THRESHOLD) return;

    if (diff > 0) {
      this.nextZoomImage();
    } else {
      this.prevZoomImage();
    }
  }
  private carouselTouchStartX = 0;
  private carouselTouchEndX = 0;

  private carouselMouseDownX = 0;
  private isDraggingCarousel = false;

  private readonly CAROUSEL_SWIPE_THRESHOLD = 30;
  onCarouselTouchStart(event: TouchEvent) {
    this.carouselTouchStartX = event.touches[0].clientX;
  }

  onCarouselTouchEnd(event: TouchEvent) {
    this.carouselTouchEndX = event.changedTouches[0].clientX;
    this.handleCarouselSwipe();
  }
  onCarouselMouseDown(event: MouseEvent) {
    this.isDraggingCarousel = true;
    this.carouselMouseDownX = event.clientX;
  }

  onCarouselMouseUp(event: MouseEvent) {
    if (!this.isDraggingCarousel) return;

    const diff = this.carouselMouseDownX - event.clientX;
    this.isDraggingCarousel = false;

    this.processCarouselSwipe(diff);
  }
  private handleCarouselSwipe() {
    const diff = this.carouselTouchStartX - this.carouselTouchEndX;
    this.processCarouselSwipe(diff);
  }

  private processCarouselSwipe(diff: number) {
    if (Math.abs(diff) < this.CAROUSEL_SWIPE_THRESHOLD) return;
    if (!this.isPaused) {
      this.toggleAutoPlay();
    }
    this.resetCarouselInactivityTimer();
    if (diff > 0) {
      this.next();
    } else {
      this.prev();
    }
  }
  next() {
    const total = this.topProducts().length;
    this.activeIndex.set((this.activeIndex() + 1) % total);
  }

  prev() {
    const total = this.topProducts().length;
    this.activeIndex.set((this.activeIndex() - 1 + total) % total);
  }
  private inactivityTimer: any;
  private readonly INACTIVITY_DELAY = 3000;
  private resetCarouselInactivityTimer() {
    clearTimeout(this.inactivityTimer);

    this.inactivityTimer = setTimeout(() => {
      if (this.isPaused) {
        this.toggleAutoPlay();
      }
    }, this.INACTIVITY_DELAY);
  }

  goTo(index: number) {
    this.activeIndex.set(index);

    if (!this.isPaused) {
      this.startAutoPlay();
    }
  }
  state = inject(State);
  user = this.state.user();
  route = inject(ActivatedRoute);
  ngOnInit() {
    setTimeout(() => {
      this.startAutoPlay();
    }, 4000);
    this.state.setProductId(null);
    this.route.queryParamMap.subscribe((params) => {
      const cat = params.get('cat');
      const sub = params.get('sub');
      cat ? this.activeCategory.set(cat!) : '';
      sub ? this.activeSubCategory.set(sub!) : '';
    });
  }
  startAutoPlay() {
    this.stopAutoPlay();

    this.autoPlayInterval = setInterval(() => {
      const total = this.topProducts().length;
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
  searchTerm = signal('');
  // filteredProducts = computed(() => {
  //   const term = this.searchTerm().toLowerCase().trim();

  //   if (!term) {
  //     return this.products();
  //   }

  //   return this.products().filter(
  //     (p) =>
  //       p.productName?.toLowerCase().includes(term) ||
  //       p.productSummary?.toLowerCase().includes(term),
  //   );
  // });
  sortBy = signal<'rating' | 'name'>('name');
  // filteredProducts = computed(() => {
  //   let products = this.products();

  //   const term = this.searchTerm().toLowerCase().trim();
  //   if (term) {
  //     products = products.filter((p) => p.productName.toLowerCase().includes(term));
  //   }
  //   switch (this.sortBy()) {
  //     case 'rating':
  //       return [...products].sort((a, b) => (b.editorRating ?? 0) - (a.editorRating ?? 0));

  //     case 'name':
  //       return [...products].sort((a, b) => a.productName.localeCompare(b.productName));

  //     default:
  //       return products;
  //   }
  // });
  // categories = signal([
  //   { id: 0, name: 'All', slug: 'all' },
  //   { id: 1, name: 'Smartphones', slug: 'smartphones' },
  //   { id: 2, name: 'Laptops', slug: 'laptops' },
  //   { id: 3, name: 'Headphones', slug: 'headphones' },
  //   { id: 4, name: 'Wearables', slug: 'wearables' },
  // ]);
  categories = this.state.categories;

  // activeCategory = signal('all');
  activeCategory = signal<string>('all');
  activeSubCategory = signal<string | null>(null);

  // searchTerm = signal('');
  // sortBy = signal<'name' | 'rating'>('name');
  // products = signal<any[]>([]);

  filteredProducts = computed(() => {
    let list = [...this.products()];

    if (this.activeCategory() !== 'all') {
      list = list.filter((p) => {
        if (this.activeCategory() && p.category !== this.activeCategory()) {
          return false;
        }

        if (this.activeSubCategory() && p.subCategory !== this.activeSubCategory()) {
          return false;
        }

        return true;
      });
    }
    if (this.searchTerm().trim()) {
      const q = this.searchTerm().toLowerCase();
      list = list.filter((p) => p.productName.toLowerCase().includes(q));
    }

    switch (this.sortBy()) {
      case 'rating':
        return list.sort((a, b) => b.editorRating - a.editorRating);

      case 'name':
        return list.sort((a, b) => a.productName.localeCompare(b.productName));

      default:
        return list;
    }

    return list;
  });
  getActiveCategory() {
    return this.categories.find((c) => c.slug === this.activeCategory());
  }
  activeSubCategoryObj = computed(() => {
    const subSlug = this.activeSubCategory();
    if (!subSlug) return null;

    for (const cat of this.categories) {
      const found = cat.subcategories?.find((sub) => sub.slug === subSlug);
      if (found) {
        return {
          category: cat,
          subcategory: found,
        };
      }
    }

    return null;
  });

  selectCategory(catSlug: string) {
    this.activeCategory.set(catSlug);
    this.activeSubCategory.set(null);
    // this.getActiveCategory()?.name! === 'All'
    //   ? this.getProductBreadCrumb.set('All Products')
    //   : this.getProductBreadCrumb.set(this.getActiveCategory()?.name!);

    this.router.navigate([], {
      queryParams: { cat: catSlug, sub: null },
      queryParamsHandling: 'merge',
    });
  }
  selectSubCategory(subSlug: string) {
    this.activeSubCategory.set(subSlug);
    // this.getActiveCategory()?.name! === 'All'
    //   ? this.getProductBreadCrumb.set('All Products')
    //   : this.getProductBreadCrumb.set(
    //       this.activeSubCategoryObj()?.category.name +
    //         ' › ' +
    //         this.activeSubCategoryObj()?.subcategory.name,
    //     );

    this.router.navigate([], {
      queryParams: {
        cat: this.activeCategory(),
        sub: subSlug,
      },
      queryParamsHandling: 'merge',
    });
  }
  getProductBreadCrumb = signal<string>('All Products');
  // openImageZoom(event: MouseEvent, src: string | undefined) {
  //   event.stopPropagation();
  //   if (!src) return;
  //   this.zoomImage.set(src);
  //   document.body.style.overflow = 'hidden';
  // }
  // closeImageZoom() {
  //   this.zoomImage.set(null);
  //   document.body.style.overflow = '';
  // }
  zoomImages = signal<string[]>([]);
  zoomIndex = signal(0);

  openImageZoom(event: Event, images: string[], index = 0) {
    this.stopAutoPlay();
    this.resetCarouselInactivityTimer();
    event.stopPropagation();
    this.zoomImages.set(images);
    this.zoomIndex.set(index);
  }

  closeImageZoom() {
    if (!this.isPaused) {
      this.toggleAutoPlay();
    }
    this.resetCarouselInactivityTimer();
    this.zoomImages.set([]);
    this.zoomIndex.set(0);
  }
  nextZoomImage() {
    this.zoomIndex.update((i) => (i + 1) % this.zoomImages().length);
  }

  prevZoomImage() {
    this.zoomIndex.update((i) => (i - 1 + this.zoomImages().length) % this.zoomImages().length);
  }
  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (!this.zoomImages().length) return;

    if (event.key === 'ArrowRight') this.nextZoomImage();
    if (event.key === 'ArrowLeft') this.prevZoomImage();
    if (event.key === 'Escape') this.closeImageZoom();
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
    this.isLoading.set(true);
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
          this.isLoading.set(false);
        } else {
          this.modal.showError({ message: 'No products available.' });
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.log('Products API error: ', err);
        this.modal.showError({ message: 'Network error. Please try again later.' });
        this.isLoading.set(false);
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
