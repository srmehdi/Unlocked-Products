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
  category: number;
  editorReview: string;
  editorRating: number;
  imageBase64: string[];
}

export interface Experience {
  id: number;
  user: string;
  rating: any;
  comment: string;
  monthsUsed: any;
  createdAt: Date;
  helpful: number;
  notHelpful: number;
}
export interface ProductPayload {
  productName: string;
  productSummary: string;
  editorReview: string;
  editorRating: number;
  imageBase64: string[];
}
export interface HttpResponse<T> {
  hasError: boolean;
  businessMessage: string;
  data: T;
}
