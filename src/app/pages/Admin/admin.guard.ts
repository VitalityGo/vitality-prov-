// admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { Observable, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private readonly ADMIN_EMAIL = 'vitalitygo5@gmail.com';

  constructor(
    private afAuth: Auth,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return user(this.afAuth).pipe(
      take(1),
      map(user => {
        const isAdmin = user?.email === this.ADMIN_EMAIL;
        return isAdmin ? true : this.router.createUrlTree(['/']);
      })
    );
  }
}