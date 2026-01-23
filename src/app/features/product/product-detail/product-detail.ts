import { Component, signal, computed, inject, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { State } from '../../../core/services/state/state';
import { Experience, Product, ProductExperience } from '../../../core/models/interface';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StatusModal } from '../../../shared/modals/status-modal/status-modal';
import { Http } from '../../../core/services/http/http';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

type ZoomContent = { type: 'image'; src: string } | { type: 'video'; src: SafeResourceUrl };
@Component({
  selector: 'app-product-detail',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, StatusModal],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  @ViewChild('modal') modal!: StatusModal;
  SUMMARY_LIMIT = 150;
  REVIEW_LIMIT = 200;
  USER_REVIEW_LIMIT = 100;
  expandedSummaries = signal<Set<number>>(new Set());
  expandedEditorReviews = signal<Set<number>>(new Set());
  expandedUserReviews = signal<Set<number>>(new Set());
  state = inject(State);
  products = this.state.products();
  product = signal<Product | null>(null);

  experiences = signal<Experience[]>([]);
  experienceShared = signal<boolean>(false);
  user = this.state.user;
  monthsOptions = [1, 3, 6, 9, 12, 18, 24];
  hoveredStar = 0;
  activatedRoute = inject(ActivatedRoute);
  experienceForm: FormGroup;
  zoomContent = signal<ZoomContent | null>(null);
  fb = inject(FormBuilder);
  router = inject(Router);
  constructor(private sanitizer: DomSanitizer) {
    this.experienceForm = this.fb.group({
      comment: ['', Validators.required],
      monthsUsed: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }
  isSummaryExpanded(index: number): boolean {
    return this.expandedSummaries().has(index);
  }

  toggleSummary(index: number) {
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
  isUserReviewExpanded(index: number): boolean {
    return this.expandedUserReviews().has(index);
  }

  toggleUserReview(index: number) {
    const set = new Set(this.expandedUserReviews());
    set.has(index) ? set.delete(index) : set.add(index);
    this.expandedUserReviews.set(set);
  }

  getUserReview(text: string, index: number): string {
    if (!text) return '';
    return this.isUserReviewExpanded(index) || text.length <= this.USER_REVIEW_LIMIT
      ? text
      : text.slice(0, this.USER_REVIEW_LIMIT) + '…';
  }
  setRating(value: number) {
    this.experienceForm.patchValue({ rating: value });
  }
  blockDecimal(event: KeyboardEvent) {
    const invalidKeys = ['.', 'e', 'E', '+', '-'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
  zoomImage = signal<string | null>(null);

  // openImageZoom(src: string | undefined) {
  //   if (!src) return;
  //   this.zoomImage.set(src);
  //   document.body.style.overflow = 'hidden';
  // }
  openImageZoom(src: string) {
    this.zoomContent.set({ type: 'image', src });
  }
  openVideoZoom(youtubeUrl: string) {
    const embedUrl = this.getYoutubeEmbedUrl(youtubeUrl);
    console.log('embedUrl', embedUrl);

    if (!embedUrl) return;

    this.zoomContent.set({
      type: 'video',
      src: this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl),
    });
  }
  closeZoom() {
    this.zoomContent.set(null);
  }
  getYoutubeEmbedUrl(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
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
  goToLogin() {
    this.router.navigate(['/login']);
  }

  get comment() {
    return this.experienceForm.get('comment')!;
  }

  get monthsUsed() {
    return this.experienceForm.get('monthsUsed')!;
  }

  get rating() {
    return this.experienceForm.get('rating')!;
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id') ? params.get('id') : 0;
      const product = this.products?.find((p) => {
        return p.id === +id!;
      });
      this.product.set(product ? product : null);
    });
    // this.fetchExperiences();
  }
  ngAfterViewInit() {
    this.fetchExperiences();
  }
  fetchExperiences() {
    this.modal.showLoading();
    const payload = {
      productId: this.product()?.id!,
    };
    this.http.fetchExperiences(payload).subscribe(
      {
        next: (resp) => {
          console.log('fetchExperiences resp', resp);

          if (resp?.length >= 0) {
            this.experiences.set(resp);
            const sharedExperience = resp.filter((exp: { mail: string | undefined }) => {
              return exp.mail === this.user()?.email;
            });
            sharedExperience.length > 0
              ? this.experienceShared.set(true)
              : this.experienceShared.set(false);
            this.modal.close();
          } else if (resp?.error) {
            this.modal.showError({
              message: resp.error,
            });
          } else {
            this.modal.showError({
              message: 'Something went wrong. Please try again later.',
            });
          }
        },
        error: (err) => {
          console.log('fetchExperiences error', err);
          this.modal.showError({
            // message: 'Something went wrong. Please try again later.',
            message: err?.error?.error,
            // fn: () => {
            //   this.experienceForm.reset();
            // },
          });
        },
      },
      //   (data) => {

      //   this.experiences.set(data);
      // }
    );
  }
  sortBy = signal<'recent' | 'longest' | 'helpful'>('recent');
  isOpen = signal(false);

  sortLabel = computed(() => {
    switch (this.sortBy()) {
      case 'longest':
        return 'Longest Use';
      case 'helpful':
        return 'Most Helpful';
      default:
        return 'Most Recent';
    }
  });

  userScore = computed(() => {
    const list = this.experiences();
    return list.length ? (list.reduce((s, e) => s + e.rating, 0) / list.length).toFixed(1) : '0';
  });

  sortedExperiences = computed(() => {
    const list = [...this.experiences()];
    switch (this.sortBy()) {
      case 'longest':
        return list.sort((a, b) => b.monthsUsed - a.monthsUsed);
      case 'helpful':
        return list.sort((a, b) => b.helpful - b.notHelpful - (a.helpful - a.notHelpful));
      default:
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  });

  vote(id: number, type: 'helpful' | 'notHelpful') {
    this.experiences.update((list) =>
      list.map((exp) => (exp.id === id ? { ...exp, [type]: exp[type] + 1 } : exp)),
    );
  }
  formatTimeAgo(dateString: string): string {
    if (!dateString) return 'just now';
    const cleaned = dateString.replace(' ', 'T').replace(/\.\d+$/, '');

    const past = new Date(cleaned);

    if (isNaN(past.getTime())) return 'just now';

    const seconds = Math.floor((Date.now() - past.getTime() - 19800000) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;

    return `${Math.floor(seconds / 31536000)} years ago`;
  }

  http = inject(Http);
  submitExperience(): void {
    if (this.experienceForm.valid && this.user()) {
      this.modal.showLoading();
      const payload: ProductExperience = {
        productId: this.product()?.id!,
        userId: this.user()?.id!,
        comment: this.experienceForm.value.comment,
        monthsUsed: this.experienceForm.value.monthsUsed,
        rating: this.experienceForm.value.rating,
      };
      this.http.submitExperience(payload).subscribe({
        next: (resp) => {
          console.log('submitExperience resp', resp);

          if (resp?.success) {
            this.modal.showSuccess({
              message: 'Thank you for sharing your experience!.',
              fn: () => {
                const currentUrl = this.router.url;
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate([currentUrl]);
                });
              },
            });
          } else if (resp?.error) {
            this.modal.showError({
              message: resp.error,
            });
          } else {
            this.modal.showError({
              message: 'Something went wrong. Please try again later.',
            });
          }
        },
        error: (err) => {
          console.log('submitExperience error', err);
          this.modal.showError({
            // message: 'Something went wrong. Please try again later.',
            message: err?.error?.error,
            // fn: () => {
            //   this.experienceForm.reset();
            // },
          });
        },
      });
    } else {
      this.experienceForm.markAllAsTouched();
    }
  }
}
