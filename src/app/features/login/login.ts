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
import { Router } from '@angular/router';
import { Storage } from '../../core/services/storage/storage';
import { signal } from '@angular/core';
import { User } from '../../core/models/interface';
import { Http } from '../../core/services/http/http';
import { StatusModal } from '../../shared/modals/status-modal/status-modal';
import { State } from '../../core/services/state/state';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, StatusModal],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  authError = signal<string>('');
  showSpinner = signal<boolean>(false);
  state = inject(State);
  products = this.state.products();
  @ViewChild('modal') modal!: StatusModal;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private storage: Storage,
    private api: Http
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // remember: [false],
    });
    if (this.products!?.length > 0) {
      this.storage.removeProduct();
      this.state.setProduct([]);
    }
  }

  get email(): AbstractControl {
    return this.loginForm.get('email')!;
  }
  get password(): AbstractControl {
    return this.loginForm.get('password')!;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authError.set('');
      // this.showSpinner.set(true);
      this.modal.showLoading();
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
      this.api.getUserByEmail(email).subscribe({
        next: (users) => {
          if (users && users.length > 0) {
            const user = users[0];
            if (user.password === password) {
              // this.storage.setUser(user);
              this.state.setUser(user);
              // this.showSpinner.set(false);
              this.modal.close();
              this.router.navigateByUrl('dashboard/employee');
            } else {
              // this.showSpinner.set(false);
              // this.modal.close();
              // this.authError.set('Invalid email or password.');
              this.modal.showError({
                message: 'Wrong password. Please check and try again.',
              });
            }
          } else {
            // this.authError.set('Invalid email or password.');
            this.creatUser(this.loginForm.value);
          }
        },
        error: (err) => {
          // this.showSpinner.set(false);
          // this.modal.close();
          console.error('Login API error: ', err);
          // this.authError.set('Login failed. Please try again later.');
          this.modal.showError({
            message: 'Login failed. Please try again later.',
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
  creatUser(user: User) {
    this.api.createUser(user).subscribe({
      next: (resp) => {
        if (resp?.password === user?.password) {
          // this.storage.setUser(user);
          this.state.setUser(user);
          // this.showSpinner.set(false);
          this.modal.close();
          this.router.navigateByUrl('dashboard/employee');
        } else {
          // this.showSpinner.set(false);
          // this.authError.set('Something went wrong. Please try again later.');
          this.modal.showError({
            message: 'Wrong password. Please check and try again.',
          });
        }
      },
      error: (err) => {
        // this.showSpinner.set(false);
        console.error('Login API error', err);
        // this.authError.set('Login failed. Please try again later.');
        this.modal.showError({
          message: 'Login failed. Please try again later.',
          fn: () => {
            this.loginForm.reset();
          },
        });
      },
    });
  }
}
