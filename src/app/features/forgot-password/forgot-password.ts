import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StatusModal } from '../../shared/modals/status-modal/status-modal';
import { Router, RouterLink } from '@angular/router';
import { Http } from '../../core/services/http/http';
import { Back } from '../../shared/directives/back/back';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, StatusModal, RouterLink, Back],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  @ViewChild('modal') modal!: StatusModal;
  emailSent = signal(false);
  isSubmitting = signal(false);
  rateLimitMessage = signal<string | null>(null);
  http = inject(Http);
  form!: FormGroup;
  private lastRequestTime = 0;
  private RATE_LIMIT_MS = 30000; // 30 seconds

  fb = inject(FormBuilder);
  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.form.controls['email'];
  }

  // submit() {
  //   const now = Date.now();
  //   if (now - this.lastRequestTime < this.RATE_LIMIT_MS) {
  //     this.rateLimitMessage.set('Please wait 30 seconds before trying again.');
  //     setTimeout(() => {
  //       this.rateLimitMessage.set(null);
  //     }, this.RATE_LIMIT_MS);
  //     return;
  //   }
  //   this.emailSent.set(false);
  //   this.rateLimitMessage.set(null);
  //   this.isSubmitting.set(true);
  //   this.lastRequestTime = now;
  // }
  router = inject(Router);
  onSubmit(): void {
    if (this.form.valid) {
      this.modal.showLoading();
      const payload = {
        email: this.form.value.email,
      };
      this.http.sendResetMail(payload).subscribe({
        next: (resp) => {
          console.log('sendResetMail resp', resp);

          if (resp?.success) {
            this.modal.showSuccess({
              message: 'Email Sent. Please check your inbox and follow the instructions.',
              fn: () => {
                this.router.navigateByUrl('/login');
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
          console.log('sendResetMail error', err);
          this.modal.showError({
            // message: 'Something went wrong. Please try again later.',
            message: err?.error?.error,
            fn: () => {
              this.form.reset();
            },
          });
        },
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
