import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Langs } from '../../assets/i18n/en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<'en' | 'es'>('es');
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor() {
    // Intenta cargar el idioma guardado en localStorage al iniciar
    const savedLang = localStorage.getItem('app_language');
    if (savedLang === 'en' || savedLang === 'es') {
      this.currentLangSubject.next(savedLang);
    }
  }

  /**
   * Cambia el idioma de la aplicación
   * @param lang El idioma a establecer ('en' o 'es')
   */
  setLanguage(lang: 'en' | 'es'): void {
    if (this.currentLangSubject.value !== lang) {
      this.currentLangSubject.next(lang);
      localStorage.setItem('app_language', lang);
    }
  }

  /**
   * Obtiene el idioma actual
   * @returns El código del idioma actual ('en' o 'es')
   */
  getCurrentLang(): 'en' | 'es' {
    return this.currentLangSubject.value;
  }

  /**
   * Método para obtener traducciones seguras
   * @param translations Objeto de traducciones con propiedades en y es
   * @returns La traducción en el idioma actual
   */
  getTranslation(translations: { en: string; es: string }): string {
    return translations[this.currentLangSubject.value];
  }

  /**
   * Método para traducir secciones completas del objeto Langs
   * @param section La sección del objeto Langs que se quiere traducir
   * @returns Un objeto con las mismas propiedades pero con los valores traducidos
   */
  translateSection<T extends Record<string, { en: string; es: string }>>(section: T): Record<keyof T, string> {
    const translated: any = {};
    const currentLang = this.currentLangSubject.value;

    for (const key in section) {
      if (section.hasOwnProperty(key)) {
        translated[key] = section[key][currentLang];
      }
    }

    return translated;
  }
}