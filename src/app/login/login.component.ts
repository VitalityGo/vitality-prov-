import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkWithHref } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink, RouterLinkWithHref],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  logoUrl: string = 'assets/logo.png'; // Asegúrate de que la ruta sea correcta

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    try {
      const success = await this.authService.login(this.email, this.password);
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Email o contraseña incorrectos';
      }
    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión';
      console.error(error);
    }
  }

  async loginWithGoogle() {
    try {
      const success = await this.authService.loginWithGoogle();
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Error al iniciar sesión con Google';
      }
    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión con Google';
      console.error(error);
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}