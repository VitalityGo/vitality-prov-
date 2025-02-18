import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Importa CommonModule
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  name: string = '';
  weight: number = 0; // en kg
  age: number = 0; // en años
  height: number = 0; // en cm
  bodyFatPercentage: number = 0; // en porcentaje

  // Método para calcular el IMC
  calculateBMI(): number {
    if (this.height > 0) {
      const heightInMeters = this.height / 100; // Convertir cm a metros
      return this.weight / (heightInMeters * heightInMeters);
    }
    return 0; // Asegúrate de devolver 0 si la altura no es válida
  }

  // Método para calcular las calorías diarias necesarias
  calculateDailyCalories(): number {
    let bmr: number;

    const isMale = true; // Cambiar según el género
    if (isMale) {
      bmr = 88.362 + (13.397 * this.weight) + (4.799 * this.height) - (5.677 * this.age);
    } else {
      bmr = 447.593 + (9.247 * this.weight) + (3.098 * this.height) - (4.330 * this.age);
    }

    const activityLevel = 1.2; // Sedentario (ajusta según el nivel de actividad)
    return Math.round(bmr * activityLevel);
  }
}