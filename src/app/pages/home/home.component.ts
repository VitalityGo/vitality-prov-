import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DataService } from '../../services/data.service';


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, FormsModule, BaseChartDirective]
})
export class HomeComponent implements OnInit {
  steps = 0;
  waterIntake = 0;
  weightData: number[] = [];
  weight = 0;
  customWaterAmount = 500;
  customStepsAmount = 1000;

  lastX = 0; lastY = 0; lastZ = 0;
  threshold = 20;

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [{
      data: [],
      label: 'Peso (kg)',
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
      title: { display: true, text: 'Registro de Peso' }
    },
    scales: { y: { beginAtZero: false } }
  };

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    await this.dataService.loadData();
    this.steps = this.dataService.getSteps();
    this.waterIntake = this.dataService.getWaterIntake();
    this.weightData = this.dataService.getWeightData();
    this.updateChartData();
    this.startMotionTracking();
  }

  async addCustomSteps() {
    if (this.customStepsAmount > 0) {
      this.steps += this.customStepsAmount;
      await this.dataService.setSteps(this.steps);
      this.customStepsAmount = 1000;
    }
  }

  async updateWaterIntake() {
    this.waterIntake += 0.5;
    await this.dataService.setWaterIntake(this.waterIntake);
  }

  async addCustomWaterIntake() {
    if (this.customWaterAmount > 0) {
      this.waterIntake += this.customWaterAmount / 1000;
      await this.dataService.setWaterIntake(this.waterIntake);
      this.customWaterAmount = 500;
    }
  }

  async updateWeight() {
    if (this.weight > 0) {
      await this.dataService.addWeight(this.weight);
      this.weightData = this.dataService.getWeightData();
      this.updateChartData();
      this.weight = 0;
    }
  }

  private updateChartData() {
    this.lineChartData.datasets[0].data = [...this.weightData];
    this.lineChartData.labels = this.weightData.map((_, i) => `Día ${i + 1}`);
    this.lineChartData = { ...this.lineChartData };
  }

  startMotionTracking() {
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', this.onDeviceMotion.bind(this), false);
    }
  }

  async onDeviceMotion(event: DeviceMotionEvent) {
    const x = event.accelerationIncludingGravity?.x ?? 0;
    const y = event.accelerationIncludingGravity?.y ?? 0;
    const z = event.accelerationIncludingGravity?.z ?? 0;
    await this.trackSteps(x, y, z);
  }

  async trackSteps(x: number, y: number, z: number) {
    const delta = Math.abs(x + y + z - this.lastX - this.lastY - this.lastZ);
    if (delta > this.threshold) {
      this.steps += 1;
      await this.dataService.setSteps(this.steps);
    }
    this.lastX = x; this.lastY = y; this.lastZ = z;
  }
}
