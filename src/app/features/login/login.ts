import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Storage } from '../../core/services/storage/storage';
import { signal } from '@angular/core';
import { HttpResponse, User } from '../../core/models/interface';
import { Http } from '../../core/services/http/http';
import { StatusModal } from '../../shared/modals/status-modal/status-modal';
import { State } from '../../core/services/state/state';
import { Back } from '../../shared/directives/back/back';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, StatusModal, RouterLink, Back],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  state = inject(State);
  products = this.state.products();
  @ViewChild('modal') modal!: StatusModal;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private storage: Storage,
    private api: Http,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    // if (this.products!?.length > 0) {
    //   this.storage.removeProduct();
    //   this.state.setProduct([]);
    // }
  }

  get email(): AbstractControl {
    return this.loginForm.get('email')!;
  }
  get password(): AbstractControl {
    return this.loginForm.get('password')!;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.modal.showLoading();
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
      const payload: User = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };
      this.api.getUser(payload).subscribe({
        next: (resp) => {
          console.log('getUser resp', resp);

          if (!resp?.hasError) {
            const user = resp.data[0];

            this.state.setUser(user);
            this.modal.close();
            this.router.navigateByUrl('/');
          } else {
            this.modal.showError({
              message: resp?.businessMessage,
              // message: 'You are not registered.',
            });
          }
        },
        error: (err) => {
          console.log('getUser error', err);
          this.modal.showError({
            // message: 'Login failed. Please try again later.',
            message: err?.error?.businessMessage,
            fn: () => {
              this.loginForm.reset();
            },
          });
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
