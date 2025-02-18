import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements AfterViewInit {
  ngAfterViewInit() {
    this.drawStepsChart();
    this.drawWaterChart();
    this.drawWeightChart();
  }

  // Gráfico de Pasos Realizados
  drawStepsChart() {
    const canvas = document.getElementById('myStepsChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    const data = {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      datasets: [{
        label: 'Pasos Realizados',
        data: [10000, 12000, 8000, 15000, 9000, 11000, 13000],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    // Crea el gráfico
    new (window as any).Chart(ctx, {
      type: 'bar',
      data: data,
      options: options
    });
  }

  // Gráfico de Agua Bebida
  drawWaterChart() {
    const canvas = document.getElementById('myWaterChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    const data = {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      datasets: [{
        label: 'Agua Bebida (litros)',
        data: [2, 2.5, 2, 3, 2, 2.5, 3],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    // Crea el gráfico
    new (window as any).Chart(ctx, {
      type: 'line',
      data: data,
      options: options
    });
  }

  // Gráfico de Peso Corporal
  drawWeightChart() {
    const canvas = document.getElementById('myWeightChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    const data = {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      datasets: [{
        label: 'Peso Corporal (kg)',
        data: [70, 71, 70.5, 70, 69.8, 70, 69.5],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    // Crea el gráfico
    new (window as any).Chart(ctx, {
      type: 'line',
      data: data,
      options: options
    });
  }
}
