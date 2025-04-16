import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImcService } from '../../services/imc.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  name: string = '';
  weight: number = 0;
  age: number = 0;
  height: number = 0;
  bodyFatPercentage: number = 0;
  bmi: number = 0;

  constructor(
    private imcService: ImcService,
    private dataService: DataService
  ) {}

  async ngOnInit() {
    await this.dataService.loadData();
    const profile = this.dataService.getProfile();
    this.name = profile.name;
    this.weight = profile.weight;
    this.age = profile.age;
    this.height = profile.height;
    this.bodyFatPercentage = profile.bodyFatPercentage;
    this.bmi = profile.bmi;
    this.calculateBMI();
  }

  async calculateBMI() {
    if (this.height > 0) {
      const heightInMeters = this.height / 100;
      this.bmi = this.weight / (heightInMeters * heightInMeters);
      this.setImc();
      await this.dataService.setProfile({
        name: this.name,
        weight: this.weight,
        age: this.age,
        height: this.height,
        bodyFatPercentage: this.bodyFatPercentage,
        bmi: this.bmi
      });
    } else {
      this.bmi = 0;
    }
  }

  setImc() {
    if (this.bmi < 18.5) {
      this.imcService.changeImc('bajo');
    } else if (this.bmi >= 18.5 && this.bmi <= 24.9) {
      this.imcService.changeImc('medio');
    } else {
      this.imcService.changeImc('alto');
    }
  }

  calculateDailyCalories(): number {
    let bmr: number;
    const isMale = true; // Puedes reemplazarlo por una propiedad si el usuario define género

    if (isMale) {
      bmr = 88.362 + (13.397 * this.weight) + (4.799 * this.height) - (5.677 * this.age);
    } else {
      bmr = 447.593 + (9.247 * this.weight) + (3.098 * this.height) - (4.330 * this.age);
    }

    const activityLevel = 1.2; // Puedes hacer esto dinámico según preferencia
    return Math.round(bmr * activityLevel);
  }
}
