// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userName: string = '';
  userProfileImage: string = '';
  currentRoute: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentRoute = event.url;
    });

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name || 'Usuario';
      this.userProfileImage = currentUser.profileImage || 'assets/profile-placeholder.jpg';
    }

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name || 'Usuario';
        this.userProfileImage = user.profileImage || 'assets/profile-placeholder.jpg';
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}