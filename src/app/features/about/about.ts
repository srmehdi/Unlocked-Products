import { Component } from '@angular/core';
import { Back } from '../../shared/directives/back/back';

@Component({
  selector: 'app-about',
  imports: [Back],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {}
