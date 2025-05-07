import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService, UserData, MissionGroup, Mission } from '../../services/firestore.service';
import { ImcService, ImcCategory } from '../../services/imc.service';
import { AuthService } from '../../services/auth.service';
import { Langs } from '../../../assets/i18n/en';
import { LanguageService } from '../../services/language.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

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
  private mapContainer?: HTMLElement;
  private isMapInitialized = false;
  map?: mapboxgl.Map;
  userLocation?: mapboxgl.LngLat;
  userMarker?: mapboxgl.Marker;
  fixedMarker?: mapboxgl.Marker;
  fixedLocation?: mapboxgl.LngLat;
  latitude: number | null = null;
  longitude: number | null = null;
  locationError: string = '';

  imc: ImcCategory = { category: 'normal', description: 'Peso saludable' };

  dailyMissions: Mission[] = [];
  weeklyMissions: Mission[] = [];
  specialMissions: Mission[] = [];

  userId = '';
  userData?: UserData;
  hasChanges = false;
  followUser = true;
  isLoading = true;

  constructor(
    private imcService: ImcService,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Primero obtenemos el usuario actual
    this.userId = this.authService.getCurrentUser()?.uid ?? '';
    if (!this.userId) {
      console.error('No hay usuario autenticado');
      return;
    }

    // Suscribirse al cambio de idioma
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLanguage = lang;
    });

    // Obtener los datos del IMC y usuario
    this.imcService.currentImc$.subscribe(imc => {
      this.imc = imc;
      this.loadInitialData();
    });
  }
  async getUserLocation(): Promise<void> {
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location === 'denied') {
        const request = await Geolocation.requestPermissions();
        if (request.location === 'denied') {
          this.locationError = 'Permiso de ubicación denegado.';
          return;
        }
      }
  
      const position = await Geolocation.getCurrentPosition();
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.userLocation = new mapboxgl.LngLat(this.longitude, this.latitude);
      console.log('Ubicación del usuario:', this.userLocation);
    } catch (err) {
      this.locationError = 'No se pudo obtener la ubicación del usuario.';
      console.error(err);
    }
  }
  async ngAfterViewInit(): Promise<void> {
    await this.getUserLocation();
    this.initializeMap();
  }

  // Método para cargar la información inicial
  private async loadInitialData(): Promise<void> {
    try {
      // Primero obtenemos los datos del usuario
      const userData = await firstValueFrom(
        this.firestoreService.getUserData(this.userId)
      );
      
      if (userData) {
        this.userData = userData;
        
        // Luego cargamos las misiones según el IMC
        await this.loadUserDataAndMissions();
      } else {
        console.error('No se encontraron datos de usuario');
      }
    } 
    catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
    finally {
      this.isLoading = false;
    }
  }

  getTranslation(pair: { en: string; es: string }): string {
    return pair[this.currentLanguage];
  }

  private async loadUserDataAndMissions(): Promise<void> {
    try {
      // Obtener misiones según la categoría de IMC actual
      const currentImc = this.imc.category;
      console.log('Cargando misiones para IMC:', currentImc);
      
      const mg = await firstValueFrom(
        this.firestoreService.getMissions(this.userId, currentImc)
      );

      // Verificar que obtenemos datos válidos
      console.log('Misiones obtenidas:', mg);
      
      if (mg) {
        this.dailyMissions = mg.dailyMissions || [];
        this.weeklyMissions = mg.weeklyMissions || [];
        this.specialMissions = mg.specialMissions || [];
        
        // Generar misiones nuevas solo si TODAS las listas están vacías
        if (
          this.dailyMissions.length === 0 &&
          this.weeklyMissions.length === 0 &&
          this.specialMissions.length === 0
        ) {
          console.log('No hay misiones, creando misiones predeterminadas');
          this.updateMissions();
        }
      } else {
        console.log('No se encontraron misiones, creando misiones predeterminadas');
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
    if (arr && arr[idx]) {
      arr[idx].manuallyCompleted = arr[idx].completed;
      this.hasChanges = true;
      this.saveMissionsToFirestore();
    }
  }

  private updateMissions(): void {
    console.log('Actualizando misiones para el usuario');
    
    // Utilizamos el servicio para obtener las misiones predeterminadas según el IMC
    const defaultMissions = this.firestoreService.createDefaultMissions(this.imc.category);
    
    this.dailyMissions = defaultMissions.dailyMissions || [];
    this.weeklyMissions = defaultMissions.weeklyMissions || [];
    this.specialMissions = defaultMissions.specialMissions || [];
    
    this.preserveManualCompletionState();
    this.saveMissionsToFirestore();
  }

  private preserveManualCompletionState(): void {
    ['dailyMissions', 'weeklyMissions', 'specialMissions'].forEach(type => {
      const arr = this.getMissionsArray(type as any);
      if (arr && arr.length > 2 && arr[2]?.manuallyCompleted) {
        arr[2].completed = true;
      }
    });
  }

  private checkMissionProgress(): void {
    const steps = this.userData?.steps ?? 0;
    const waterIntake = this.userData?.waterIntake ?? 0;
    let updated = false;

    [this.dailyMissions, this.weeklyMissions, this.specialMissions].forEach(missions => {
      if (!missions) return;
      
      missions.forEach((m, i) => {
        if (!m) return;
        
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

  private async initializeMap(): Promise<void> {
    try {
      // Verificar y solicitar permisos si es necesario
      const permission = await Geolocation.checkPermissions();
      if (permission.location === 'denied') {
        const request = await Geolocation.requestPermissions();
        if (request.location === 'denied') {
          console.error('Permiso de ubicación denegado');
          return;
        }
      }
      // Obtener ubicación actual
      const pos = await Geolocation.getCurrentPosition();
      this.userLocation = new mapboxgl.LngLat(pos.coords.longitude, pos.coords.latitude);
      this.fixedLocation = new mapboxgl.LngLat(
        this.userLocation.lng + 0.002,
        this.userLocation.lat + 0.002
      );
      const mapboxToken = 'pk.eyJ1Ijoidml0YWxpdHlnbyIsImEiOiJjbTdjY3NsbDgwZXRzMmtxNzFqOHNpNHliIn0.du6tpdCZjbKh5H_JxCQsjw';
      const createCustomMarker = (color: string): HTMLElement => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.backgroundColor = color;
        return el;
      };

      // Inicializar mapa
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [this.userLocation.lng, this.userLocation.lat],
        zoom: 14,
        accessToken: mapboxToken
      });
  
      // Agregar marcador del usuario
      this.userMarker = new mapboxgl.Marker({
        element: createCustomMarker('#ff0000'),
        anchor: 'center',
        offset: [0, -14]
      }).setLngLat(this.userLocation).addTo(this.map);
  
      // Agregar marcador fijo
      this.fixedMarker = new mapboxgl.Marker({
        element: createCustomMarker('#ffcc00'),
        anchor: 'center',
        offset: [0, 0]
      }).setLngLat(this.fixedLocation).addTo(this.map);
  
      // Popup en destino
      new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
        .setLngLat(this.fixedLocation).setHTML('<p>Punto destino</p>').addTo(this.map);
  
      // Si el usuario mueve el mapa, dejamos de seguir su posición
      this.map.on('dragstart', () => this.followUser = false);
  
      // (Opcional) Seguir la ubicación del usuario en tiempo real
      this.trackUserLocation();
  
    } catch (err) {
      console.error('Error al inicializar el mapa o ubicación:', err);
    }
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
    if (!this.specialMissions || !this.map) return;
    
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