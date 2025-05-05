import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { FirestoreService, UserData } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Langs } from '../../../assets/i18n/en';
import { LanguageService } from '../../services/language.service';
import { firstValueFrom } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  lang = Langs;
  currentLanguage: 'en' | 'es' = 'es';
  steps = 0;
  private lastX = 0;
  private lastY = 0;
  private lastZ = 0;
  private threshold = 12;

  waterIntake = 0;
  weightData: number[] = [];
  weight = 0;
  customWaterAmount = 500;

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [{
      data: this.weightData,
      label: this.getTranslation(this.lang.HOME.WEIGHT.TITLE),
      backgroundColor: 'rgba(60,140,231,0.2)',
      borderColor: '#3C8CE7',
      pointBackgroundColor: '#3C8CE7',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#3C8CE7',
      fill: 'origin',
    }],
    labels: []
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { 
        display: true,
        text: this.getTranslation(this.lang.HOME.WEIGHT.TITLE)
      }
    },
    scales: {
      y: { beginAtZero: false }
    }
  };

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService
  ) {}

  async ngOnInit() {
    // Suscripción a cambio de idioma
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
      this.updateChartLabels();
    });

    await this.loadInitialData();
    this.startMotionTracking();
  }

  getTranslation(pair: { en: string; es: string }): string {
    return pair[this.currentLanguage];
  }

  private updateChartLabels(): void {
    if (this.lineChartData.datasets.length) {
      this.lineChartData.datasets[0].label = this.getTranslation(this.lang.HOME.WEIGHT.TITLE);
    }
    if (this.lineChartOptions.plugins?.title) {
      this.lineChartOptions.plugins.title.text = this.getTranslation(this.lang.HOME.WEIGHT.TITLE);
    }
  }

  private async loadInitialData() {
    const user = this.authService.getCurrentUser();
    const userId = user?.uid || user?.email;
    if (!userId) return;

    try {
      // RESOLVEMOS el Observable antes de usarlo
      const userData: UserData | null = await firstValueFrom(
        this.firestoreService.getUserData(userId)
      );

      // Si faltan datos obligatorios, forzamos ir a Profile
      if (!userData?.name || !userData?.age || !userData?.height) {
        await Swal.fire({
          icon: 'warning',
          title: this.getTranslation(this.lang.SETTINGS.PROFILE.TITLE),
          text: this.getTranslation(this.lang.SETTINGS.PROFILE.SAVE_BUTTON),
          confirmButtonText: this.getTranslation(this.lang.COMMON.SAVE)
        });
        this.router.navigate(['/profile']);
        return;
      }

      const today = new Date().toDateString();
      const lastResetDate = localStorage.getItem('lastResetDate');
      if (lastResetDate !== today) {
        this.steps = 0;
        this.waterIntake = 0;
        localStorage.setItem('lastResetDate', today);
        await this.saveData();
      } else {
        this.steps = userData.steps ?? 0;
        this.waterIntake = userData.waterIntake ?? 0;
        this.weightData = userData.weightData ?? [];
        this.updateChartData();
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  }

  private startMotionTracking() {
    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.onDeviceMotion.bind(this), false);
    }
  }

  private async onDeviceMotion(event: DeviceMotionEvent) {
    const x = event.accelerationIncludingGravity?.x ?? 0;
    const y = event.accelerationIncludingGravity?.y ?? 0;
    const z = event.accelerationIncludingGravity?.z ?? 0;
    await this.trackSteps(x, y, z);
  }

  private async trackSteps(x: number, y: number, z: number) {
    const delta = Math.abs(x + y + z - this.lastX - this.lastY - this.lastZ);
    if (delta > this.threshold) {
      this.steps++;
      await this.saveData();
    }
    this.lastX = x; this.lastY = y; this.lastZ = z;
  }

  async addCustomWaterIntake() {
    if (this.customWaterAmount > 0) {
      this.waterIntake += this.customWaterAmount / 1000;
      await this.saveData();
      this.customWaterAmount = 500;
    } else {
      alert(this.getTranslation(this.lang.COMMON.EDIT));
    }
  }

  async updateWeight() {
    if (this.weight > 0) {
      this.weightData.push(this.weight);
      this.updateChartData();
      await this.saveData();
      this.weight = 0;
    } else {
      alert(this.getTranslation(this.lang.COMMON.EDIT));
    }
  }

  private updateChartData() {
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [{ ...this.lineChartData.datasets[0], data: [...this.weightData] }],
      labels: this.weightData.map((_, i) => `${this.getTranslation(this.lang.STATS.WEIGHT)} ${i + 1}`)
    };
  }

  private async saveData() {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) return;
    const payload: Partial<UserData> = {
      steps: this.steps,
      waterIntake: this.waterIntake,
      weightData: this.weightData
    };
    await this.firestoreService.updateUserData(userId, payload);
  }
}
