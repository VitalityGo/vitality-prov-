import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MissionsComponent } from './pages/missions/missions.component';
import { StatsComponent } from './pages/stats/stats.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { AdminComponent } from './pages/Admin/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './pages/Admin/admin.guard'; // Importa el AdminGuard
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent 
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard], // Protege todas las rutas hijas
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'missions', component: MissionsComponent },
      { path: 'stats', component: StatsComponent },
      { path: 'settings', component: SettingsComponent },
      { 
        path: 'admin', 
        component: AdminComponent,
        canActivate: [AdminGuard] // Protección adicional para admin
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];