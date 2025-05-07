import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  updateProfile,
  onAuthStateChanged,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup
} from '@angular/fire/auth';
import { FirestoreService, UserData } from './firestore.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth'; 

export interface AppUser {
  uid: string;
  email: string;
  name?: string;
  profileImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<AppUser | null>(null);
  public user$: Observable<AppUser | null> = this.userSubject.asObservable();
  private authInitialized = false;
  private authStateInitialized = false;

  constructor(
    private auth: Auth,
    private firestoreService: FirestoreService,
    private router: Router
  ) {
    // Configuramos la persistencia al inicializar el servicio
    this.setupPersistence();
  }

  // Configurar la persistencia localmente
  private async setupPersistence() {
    try {
      await setPersistence(this.auth, browserLocalPersistence);
      console.log('Persistencia configurada correctamente');
    } catch (error) {
      console.error('Error al configurar la persistencia:', error);
    }
  }

  // Método para inicializar el listener de autenticación y manejar redirecciones
  initAuthListener() {
    if (this.authInitialized) return;
    
    this.authInitialized = true;
    
    // Observar cambios de estado en Firebase Auth
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      console.log('Estado de autenticación cambiado:', firebaseUser ? 'Usuario autenticado' : 'No autenticado');
      
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: firebaseUser.displayName ?? '',
          profileImage: firebaseUser.photoURL ?? ''
        };
        this.userSubject.next(appUser);

        // Asegurar perfil en Firestore
        const existing = await this.firestoreService.getUserDataAsync(firebaseUser.uid);
        if (!existing) {
          const newUserData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            name: firebaseUser.displayName ?? '',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await this.firestoreService.setUserData(firebaseUser.uid, newUserData);
        }

        // Si estamos en la página de login o register, redirigir a home
        const currentUrl = this.router.url;
        if (currentUrl === '/login' || currentUrl === '/register' || currentUrl === '/') {
          console.log('Redirigiendo a /home desde:', currentUrl);
          this.router.navigate(['/home']);
        }
      } else {
        this.userSubject.next(null);
        
        // Si NO estamos en login o register, redirigir a login
        const publicRoutes = ['/login', '/register', '/forgot-password'];
        if (!publicRoutes.includes(this.router.url)) {
          console.log('Redirigiendo a /login desde:', this.router.url);
          this.router.navigate(['/login']);
        }
      }
      
      this.authStateInitialized = true;
    });
  }

  /**
   * Crea una cuenta en Firebase Auth (solo Auth).
   * @returns UserCredential o lanza error
   */
  async createAccount(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Error en createAccount():', error);
      throw error;
    }
  }

  /**
   * Registra un usuario completo:
   * 1) Crea en Auth
   * 2) Actualiza displayName
   * 3) Crea documento en Firestore
   */
  async register(email: string, password: string, name?: string): Promise<boolean> {
    try {
      const cred: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }

      const userData: UserData = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        name: name || cred.user.displayName || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await this.firestoreService.setUserData(cred.user.uid, userData);

      return true;
    } catch (err) {
      console.error('Error en register():', err);
      return false;
    }
  }

  /**
   * Inicia sesión con email y contraseña.
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      return true;
    } catch (err) {
      console.error('Error en login():', err);
      return false;
    }
  }

  /**
   * Inicia sesión con Google y crea perfil en Firestore si falta.
   */
  async loginWithGoogle(): Promise<boolean> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      return true;
    } catch (err) {
      console.error('Error en loginWithGoogle():', err);
      return false;
    }
  }

  /**
   * Cierra la sesión y redirige a login.
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error en logout():', err);
    }
  }

  /**
   * Alias para logout.
   */
  async signOutUser(): Promise<void> {
    return this.logout();
  }

  /**
   * Actualiza el perfil de Auth (displayName y/o photoURL).
   */
  async updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');
    await updateProfile(user, { displayName, photoURL });
  }

  /**
   * Cambia la contraseña.
   * Requiere reautenticación.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('No hay usuario autenticado');
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    // Aquí iría updatePassword(user, newPassword) si lo habilitas
    // await updatePassword(user, newPassword);
  }

  /**
   * Elimina la cuenta de Auth y el perfil en Firestore.
   */
  async deleteUserAccount(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');
    await deleteUser(user);
    await this.firestoreService.deleteUserData(user.uid);
    this.router.navigate(['/login']);
  }

  /**
   * Devuelve el usuario actual synchronously.
   */
  getCurrentUser(): AppUser | null {
    return this.userSubject.value;
  }

  /**
   * Comprueba si hay sesión activa.
   */
  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  /**
   * Alias para isLoggedIn().
   */
  checkAuthStatus(): boolean {
    return this.isLoggedIn();
  }

  /**
   * Verifica si la autenticación está inicializada
   */
  isAuthInitialized(): boolean {
    return this.authStateInitialized;
  }
  async resetPassword(email: string): Promise<boolean> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('Correo de restablecimiento enviado a:', email);
      return true;
    } catch (err) {
      console.error('Error en resetPassword():', err);
      return false;
    }
  }
}