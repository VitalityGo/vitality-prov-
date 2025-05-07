import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.initAuthListener();
    this.authService.user$.subscribe(user => {
      this.loading = false;
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }

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
      if (!success) {
        this.errorMessage = 'Error al iniciar sesión con Google';
      }
      // ❌ No hagas la redirección aquí
    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión con Google';
      console.error(error);
    }
  }  
}
