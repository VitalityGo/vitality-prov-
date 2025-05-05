import { Component } from '@angular/core';
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
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

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
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'Error al registrar el usuario';
      }
    } catch {
      this.errorMessage = 'Error inesperado al registrar';
    }
  }
}
