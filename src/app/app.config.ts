// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"vitalitygo-d7b1a","appId":"1:1023939118177:web:74a884385a3df986181620","storageBucket":"vitalitygo-d7b1a.firebasestorage.app","apiKey":"AIzaSyAMSe8NF-XQqEQKGlQ2nyqU8jLMoo11E94","authDomain":"vitalitygo-d7b1a.firebaseapp.com","messagingSenderId":"1023939118177","measurementId":"G-CYNC89FSZH"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};