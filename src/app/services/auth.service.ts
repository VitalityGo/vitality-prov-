// src/app/services/auth.service.ts

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

// Importa setPersistence y browserLocalPersistence desde firebase/auth
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

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

  constructor(
    private auth: Auth,
    private firestoreService: FirestoreService,
    private router: Router
  ) {
    // Observar cambios de estado en Firebase Auth
    onAuthStateChanged(this.auth, async firebaseUser => {
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
      } else {
        this.userSubject.next(null);
      }
    });
  }

  /**
   * Crea una cuenta en Firebase Auth (solo Auth).
   * @returns UserCredential o lanza error
   */
  async createAccount(email: string, password: string): Promise<UserCredential> {
    try {
      // Establece la persistencia antes de crear la cuenta
      await setPersistence(this.auth, browserLocalPersistence);
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
      // Establece la persistencia antes de registrar
      await setPersistence(this.auth, browserLocalPersistence);
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
      // Establece la persistencia antes de iniciar sesión
      await setPersistence(this.auth, browserLocalPersistence);
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
      // Establece la persistencia antes de iniciar sesión
      await setPersistence(this.auth, browserLocalPersistence);
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
}
