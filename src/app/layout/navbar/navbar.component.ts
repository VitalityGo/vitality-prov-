import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { FirestoreService, UserData } from '../../services/firestore.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AsyncPipe
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userData$: Observable<UserData | null>;
  currentRoute = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {
    this.authService.user$.subscribe(u => {
      if (u?.uid) {
        this.firestoreService.getUserData(u.uid).subscribe();
      }
    });
    this.userData$ = this.firestoreService.userData$;
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => this.currentRoute = e.url);
  }

  goSettings() {
    this.router.navigate(['/settings']);
  }
}
