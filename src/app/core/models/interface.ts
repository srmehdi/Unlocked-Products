import { SafeResourceUrl } from '@angular/platform-browser';

export interface User {
  id?: number;
  name?: string;
  email: string;
  password: string;
  role?: number[];
}

export interface Product {
  id?: number;
  productName: string;
  productSummary: string;
  userRating: number;
  totalUsersRated: number;
  category: string;
  subCategory: string;
  editorReview: string;
  editorRating: number;
  imageBase64: string[];
  youtubeUrl?: string;
}

export interface Experience {
  id: number;
  userId: number;
  userName: string;
  mail: string;
  rating: any;
  comment: string;
  monthsUsed: any;
  createdAt: Date;
  helpful?: number;
  notHelpful?: number;
}
export interface ProductPayload {
  productName: string;
  productSummary: string;
  youtubeUrl: string;
  editorReview: string;
  editorRating: number;
  imageBase64: string[];
  category: string;
  subCategory: string;
}
export interface ProductExperience {
  id?: number;
  productId: number;
  userId: number;
  comment: string;
  monthsUsed: number;
  rating: number;
}
export interface HttpResponse<T> {
  hasError: boolean;
  businessMessage: string;
  data: T;
}

export type ZoomContent = { type: 'image'; src: string } | { type: 'video'; src: SafeResourceUrl };

// export interface Category {
//   id: number;
//   name: string;
//   slug: string;
// }
export interface Category {
  name: string;
  slug: string;
  icon?: string;
  subcategories?: {
    name: string;
    slug: string;
  }[];
}
