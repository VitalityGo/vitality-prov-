// forgot-password.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  errorMessage: string = '';
  submitted: boolean = false;

  constructor(private authService: AuthService) {}

  async onSubmit() {
    this.message = '';
    this.errorMessage = '';
    this.submitted = false;

    if (!this.email) {
      this.errorMessage = 'Por favor ingrese su correo electrónico';
      return;
    }

    const success = await this.authService.resetPassword(this.email);
    if (success) {
      this.submitted = true;
      this.message = 'Se ha enviado un correo para restablecer la contraseña.';
    } else {
      this.errorMessage = 'No se pudo enviar el correo. Verifique que el correo esté registrado.';
    }
  }
}
