import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { State } from '../../../core/services/state/state';
import { StatusModal } from '../../../shared/modals/status-modal/status-modal';
import { ProductPayload } from '../../../core/models/interface';
import { Http } from '../../../core/services/http/http';
import { Router } from '@angular/router';
import { Storage } from '../../../core/services/storage/storage';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusModal],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  addProductForm!: FormGroup;
  @ViewChild('modal') modal!: StatusModal;
  state = inject(State);
  router = inject(Router);
  user = this.state.user;
  images = signal<string[]>([]);

  fb = inject(FormBuilder);
  api = inject(Http);
  storage = inject(Storage);
  ngOnInit() {
    this.createAddProductForm();
  }
  createAddProductForm() {
    this.addProductForm = this.fb.group({
      productName: ['', [Validators.required]],
      productSummary: ['', [Validators.required]],
      editorReview: ['', [Validators.required]],
      // editorRating: ['', [Validators.required]],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }
  onImagesUpload(event: Event) {
    const MAX_FILE_SIZE = 200 * 1024;
    const MAX_FILES = 3;
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (this.images().length + files.length > MAX_FILES) {
      this.modal.showError({
        message: `Maximum ${MAX_FILES} images are allowed to upload.`,
      });
      return;
    }
    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        this.modal.showError({
          message: `Image "${file.name}" exceeds 200 KB limit.`,
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.modal.showError({
          message: `File "${file.name}" is not a valid image.`,
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.images.update((imgs) => [...imgs, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number) {
    this.images.update((imgs) => imgs.filter((_, i) => i !== index));
  }
  setRating(value: number) {
    this.addProductForm.patchValue({ rating: value });
  }
  hoveredStar = 0;
  get rating() {
    return this.addProductForm.get('rating')!;
  }
  products = this.state.products();
  onSubmit(): void {
    if (this.addProductForm.valid && this.images().length > 0) {
      this.modal.showLoading();
      const payload: ProductPayload = {
        productName: this.addProductForm.get('productName')?.value,
        productSummary: this.addProductForm.get('productSummary')?.value,
        editorRating: this.addProductForm.get('rating')?.value,
        editorReview: this.addProductForm.get('editorReview')?.value,
        imageBase64: this.images(),
      };
      this.api.addProducts(payload).subscribe({
        next: (product) => {
          if (product) {
            this.modal.showSuccess({
              message: 'Product added succesfully.',
              fn: () => {
                // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                //   this.router.navigate([this.router.url]);
                // });
                if (this.products!?.length > 0) {
                  this.storage.removeProduct();
                  this.state.setProduct([]);
                }
                this.router.navigateByUrl('/');
              },
            });
          } else {
            this.modal.showError({
              message: 'Something went wrong. Please check and try again.',
            });
          }
        },
        error: (err) => {
          // this.showSpinner.set(false);
          // this.modal.close();
          console.error('Addd product API error: ', err);
          // this.authError.set('Login failed. Please try again later.');
          this.modal.showError({
            message: 'Product addition failed. Please try again later.',
            fn: () => {
              // this.addProductForm.reset();
            },
          });
        },
      });
    } else if (!this.addProductForm.valid && this.images().length > 0) {
      this.modal.showError({
        message: 'Please fill the required fields.',
      });
    } else if (this.addProductForm.valid && this.images().length <= 0) {
      this.modal.showError({
        message: 'Please upload a product image.',
      });
    } else {
      this.modal.showError({
        message: 'Please fill the required fields and upload a product image.',
      });
    }
  }
}
