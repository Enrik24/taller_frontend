import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegisterFormComponent } from '../components/register-form/register-form.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, RegisterFormComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss' // using own styles now
})
export class RegisterComponent {
}
