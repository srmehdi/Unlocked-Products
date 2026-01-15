import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StatusModal } from '../../shared/modals/status-modal/status-modal';
import { Http } from '../../core/services/http/http';
import { State } from '../../core/services/state/state';
import { User } from '../../core/models/interface';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, StatusModal, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  @ViewChild('modal') modal!: StatusModal;
  registered = signal(false);
  // loading = signal(false);
  registerForm!: FormGroup;
  fb = inject(FormBuilder);
  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  get name() {
    return this.registerForm.controls['name'];
  }

  get email() {
    return this.registerForm.controls['email'];
  }

  passwordMismatch() {
    const { password, confirmPassword } = this.registerForm.value;
    return password && confirmPassword && password !== confirmPassword;
  }
  http = inject(Http);
  state = inject(State);
  router = inject(Router);
  onSubmit(): void {
    if (this.registerForm.valid && !this.passwordMismatch()) {
      this.modal.showLoading();
      const payload: User = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        role: [2],
      };
      this.http.createUser(payload).subscribe({
        next: (resp) => {
          console.log('createUser resp', resp);

          if (resp?.email === this.registerForm.value?.email) {
            this.modal.showSuccess({
              message: 'Account Created. You can now sign in with your credentials.',
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
          console.log('createUser error', err);
          this.modal.showError({
            // message: 'Something went wrong. Please try again later.',
            message: err?.error?.error,
            // fn: () => {
            //   this.registerForm.reset();
            // },
          });
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
