import { Component } from '@angular/core';
import { Storage } from '../../../core/services/storage/storage';
import { User } from '../../../core/models/interface';

@Component({
  selector: 'app-employee-dashboard',
  imports: [],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard {
  constructor(private storoge: Storage) {}

  user!: User;
  ngOnInit() {
    this.user = this.storoge.getUser();
  }
}
