import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService, UserData, MissionGroup } from '../../services/firestore.service';
import { ImcService, ImcCategory } from '../../services/imc.service';
import { AuthService } from '../../services/auth.service';
import { Langs } from '../../../assets/i18n/en';
import { LanguageService } from '../../services/language.service';
import { firstValueFrom } from 'rxjs';

interface Mission {
  title: string;
  completed: boolean;
  manuallyCompleted?: boolean; 
}

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './missions.component.html',
  styleUrls: ['./missions.component.css']
})
export class MissionsComponent implements OnInit, AfterViewInit {
  lang = Langs;
  currentLanguage: 'en' | 'es' = 'es';

  map?: mapboxgl.Map;
  userLocation?: mapboxgl.LngLat;
  userMarker?: mapboxgl.Marker;
  fixedMarker?: mapboxgl.Marker;
  fixedLocation?: mapboxgl.LngLat;

  imc: ImcCategory = { category: 'normal', description: 'Peso saludable' };

  dailyMissions: Mission[] = [];
  weeklyMissions: Mission[] = [];
  specialMissions: Mission[] = [];

  userId = '';
  userData?: UserData;
  hasChanges = false;
  followUser = true;

  constructor(
    private imcService: ImcService,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });

    this.userId = this.authService.getCurrentUser()?.uid ?? '';
    if (!this.userId) return;

    this.imcService.currentImc$.subscribe(async imc => {
      this.imc = imc;
      await this.loadUserDataAndMissions();
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  getTranslation(pair: { en: string; es: string }): string {
    return pair[this.currentLanguage];
  }

  private async loadUserDataAndMissions(): Promise<void> {
    try {
      this.userData = await firstValueFrom(
        this.firestoreService.getUserData(this.userId)
      ) || undefined;

      const currentImc = this.imc.category;
      const mg: MissionGroup = await firstValueFrom(
        this.firestoreService.getMissions(this.userId, currentImc)
      );

      this.dailyMissions = mg.dailyMissions;
      this.weeklyMissions = mg.weeklyMissions;
      this.specialMissions = mg.specialMissions;

      if (
        this.dailyMissions.length === 0 &&
        this.weeklyMissions.length === 0 &&
        this.specialMissions.length === 0
      ) {
        this.updateMissions();
      }

      this.hasChanges = false;
      this.checkMissionProgress();
    } catch (error) {
      console.error('Error al cargar datos y misiones:', error);
    }
  }

  async saveMissionsToFirestore(): Promise<void> {
    try {
      await this.firestoreService.saveMissions(
        this.userId,
        this.imc.category,
        {
          dailyMissions: this.dailyMissions,
          weeklyMissions: this.weeklyMissions,
          specialMissions: this.specialMissions
        }
      );
      this.hasChanges = false;
    } catch (error) {
      console.error('Error al guardar misiones:', error);
    }
  }

  onMissionChange(type: 'dailyMissions' | 'weeklyMissions' | 'specialMissions', idx: number): void {
    const arr = this.getMissionsArray(type);
    arr[idx].manuallyCompleted = arr[idx].completed;
    if (idx === 2) {
      arr[idx].completed = !arr[idx].completed;
    }
    this.hasChanges = true;
    this.saveMissionsToFirestore();
  }

  private updateMissions(): void {
    const steps = this.userData?.steps ?? 0;
    const waterIntake = this.userData?.waterIntake ?? 0;
    // Lógica de inicialización según IMC...
    this.preserveManualCompletionState();
    this.saveMissionsToFirestore();
  }

  private preserveManualCompletionState(): void {
    ['dailyMissions', 'weeklyMissions', 'specialMissions'].forEach(type => {
      const arr = this.getMissionsArray(type as any);
      if (arr[2]?.manuallyCompleted) {
        arr[2].completed = true;
      }
    });
  }

  private checkMissionProgress(): void {
    const steps = this.userData?.steps ?? 0;
    const waterIntake = this.userData?.waterIntake ?? 0;
    let updated = false;

    [this.dailyMissions, this.weeklyMissions, this.specialMissions].forEach(missions => {
      missions.forEach((m, i) => {
        let should = m.completed;
        if (i < 2) {
          if (m.title.match(/\d+(\.\d+)?\s*km/i)) {
            should = steps >= this.extractDistance(m.title) * 1000;
          } else if (m.title.match(/\d+(\.\d+)?\s*l/i)) {
            should = waterIntake >= this.extractWater(m.title);
          }
        } else if (i === 2 && !m.manuallyCompleted) {
          if (m.title.toLowerCase().includes('completar todas')) {
            should = this.dailyMissions.every(x => x.completed);
          }
        }
        if (m.completed !== should) {
          m.completed = should;
          updated = true;
        }
      });
    });

    if ((updated && !this.hasChanges) || this.hasChanges) {
      this.hasChanges = true;
      this.saveMissionsToFirestore();
    }
  }

  public calculateDistanceToFixedPoint(): number {
    if (!this.userLocation || !this.fixedLocation) return 0;
    const toRad = (n: number) => n * Math.PI / 180;
    const R = 6371e3;
    const φ1 = toRad(this.userLocation.lat);
    const φ2 = toRad(this.fixedLocation.lat);
    const Δφ = toRad(this.fixedLocation.lat - this.userLocation.lat);
    const Δλ = toRad(this.fixedLocation.lng - this.userLocation.lng);
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  public toggleFollowUser(): void {
    this.followUser = !this.followUser;
    if (this.followUser && this.userLocation) {
      this.centerMapOnUser();
    }
  }

  public centerMapOnFixedPoint(): void {
    if (this.map && this.fixedLocation) {
      this.map.flyTo({
        center: [this.fixedLocation.lng, this.fixedLocation.lat],
        zoom: 14,
        speed: 1.5
      });
      this.followUser = false;
    }
  }

  public centerMapOnUser(): void {
    if (this.map && this.userLocation) {
      this.map.flyTo({
        center: [this.userLocation.lng, this.userLocation.lat],
        zoom: 14,
        speed: 1.5
      });
      this.followUser = true;
    }
  }

  private extractDistance(title: string): number {
    const m = title.match(/(\d+(\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  }

  private extractWater(title: string): number {
    const m = title.match(/(\d+(\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  }

  private getMissionsArray(type: 'dailyMissions'|'weeklyMissions'|'specialMissions'): Mission[] {
    return ({
      dailyMissions: this.dailyMissions,
      weeklyMissions: this.weeklyMissions,
      specialMissions: this.specialMissions
    } as Record<string, Mission[]>)[type];
  }

  private initializeMap(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(pos => {
      this.userLocation = new mapboxgl.LngLat(pos.coords.longitude, pos.coords.latitude);
      this.fixedLocation = new mapboxgl.LngLat(
        this.userLocation.lng + 0.002,
        this.userLocation.lat + 0.002
      );

      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [this.userLocation.lng, this.userLocation.lat],
        zoom: 14,
        accessToken: 'TU_MAPBOX_TOKEN'
      });

      this.userMarker = new mapboxgl.Marker({ color: '#F00' })
        .setLngLat(this.userLocation).addTo(this.map);
      this.fixedMarker = new mapboxgl.Marker({ color: '#CC0' })
        .setLngLat(this.fixedLocation).addTo(this.map);
      new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
        .setLngLat(this.fixedLocation).setHTML('<p>Punto destino</p>').addTo(this.map);

      this.map.on('dragstart', () => this.followUser = false);
      this.trackUserLocation();
    }, err => console.error('Error al obtener ubicación:', err));
  }

  private trackUserLocation(): void {
    navigator.geolocation.watchPosition(pos => {
      const loc = new mapboxgl.LngLat(pos.coords.longitude, pos.coords.latitude);
      this.userLocation = loc;
      if (this.followUser && this.map) {
        this.map.setCenter([loc.lng, loc.lat]);
      }
      this.userMarker?.setLngLat(loc);
      this.checkDistanceMissions(loc);
    }, err => console.error(err), { enableHighAccuracy:true });
  }

  private checkDistanceMissions(loc: mapboxgl.LngLat): void {
    let updated = false;
    this.specialMissions.forEach((m, i) => {
      if (i === 2 && !m.manuallyCompleted) {
        const d = this.calculateDistanceToFixedPoint();
        if (d < 30) {
          m.completed = true;
          m.manuallyCompleted = true;
          updated = true;
          new mapboxgl.Popup()
            .setLngLat(loc)
            .setHTML('<h3>¡Misión completada!</h3>')
            .addTo(this.map!);
        }
      }
    });
    if (updated) {
      this.hasChanges = true;
      this.saveMissionsToFirestore();
    }
  }
}
