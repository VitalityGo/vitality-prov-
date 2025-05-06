import { Injectable } from '@angular/core';
import { 
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentData
} from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

export interface Mission {
  title: string;
  completed: boolean;
  manuallyCompleted?: boolean;
}

export interface MissionGroup {
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  specialMissions: Mission[];
}

export interface UserSettings {
  notifications: boolean;
  language: 'en' | 'es';
  units: 'metric' | 'imperial';
}

export interface UserData {
  uid: string;
  email: string;
  name?: string;
  age?: number;
  height?: number;
  weightData?: number[];
  steps?: number;
  waterIntake?: number;
  settings?: UserSettings;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private userDataSubject = new BehaviorSubject<UserData | null>(null);
  userData$ = this.userDataSubject.asObservable();

  constructor(private firestore: Firestore) {}

  clearUserData() {
    this.userDataSubject.next(null);
  }

  // ========== User Data Operations ==========

  /**
   * Get user data from Firestore
   * @param userId User ID (UID)
   * @returns Observable with user data or null
   */
  getUserData(userId: string): Observable<UserData | null> {
    const userDocRef = doc(this.firestore, 'users', userId);
    return from(getDoc(userDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = { ...docSnap.data(), uid: userId } as UserData;
          this.userDataSubject.next(data);
          return data;
        }
        return null;
      }),
      catchError(error => {
        console.error("Error getting user data:", error);
        return of(null);
      })
    );
  }

  /**
   * Get user data synchronously (as a Promise)
   * @param userId User ID (UID)
   * @returns Promise with user data or null
   */
  async getUserDataAsync(userId: string): Promise<UserData | null> {
    try {
      const userDocRef = doc(this.firestore, 'users', userId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = { ...docSnap.data(), uid: userId } as UserData;
        this.userDataSubject.next(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data async:", error);
      return null;
    }
  }
  
  /**
   * Create or update user data in Firestore
   * @param userId User ID (UID)
   * @param data User data to save
   * @returns Promise<void>
   */
  async setUserData(userId: string, data: Partial<UserData>): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', userId);
    const now = new Date();
    
    const dataToSave = {
      ...data,
      updatedAt: now,
      createdAt: data.createdAt || now
    };

    await setDoc(userDocRef, dataToSave, { merge: true });
    
    // Update local state
    const currentData = this.userDataSubject.value || {} as UserData;
    this.userDataSubject.next({ ...currentData, ...dataToSave });
  }

  /**
   * Update specific fields in user document
   * @param userId User ID (UID)
   * @param data Partial data to update
   * @returns Promise<void>
   */
  async updateUserData(userId: string, data: Partial<UserData>): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', userId);
    
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: new Date()
    });

    // Update local state
    const currentData = this.userDataSubject.value || {} as UserData;
    this.userDataSubject.next({ ...currentData, ...data, updatedAt: new Date() });
  }

  /**
   * Delete user data from Firestore
   * @param userId User ID (UID)
   * @returns Promise<void>
   */
  async deleteUserData(userId: string): Promise<void> {
    // Delete user document
    const userDocRef = doc(this.firestore, 'users', userId);
    await deleteDoc(userDocRef);

    // Delete all missions for this user
    const missionsQuery = query(
      collection(this.firestore, 'missions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(missionsQuery);
    const deletePromises = querySnapshot.docs.map(docSnap => 
      deleteDoc(docSnap.ref)
    );
    await Promise.all(deletePromises);

    // Clear local state
    this.userDataSubject.next(null);
  }

  // ========== Missions Operations ==========

  /**
   * Get missions for a specific user and IMC category
   * @param userId User ID (UID)
   * @param imcCategory IMC category ('bajo', 'normal', 'sobrepeso', 'obeso')
   * @returns Observable with MissionGroup
   */
  getMissions(userId: string, imcCategory: string): Observable<MissionGroup> {
    console.log(`Getting missions for user ${userId} with IMC ${imcCategory}`);
    const missionDocRef = doc(this.firestore, 'missions', `${userId}_${imcCategory}`);
    
    return from(getDoc(missionDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          console.log('Missions found:', docSnap.data());
          return docSnap.data() as MissionGroup;
        } else {
          console.log('No missions found, creating default');
          // Return default missions if document doesn't exist
          return this.createDefaultMissions(imcCategory);
        }
      }),
      catchError(error => {
        console.error('Error getting missions:', error);
        return of(this.createDefaultMissions(imcCategory));
      })
    );
  }

  /**
   * Save missions for a user and IMC category
   * @param userId User ID (UID)
   * @param imcCategory IMC category
   * @param missions Missions to save
   * @returns Promise<void>
   */
  async saveMissions(
    userId: string, 
    imcCategory: string, 
    missions: MissionGroup
  ): Promise<void> {
    const missionDocRef = doc(this.firestore, 'missions', `${userId}_${imcCategory}`);
    
    await setDoc(missionDocRef, {
      userId,
      imcCategory,
      ...missions,
      updatedAt: new Date()
    });
  }

  // ========== Helper Methods ==========

  /**
   * Create default missions based on IMC category
   * @param imcCategory IMC category
   * @returns MissionGroup with default missions
   */
  createDefaultMissions(imcCategory: string): MissionGroup {
    console.log(`Creating default missions for IMC category: ${imcCategory}`);
    
    switch (imcCategory) {
      case 'bajo':
        return {
          dailyMissions: [
            { title: 'Caminar 1 km', completed: false },
            { title: 'Tomar 1 L de agua', completed: false },
            { title: 'Hacer ejercicios ligeros', completed: false }
          ],
          weeklyMissions: [
            { title: 'Caminar 3 Km', completed: false },
            { title: 'Tomar 5 L de agua', completed: false },
            { title: 'Completar todas las misiones', completed: false }
          ],
          specialMissions: [
            { title: 'Caminar 10 Km', completed: false },
            { title: 'Tomar 10 L de agua', completed: false },
            { title: 'Realizar un reto ligero', completed: false }
          ]
        };
      
      case 'sobrepeso':
        return {
          dailyMissions: [
            { title: 'Correr 2 km', completed: false },
            { title: 'Tomar 2 L de agua', completed: false },
            { title: 'Realizar ejercicios de fuerza', completed: false }
          ],
          weeklyMissions: [
            { title: 'Correr 10 Km', completed: false },
            { title: 'Tomar 10 L de agua', completed: false },
            { title: 'Completar todas las misiones', completed: false }
          ],
          specialMissions: [
            { title: 'Correr 50 Km', completed: false },
            { title: 'Tomar 20 L de agua', completed: false },
            { title: 'Movilízate del punto A hasta el punto B', completed: false }
          ]
        };
      
      case 'obeso':
        return {
          dailyMissions: [
            { title: 'Correr 3 km', completed: false },
            { title: 'Tomar 3 L de agua', completed: false },
            { title: 'Realizar entrenamientos intensos', completed: false }
          ],
          weeklyMissions: [
            { title: 'Correr 15 Km', completed: false },
            { title: 'Tomar 15 L de agua', completed: false },
            { title: 'Completar todas las misiones', completed: false }
          ],
          specialMissions: [
            { title: 'Correr 60 Km', completed: false },
            { title: 'Tomar 25 L de agua', completed: false },
            { title: 'Realizar un desafío físico de alta intensidad', completed: false }
          ]
        };
      
      default: // 'normal'
        return {
          dailyMissions: [
            { title: 'Caminar 2 km', completed: false },
            { title: 'Tomar 1.5 L de agua', completed: false },
            { title: 'Realizar estiramientos', completed: false }
          ],
          weeklyMissions: [
            { title: 'Caminar 5 Km', completed: false },
            { title: 'Tomar 7 L de agua', completed: false },
            { title: 'Completar todas las misiones', completed: false }
          ],
          specialMissions: [
            { title: 'Caminar 20 Km', completed: false },
            { title: 'Tomar 15 L de agua', completed: false },
            { title: 'Realizar un recorrido de 30 minutos de movilidad', completed: false }
          ]
        };
    }
  }

  /**
   * Get current IMC category based on user data
   * @param userId User ID (UID)
   * @returns Promise with IMC category string
   */
  async getCurrentImc(userId: string): Promise<string> {
    const userData = await getDoc(doc(this.firestore, 'users', userId));
    
    if (!userData.exists()) {
      return 'normal';
    }

    const data = userData.data() as UserData;
    
    if (!data.height || !data.weightData || data.weightData.length === 0) {
      return 'normal';
    }

    const lastWeight = data.weightData[data.weightData.length - 1];
    const heightInMeters = data.height / 100;
    const bmi = lastWeight / (heightInMeters * heightInMeters);

    if (bmi < 18.5) return 'bajo';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'sobrepeso';
    return 'obeso';
  }
}