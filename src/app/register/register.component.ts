import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  loading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar si ya hay sesión activa al cargar el componente
    this.authService.initAuthListener();
    
    // Suscribirse al estado de autenticación
    this.authService.user$.subscribe(user => {
      this.loading = false;
      if (user) {
        console.log('Usuario ya autenticado, redirigiendo a home');
        this.router.navigate(['/home']);
      }
    });
  }

  async onSubmit() {
    this.errorMessage = '';
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
    try {
      const success = await this.authService.register(this.email, this.password, this.name);
      if (success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Ahora puedes iniciar sesión',
          confirmButtonText: 'OK'
        });
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Error al registrar el usuario';
      }
    } catch {
      this.errorMessage = 'Error inesperado al registrar';
    }
  }
}