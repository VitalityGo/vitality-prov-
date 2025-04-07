import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';  // Cambiado desde NgChartsModule
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective]  // Cambiado desde NgChartsModule
})
export class HomeComponent implements OnInit {
  steps: number = 0;
  waterIntake: number = 0;
  weightData: number[] = [];
  weight: number = 0;
  customWaterAmount: number = 500; // Cantidad de agua ingresada por el usuario (ml)
  customStepsAmount: number = 1000; // Cantidad de pasos ingresada por el usuario

  // Variables para el podómetro
  lastX: number = 0;  // Inicializamos con 0 en lugar de null
  lastY: number = 0;  // Inicializamos con 0 en lugar de null
  lastZ: number = 0;  // Inicializamos con 0 en lugar de null
  threshold: number = 20; // Umbral para detectar el movimiento

  // Configuración del gráfico
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: this.weightData,
        label: 'Peso (kg)',
        backgroundColor: 'rgba(60,140,231,0.2)',
        borderColor: '#3C8CE7',
        pointBackgroundColor: '#3C8CE7',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3C8CE7',
        fill: 'origin',
      }
    ],
    labels: ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5']
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Registro de Peso'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  constructor() {}

  ngOnInit() {
    this.loadInitialData();
    this.startMotionTracking();
  }

  loadInitialData() {
    this.steps = 0;
    this.waterIntake = 2;
    this.weightData = [70, 71, 69, 68, 70];
    this.updateChartData();
  }

  // Función para actualizar los pasos manualmente
  addCustomSteps() {
    if (this.customStepsAmount > 0) {
      this.steps += this.customStepsAmount;
      this.customStepsAmount = 1000; // Reiniciamos el input con un valor por defecto
    }
  }

  // Función para actualizar la cantidad de agua
  updateWaterIntake() {
    this.waterIntake += 0.5;
  }

  // Función para agregar la cantidad personalizada de agua
  addCustomWaterIntake() {
    if (this.customWaterAmount > 0) {
      this.waterIntake += this.customWaterAmount / 1000; // Convertimos ml a litros
      this.customWaterAmount = 500; // Reiniciamos el input con un valor por defecto
    }
  }

  // Función para registrar el peso
  updateWeight() {
    if (this.weight > 0) {
      this.weightData.push(this.weight);
      this.updateChartData();
      this.weight = 0;
    }
  }

  private updateChartData() {
    this.lineChartData.datasets[0].data = [...this.weightData];
    this.lineChartData = { ...this.lineChartData };
    
    const numberOfDays = this.weightData.length;
    this.lineChartData.labels = Array.from({ length: numberOfDays }, (_, i) => `Día ${i + 1}`);
  }

  // Función para comenzar a escuchar los eventos de aceleración (podómetro)
  startMotionTracking() {
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', this.onDeviceMotion.bind(this), false);
    } else {
      console.warn('El dispositivo no soporta la API DeviceMotion');
    }
  }

  // Maneja los eventos de movimiento del dispositivo (actualiza el contador de pasos)
  onDeviceMotion(event: DeviceMotionEvent) {
    const x = event.accelerationIncludingGravity?.x ?? 0;  // Usamos el operador nullish coalescing (??) para asegurar que x nunca sea undefined
    const y = event.accelerationIncludingGravity?.y ?? 0;
    const z = event.accelerationIncludingGravity?.z ?? 0;

    this.trackSteps(x, y, z);
  }

  // Función para actualizar el contador de pasos (podómetro)
  trackSteps(x: number, y: number, z: number) {
    const delta = Math.abs(x + y + z - this.lastX - this.lastY - this.lastZ);
    if (delta > this.threshold) {
      this.steps += 1; // Incrementar el contador de pasos si detectamos movimiento
    }

    // Guardamos los valores actuales de X, Y, Z para la próxima lectura
    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;

    this.updateStepDisplay();
  }

  // Actualiza el contador de pasos en la interfaz
  updateStepDisplay() {
    console.log(`Pasos actuales: ${this.steps}`);
  }
}
