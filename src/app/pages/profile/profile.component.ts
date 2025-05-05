import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ImcService, ImcCategory } from '../../services/imc.service';
import { Langs } from '../../../assets/i18n/en';
import { LanguageService } from '../../services/language.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  lang = Langs;
  currentLanguage: 'en' | 'es' = 'es';

  userId: string | null = null;
  name = '';
  weight = 0;
  age = 0;
  height = 0;
  bmi = 0;
  imcCategory: ImcCategory = { category: 'normal', description: 'Peso saludable' };

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private imcService: ImcService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });

    this.userId = this.authService.getCurrentUser()?.uid ?? null;
    if (this.userId) {
      this.loadUserData();
    }
  }

  getTranslation(pair: { en: string; es: string }): string {
    return pair[this.currentLanguage];
  }

  private async loadUserData() {
    if (!this.userId) return;
    try {
      // Resolvemos el Observable
      const userData = await firstValueFrom(
        this.firestoreService.getUserData(this.userId)
      );
      if (userData) {
        this.name = userData.name ?? '';
        this.weight = userData.weightData?.at(-1) ?? 0;
        this.age = userData.age ?? 0;
        this.height = userData.height ?? 0;
        this.calculateBMI();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  calculateBMI() {
    this.bmi = this.imcService.calculateIMC(this.weight, this.height);
    this.imcCategory = this.imcService.determineImcCategory(this.bmi);
  }

  async saveProfile() {
    if (!this.userId) return;

    if (!this.name || !this.age || !this.height || !this.weight) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill in all required fields',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      // También resolvemos Observable para existingData
      const existingData = await firstValueFrom(
        this.firestoreService.getUserData(this.userId)
      );
      const previousWeights = existingData?.weightData ?? [];

      await this.firestoreService.updateUserData(this.userId, {
        name: this.name,
        age: this.age,
        height: this.height,
        weightData: [...previousWeights, this.weight]
      });

      this.imcService.updateImcCategory(this.weight, this.height);
      this.calculateBMI();

      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Profile saved successfully',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save profile',
        confirmButtonText: 'OK'
      });
    }
  }
}
