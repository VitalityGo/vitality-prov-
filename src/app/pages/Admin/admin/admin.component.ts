import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartTypeRegistry } from 'chart.js';
import { AuthService } from '../../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Estadísticas
  stepsAverage: number = 0;
  waterAverage: number = 0;
  appLogins: number = 0;
  weightEntries: number = 0;

  today: Date = new Date();

  dateLabels: string[] = [];
  stepsData: number[] = [];
  waterData: number[] = [];
  loginsData: number[] = [];
  weightData: number[] = [];

  chartType: keyof ChartTypeRegistry = 'line';

  // Opciones de cada gráfico
  public stepsChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Pasos Promedio'
      }
    }
  };

  public waterChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Agua Bebida (ml)'
      }
    }
  };

  public loginsChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Ingresos a la App'
      }
    }
  };

  public weightChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Pesos Registrados'
      }
    }
  };

  // Configuración de gráficos
  public stepsChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Pasos diarios',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        borderColor: 'rgba(0, 123, 255, 1)',
        pointBackgroundColor: 'rgba(0, 123, 255, 1)',
        fill: true,
        tension: 0.4
      }
    ],
    labels: []
  };

  public waterChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Agua (ml)',
        backgroundColor: 'rgba(32, 201, 151, 0.2)',
        borderColor: 'rgba(32, 201, 151, 1)',
        pointBackgroundColor: 'rgba(32, 201, 151, 1)',
        fill: true,
        tension: 0.4
      }
    ],
    labels: []
  };

  public loginsChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Ingresos',
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderColor: 'rgba(255, 193, 7, 1)',
        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
        fill: true,
        tension: 0.4
      }
    ],
    labels: []
  };

  public weightChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Registros de peso',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        borderColor: 'rgba(220, 53, 69, 1)',
        pointBackgroundColor: 'rgba(220, 53, 69, 1)',
        fill: true,
        tension: 0.4
      }
    ],
    labels: []
  };

  constructor(private authService: AuthService) {
    // Verificación adicional de seguridad
    this.authService.isAdmin().pipe(take(1)).subscribe(isAdmin => {
      if (!isAdmin) {
        window.location.href = '/'; // Redirección forzada
      }
    });
  }

  ngOnInit(): void {
    this.generateDateLabels(7);
    this.generateChartData();
    this.generateTodayStats();

    // Asignar etiquetas y datos a los gráficos después de generarlos
    this.stepsChartData.labels = [...this.dateLabels];
    this.waterChartData.labels = [...this.dateLabels];
    this.loginsChartData.labels = [...this.dateLabels];
    this.weightChartData.labels = [...this.dateLabels];

    this.stepsChartData.datasets[0].data = [...this.stepsData];
    this.waterChartData.datasets[0].data = [...this.waterData];
    this.loginsChartData.datasets[0].data = [...this.loginsData];
    this.weightChartData.datasets[0].data = [...this.weightData];

    // Forzar actualización del gráfico
    setTimeout(() => {
      this.chart?.update();
    }, 0);

    // Autoactualización cada 5 minutos
    setInterval(() => {
      this.updateTodayStats();
      this.updateCharts();
    }, 5 * 60 * 1000);
  }

  generateDateLabels(days: number): void {
    this.dateLabels = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      this.dateLabels.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }
  }

  generateChartData(): void {
    const today = new Date();
    const seed = today.getDate() + (today.getMonth() + 1) * 100;

    const randomValueForDay = (min: number, max: number, day: number, offset: number = 0): number => {
      const daySeed = seed + day + offset;
      return Math.floor(Math.abs(Math.sin(daySeed)) * (max - min + 1)) + min;
    };

    for (let i = 0; i < 7; i++) {
      const dayOffset = i - 3; // centra el rango de días
      const trendFactor = 1 + (dayOffset * 0.03);

      this.stepsData.push(Math.round(randomValueForDay(8000, 12000, i, 1) * trendFactor));
      this.waterData.push(Math.round(randomValueForDay(1800, 2500, i, 2) * trendFactor));
      this.loginsData.push(Math.round(randomValueForDay(300, 700, i, 3) * trendFactor));
      this.weightData.push(Math.round(randomValueForDay(40, 120, i, 4) * trendFactor));
    }
  }

  generateTodayStats(): void {
    this.stepsAverage = this.stepsData[this.stepsData.length - 1];
    this.waterAverage = this.waterData[this.waterData.length - 1];
    this.appLogins = this.loginsData[this.loginsData.length - 1];
    this.weightEntries = this.weightData[this.weightData.length - 1];
  }

  updateTodayStats(): void {
    const updateWithVariation = (value: number): number => {
      const variation = (Math.random() * 0.1) - 0.05;
      return Math.round(value * (1 + variation));
    };

    this.stepsAverage = updateWithVariation(this.stepsAverage);
    this.waterAverage = updateWithVariation(this.waterAverage);
    this.appLogins = updateWithVariation(this.appLogins);
    this.weightEntries = updateWithVariation(this.weightEntries);
  }

  updateCharts(): void {
    this.stepsData[this.stepsData.length - 1] = this.stepsAverage;
    this.waterData[this.waterData.length - 1] = this.waterAverage;
    this.loginsData[this.loginsData.length - 1] = this.appLogins;
    this.weightData[this.weightData.length - 1] = this.weightEntries;

    this.stepsChartData.datasets[0].data = [...this.stepsData];
    this.waterChartData.datasets[0].data = [...this.waterData];
    this.loginsChartData.datasets[0].data = [...this.loginsData];
    this.weightChartData.datasets[0].data = [...this.weightData];

    this.chart?.update();
  }
}
