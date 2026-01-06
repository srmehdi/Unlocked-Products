import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Storage } from '../../core/services/storage/storage';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private storage: Storage) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // remember: [false],
    });
  }

  get email(): AbstractControl {
    return this.loginForm.get('email')!;
  }
  get password(): AbstractControl {
    return this.loginForm.get('password')!;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.storage.setUser(this.loginForm.value);
      this.router.navigateByUrl('dashboard/about');
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
