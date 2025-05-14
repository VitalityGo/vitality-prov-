import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkWithHref } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Platform } from '@ionic/angular';

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
  isMobile: boolean = false;
  
  // Credenciales de administrador
  private adminEmail: string = 'vitalitygo5@gmail.com';
  private adminPassword: string = 'vitalitygo123';

  constructor(
    private authService: AuthService,
    private router: Router,
    private platform: Platform
  ) {
    // Detectar si estamos en un dispositivo móvil
    this.isMobile = this.platform.is('capacitor') || this.platform.is('cordova') || this.platform.is('ios') || this.platform.is('android');
  }

  ngOnInit() {
    console.log('LoginComponent inicializado, isMobile:', this.isMobile);
    this.authService.initAuthListener();
    this.authService.user$.subscribe(user => {
      this.loading = false;
      if (user) {
        // La redirección se maneja en onSubmit para verificar si es admin
        console.log('Usuario autenticado');
      } else {
        console.log('No hay usuario autenticado');
      }
    });
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    try {
      console.log('Intentando iniciar sesión con email:', this.email);
      
      // Verificar si son las credenciales de administrador
      if (this.email === this.adminEmail && this.password === this.adminPassword) {
        const success = await this.authService.login(this.email, this.password);
        if (success) {
          console.log('Inicio de sesión de administrador exitoso, redirigiendo a /admin');
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = 'Error al iniciar sesión como administrador';
        }
      } else {
        // Caso de usuario normal
        const success = await this.authService.login(this.email, this.password);
        if (success) {
          console.log('Inicio de sesión exitoso, redirigiendo a /home');
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Email o contraseña incorrectos';
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.errorMessage = 'Error al iniciar sesión';
    }
  }

  async loginWithGoogle() {
    try {
      console.log('Intentando iniciar sesión con Google');
      // El método loginWithGoogle se encargará de determinar si usar popup o redirect
      const success = await this.authService.loginWithGoogle();
      if (!success) {
        this.errorMessage = 'Error al iniciar sesión con Google';
        console.error('Inicio de sesión con Google fallido');
      }
      // No realizar ninguna redirección aquí, ya que el servicio de autenticación
      // se encargará de manejar la redirección después de que el usuario inicie sesión
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      this.errorMessage = 'Error al iniciar sesión con Google';
    }
  }
}