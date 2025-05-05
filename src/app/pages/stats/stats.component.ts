import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { FirestoreService, UserData } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { Langs } from '../../../assets/i18n/en';
import { LanguageService } from '../../services/language.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  public lang = Langs;
  currentLanguage: 'en' | 'es' = 'es';
  userId: string | null = null;
  userData: UserData | null = null;

  // Configuración de gráficos
  public stepsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [this.getTranslation({ en: 'Today', es: 'Hoy' })],
    datasets: [{
      label: this.getTranslation(this.lang.STATS.STEPS),
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  public waterChartData: ChartConfiguration<'line'>['data'] = {
    labels: [this.getTranslation({ en: 'Today', es: 'Hoy' })],
    datasets: [{
      label: this.getTranslation(this.lang.STATS.WATER),
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      tension: 0.4,
      fill: true
    }]
  };

  public weightChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      label: this.getTranslation(this.lang.STATS.WEIGHT),
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      tension: 0.4,
      fill: true
    }]
  };

  public chartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    }
  };

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
      this.updateChartLabels();
    });

    this.userId = this.authService.getCurrentUser()?.uid ?? null;
    if (this.userId) {
      this.loadUserData();
    }
  }

  getTranslation(pair: { en: string; es: string }): string {
    return pair[this.currentLanguage];
  }

  private updateChartLabels(): void {
    // Actualizar etiquetas de los datasets
    this.stepsChartData.datasets[0].label = this.getTranslation(this.lang.STATS.STEPS);
    this.waterChartData.datasets[0].label = this.getTranslation(this.lang.STATS.WATER);
    this.weightChartData.datasets[0].label = this.getTranslation(this.lang.STATS.WEIGHT);

    // Actualizar etiqueta "Today"
    const todayLabel = this.getTranslation({ en: 'Today', es: 'Hoy' });
    this.stepsChartData.labels = [todayLabel];
    this.waterChartData.labels = [todayLabel];
  }

  async loadUserData(): Promise<void> {
    if (!this.userId) return;

    try {
      // Cambiado para usar el método asíncrono en lugar del Observable
      this.userData = await this.firestoreService.getUserDataAsync(this.userId);
      if (this.userData) {
        this.updateChartsData(
          this.userData.steps ?? 0,
          this.userData.waterIntake ?? 0,
          this.userData.weightData ?? []
        );
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load statistics data',
        confirmButtonText: 'OK'
      });
    }
  }

  private updateChartsData(steps: number, water: number, weightData: number[]): void {
    // Gráfico de pasos
    this.stepsChartData = {
      ...this.stepsChartData,
      datasets: [{
        ...this.stepsChartData.datasets[0],
        data: [steps]
      }]
    };

    // Gráfico de agua
    this.waterChartData = {
      ...this.waterChartData,
      datasets: [{
        ...this.waterChartData.datasets[0],
        data: [water]
      }]
    };

    // Gráfico de peso
    const dayLabel = this.getTranslation({ en: 'Day', es: 'Día' });
    const weightLabels = weightData.map((_, i) => `${dayLabel} ${i + 1}`);
    this.weightChartData = {
      ...this.weightChartData,
      labels: weightLabels,
      datasets: [{
        ...this.weightChartData.datasets[0],
        data: weightData
      }]
    };
  }
}