import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { State } from '../../../core/services/state/state';
import { Experience, Product } from '../../../core/models/interface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  state = inject(State);
  products = this.state.products();
  product = signal<Product | null>(null);
  // product = {
  //   name: 'Product Alpha',
  //   image: 'https://via.placeholder.com/500',
  //   editorReview: 'Tested for months. Excellent performance, but battery fades with heavy use.',
  // };

  experiences = signal<Experience[]>([
    {
      id: 1,
      user: 'Alex',
      rating: 4,
      comment: 'Battery degraded after 6 months.',
      monthsUsed: 6,
      createdAt: new Date('2024-01-10'),
      helpful: 12,
      notHelpful: 1,
    },
    {
      id: 2,
      user: 'Amir',
      rating: 5,
      comment: 'No issues after long-term daily use.',
      monthsUsed: 5,
      createdAt: new Date('2024-02-05'),
      helpful: 18,
      notHelpful: 0,
    },
    {
      id: 3,
      user: 'Alan',
      rating: 5,
      comment: 'No issues after long-term daily use.',
      monthsUsed: 5,
      createdAt: new Date('2024-02-05'),
      helpful: 18,
      notHelpful: 0,
    },
    {
      id: 4,
      user: 'John',
      rating: 5,
      comment: 'No issues after long-term daily use.',
      monthsUsed: 5,
      createdAt: new Date('2024-02-05'),
      helpful: 18,
      notHelpful: 0,
    },
    {
      id: 5,
      user: 'John Walker',
      rating: 5,
      comment: 'No issues after long-term daily use.',
      monthsUsed: 5,
      createdAt: new Date('2024-02-05'),
      helpful: 45,
      notHelpful: 12,
    },
    {
      id: 6,
      user: 'Alan Becker',
      rating: 5,
      comment: 'No issues after long-term daily use.',
      monthsUsed: 5,
      createdAt: new Date('2024-02-05'),
      helpful: 78,
      notHelpful: 13,
    },
  ]);
  activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id') ? params.get('id') : 0;
      const product = this.products?.find((p) => {
        return p.id === +id!;
      });
      this.product.set(product ? product : null);
    });
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
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  });

  newExperience: Experience = {
    id: 0,
    user: '',
    rating: '',
    comment: '',
    monthsUsed: '',
    createdAt: new Date(),
    helpful: 0,
    notHelpful: 0,
  };

  submitExperience() {
    this.experiences.update((list) => [
      {
        ...this.newExperience,
        id: Date.now(),
        createdAt: new Date(),
      },
      ...list,
    ]);

    this.newExperience = {
      id: 0,
      user: '',
      rating: 5,
      comment: '',
      monthsUsed: 1,
      createdAt: new Date(),
      helpful: 0,
      notHelpful: 0,
    };
  }

  vote(id: number, type: 'helpful' | 'notHelpful') {
    this.experiences.update((list) =>
      list.map((exp) => (exp.id === id ? { ...exp, [type]: exp[type] + 1 } : exp))
    );
  }
}
