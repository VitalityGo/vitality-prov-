import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FirestoreService, UserData, UserSettings } from '../../services/firestore.service';
import { Langs } from '../../../assets/i18n/en';
import { LanguageService } from '../../services/language.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  public lang = Langs;
  currentLanguage: 'en' | 'es' = 'es';
  userData: Partial<UserData> = {};
  currentUser: any;

  // Configuración de la aplicación
  appConfig: UserSettings = {
    notifications: true,
    language: 'es',
    units: 'metric'
  };

  // Cambio de contraseña
  passwordData = {
    current: '',
    new: '',
    confirm: ''
  };

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private languageService: LanguageService
  ) {}

  async ngOnInit(): Promise<void> {
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });

    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser?.uid) {
      await this.loadUserData();
    }
  }

  getTranslation(pair: { en: string; es: string }): string {
    return pair[this.currentLanguage];
  }

  async loadUserData(): Promise<void> {
    try {
      // Cargar datos del usuario desde Firestore
      const data = await this.firestoreService.getUserDataAsync(this.currentUser.uid);
      if (data) {
        this.userData = data;
      }
      
      // Cargar configuración existente si existe
      if (this.userData?.settings) {
        this.appConfig = { ...this.appConfig, ...this.userData.settings };
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      await this.showError('Error loading settings');
    }
  }

  async saveProfile(): Promise<void> {
    try {
      if (!this.currentUser?.uid) return;
      
      // Actualizar en AuthService
      await this.authService.updateUserProfile(
        this.userData.name || '',
        this.userData.profileImage || ''
      );
      
      // Actualizar en Firestore
      await this.firestoreService.updateUserData(this.currentUser.uid, {
        name: this.userData.name,
        profileImage: this.userData.profileImage
      });
      
      await this.showSuccess('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      await this.showError('Error saving profile');
    }
  }

  async saveAppSettings(): Promise<void> {
    try {
      if (!this.currentUser?.uid) return;
      
      // Asegurarnos de que language sea de tipo 'en' | 'es'
      if (this.appConfig.language !== 'en' && this.appConfig.language !== 'es') {
        this.appConfig.language = 'es';
      }
      
      await this.firestoreService.updateUserData(this.currentUser.uid, {
        settings: this.appConfig
      });
      
      this.languageService.setLanguage(this.appConfig.language);
      await this.showSuccess('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      await this.showError('Error saving settings');
    }
  }

  async changePassword(): Promise<void> {
    if (this.passwordData.new !== this.passwordData.confirm) {
      await this.showError('New passwords do not match');
      return;
    }

    try {
      await this.authService.changePassword(
        this.passwordData.current,
        this.passwordData.new
      );
      this.passwordData = { current: '', new: '', confirm: '' };
      await this.showSuccess('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      await this.showError(error instanceof Error ? error.message : 'Error changing password');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.signOutUser();
    } catch (error) {
      console.error('Error logging out:', error);
      await this.showError('Error logging out');
    }
  }

  async deleteAccount(): Promise<void> {
    const result = await Swal.fire({
      title: this.getTranslation(this.lang.SETTINGS.DELETE_ACCOUNT.TITLE),
      text: this.getTranslation(this.lang.SETTINGS.DELETE_ACCOUNT.CONFIRM),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.getTranslation(this.lang.COMMON.DELETE),
      cancelButtonText: this.getTranslation(this.lang.COMMON.CANCEL)
    });

    if (result.isConfirmed) {
      try {
        // Eliminar datos de Firestore primero
        if (this.currentUser?.uid) {
          await this.firestoreService.deleteUserData(this.currentUser.uid);
        }
        
        // Luego eliminar la cuenta de autenticación
        await this.authService.deleteUserAccount();
      } catch (error) {
        console.error('Error deleting account:', error);
        await this.showError('Error deleting account');
      }
    }
  }

  private async showSuccess(message: string): Promise<void> {
    await Swal.fire({
      icon: 'success',
      title: this.getTranslation(this.lang.COMMON.SAVE),
      text: message,
      confirmButtonText: 'OK'
    });
  }

  private async showError(message: string): Promise<void> {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'OK'
    });
  }
}