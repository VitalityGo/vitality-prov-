import { Component, AfterViewInit } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements AfterViewInit {
  constructor(private dataService: DataService) {}

  async ngAfterViewInit() {
    await this.dataService.loadData();
    this.drawStepsChart();
    this.drawWaterChart();
    this.drawWeightChart();
  }

  drawStepsChart() {
    const steps = this.dataService.getSteps();
    const ctx = (document.getElementById('myStepsChart') as HTMLCanvasElement).getContext('2d');
    new (window as any).Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Hoy'],
        datasets: [{
          label: 'Pasos',
          data: [steps],
          backgroundColor: 'rgba(75,192,192,0.2)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1
        }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }

  drawWaterChart() {
    const water = this.dataService.getWaterIntake();
    const ctx = (document.getElementById('myWaterChart') as HTMLCanvasElement).getContext('2d');
    new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Hoy'],
        datasets: [{
          label: 'Agua (L)',
          data: [water],
          backgroundColor: 'rgba(54,162,235,0.2)',
          borderColor: 'rgba(54,162,235,1)',
          borderWidth: 1
        }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }

  drawWeightChart() {
    const weightData = this.dataService.getWeightData();
    const labels = weightData.map((_, i) => `Día ${i + 1}`);
    const ctx = (document.getElementById('myWeightChart') as HTMLCanvasElement).getContext('2d');
    new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Peso (kg)',
          data: weightData,
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1
        }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }
}
