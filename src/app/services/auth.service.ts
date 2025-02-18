import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface User {

  email: string;

  password: string;

  name?: string;  // Añade esta línea

  profileImage?: string;  // Añade esta línea

}

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private users: User[] = [];

  constructor() {
    

  const savedUsers = localStorage.getItem('users');

  if (savedUsers) {

    this.users = JSON.parse(savedUsers);

  }


  // Cargar usuario actual

  const currentUser = localStorage.getItem('currentUser');

  if (currentUser) {

    this.currentUserSubject.next(JSON.parse(currentUser));

  }
  }

  register(email: string, password: string): boolean {
    // Verificar si el usuario ya existe
    if (this.users.some(user => user.email === email)) {
      return false;
    }

    // Agregar nuevo usuario
    this.users.push({ email, password });
    // Guardar en localStorage
    localStorage.setItem('users', JSON.stringify(this.users));
    return true;
  }

  login(email: string, password: string): boolean {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      this.isAuthenticated.next(true);
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', 'token-' + Date.now());
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated.next(false);
    this.currentUserSubject.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
  isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  checkAuthStatus(): boolean {
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    this.isAuthenticated.next(isAuth);
    return isAuth;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private currentUserSubject = new BehaviorSubject<User | null>(null);
currentUser$ = this.currentUserSubject.asObservable();

updateUserProfile(name: string, profileImage: string): Promise<void> {

  return new Promise((resolve, reject) => {

    const currentUser = this.getCurrentUser();

    if (currentUser) {

      currentUser.name = name;

      currentUser.profileImage = profileImage;

      this.currentUserSubject.next(currentUser);

      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      

      // Actualizar también en la lista de usuarios

      const userIndex = this.users.findIndex(u => u.email === currentUser.email);

      if (userIndex !== -1) {

        this.users[userIndex] = currentUser;

        localStorage.setItem('users', JSON.stringify(this.users));

      }

      resolve();

    } else {

      reject(new Error('No hay usuario autenticado'));

    }

  });

}
  
}