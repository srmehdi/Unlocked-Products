import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StatusModal } from '../../shared/modals/status-modal/status-modal';
import { Http } from '../../core/services/http/http';
import { State } from '../../core/services/state/state';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, StatusModal, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  @ViewChild('modal') modal!: StatusModal;
  token = signal<string | null>(null);
  userId = signal<string | null>(null);
  http = inject(Http);
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  fb = inject(FormBuilder);

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  passwordMismatch() {
    const { password, confirmPassword } = this.form.value;
    return password && confirmPassword && password !== confirmPassword;
  }

  constructor(private route: ActivatedRoute, private router: Router) {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
    this.userId.set(this.route.snapshot.queryParamMap.get('id'));
  }
  onSubmit(): void {
    if (this.form.valid && !this.passwordMismatch()) {
      this.modal.showLoading();
      const payload = {
        token: this.token(),
        userId: this.userId(),
        newPassword: this.form.value.password,
      };
      this.http.resetPassword(payload).subscribe({
        next: (resp) => {
          console.log('resetPassword resp', resp);

          if (resp?.success) {
            this.modal.showSuccess({
              message:
                'Password updated successfully 🎉. You can now sign in with your credentials.',
              fn: () => {
                this.router.navigateByUrl('/login');
              },
            });
          } else {
            this.modal.showError({
              message: 'Something went wrong. Please try again later.',
            });
          }
        },
        error: (err) => {
          console.log('resetPassword error', err);
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
