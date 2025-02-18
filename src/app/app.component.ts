  // Suggested code may be subject to a license. Learn more: ~LicenseLog:240261047.
  // Suggested code may be subject to a license. Learn more: ~LicenseLog:3275062086.
  import { Component } from '@angular/core';

  import { RouterOutlet } from '@angular/router';

  @Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet,],
    template: '<router-outlet></router-outlet>',
  })
  export class AppComponent {
    title = 'VitalityGo';
    isLoggedIn = false;

    onLoginSuccess() {
      this.isLoggedIn = true;
    }   
  }