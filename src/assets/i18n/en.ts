interface TranslationPair {
    en: string;
    es: string;
  }
  
  // Interfaces para las subsecciones de SETTINGS
  interface ProfileSettingsSection {
    TITLE: TranslationPair;
    CHANGE_PHOTO: TranslationPair;
    NAME: TranslationPair;
    EMAIL: TranslationPair;
    SAVE_BUTTON: TranslationPair;
  }
  
  interface AppConfigSettingsSection {
    TITLE: TranslationPair;
    NOTIFICATIONS: TranslationPair;
    LANGUAGE: TranslationPair;
    UNITS: TranslationPair;
    METRIC: TranslationPair;
    IMPERIAL: TranslationPair;
    SAVE_BUTTON: TranslationPair;
  }
  
  interface PasswordSettingsSection {
    TITLE: TranslationPair;
    CURRENT: TranslationPair;
    NEW: TranslationPair;
    CONFIRM: TranslationPair;
    SAVE_BUTTON: TranslationPair;
  }
  
  interface LogoutSettingsSection {
    TITLE: TranslationPair;
    BUTTON: TranslationPair;
  }
  
  interface DeleteAccountSettingsSection {
    TITLE: TranslationPair;
    BUTTON: TranslationPair;
    CONFIRM: TranslationPair;
  }
  
  interface SettingsSection {
    TITLE: TranslationPair;
    PROFILE: ProfileSettingsSection;
    APP_CONFIG: AppConfigSettingsSection;
    PASSWORD: PasswordSettingsSection;
    LOGOUT: LogoutSettingsSection;
    DELETE_ACCOUNT: DeleteAccountSettingsSection;
  }
  
  // Interfaces para las subsecciones de HOME
  interface StepsHomeSection {
    TITLE: TranslationPair;
    LABEL: TranslationPair;
  }
  
  interface WaterHomeSection {
    TITLE: TranslationPair;
    LABEL: TranslationPair;
    PLACEHOLDER: TranslationPair;
    ADD_BUTTON: TranslationPair;
  }
  
  interface WeightHomeSection {
    TITLE: TranslationPair;
    PLACEHOLDER: TranslationPair;
    REGISTER_BUTTON: TranslationPair;
  }
  
  interface HomeSection {
    STEPS: StepsHomeSection;
    WATER: WaterHomeSection;
    WEIGHT: WeightHomeSection;
  }
  
  // Interface para la sección PROFILE
  interface ProfileSection {
    TITLE: TranslationPair;
    NAME: TranslationPair;
    WEIGHT: TranslationPair;
    AGE: TranslationPair;
    HEIGHT: TranslationPair;
    RESULTS: TranslationPair;
    BMI: TranslationPair;
    STATUS: TranslationPair;
    SAVE_BUTTON: TranslationPair;
  }
  
  // Interfaces para las subsecciones de MISSIONS
  interface MapMissionsSection {
    CENTER_USER: TranslationPair;
    FOLLOW_USER: TranslationPair;
    CENTER_DESTINATION: TranslationPair;
  }
  
  interface MissionsSection {
    MAP: MapMissionsSection;
    DAILY: TranslationPair;
    WEEKLY: TranslationPair;
    SPECIAL: TranslationPair;
    COMPLETED: TranslationPair;
    PENDING: TranslationPair;
    DISTANCE: TranslationPair;
    METERS: TranslationPair;
    SAVE_BUTTON: TranslationPair;
  }
  
  // Interface para la sección STATS
  interface StatsSection {
    STEPS: TranslationPair;
    WATER: TranslationPair;
    WEIGHT: TranslationPair;
  }
  
  // Interface para la sección COMMON
  interface CommonSection {
    SAVE: TranslationPair;
    CANCEL: TranslationPair;
    DELETE: TranslationPair;
    EDIT: TranslationPair;
  }
  
  // Interface principal para el objeto de traducciones
  export interface LangsInterface {
    SETTINGS: SettingsSection;
    HOME: HomeSection;
    PROFILE: ProfileSection;
    MISSIONS: MissionsSection;
    STATS: StatsSection;
    COMMON: CommonSection;
  }
  
  // Objeto de traducciones con tipado fuerte
  export const Langs: LangsInterface = {
    SETTINGS: {
      TITLE: { en: "Settings", es: "Configuración" },
      PROFILE: {
        TITLE: { en: "Profile", es: "Perfil" },
        CHANGE_PHOTO: { en: "Change Photo", es: "Cambiar foto" },
        NAME: { en: "Name", es: "Nombre" },
        EMAIL: { en: "Email", es: "Correo electrónico" },
        SAVE_BUTTON: { en: "Save Profile", es: "Guardar Perfil" }
      },
      APP_CONFIG: {
        TITLE: { en: "App Settings", es: "Configuración de la aplicación" },
        NOTIFICATIONS: { en: "Enable notifications", es: "Activar notificaciones" },
        LANGUAGE: { en: "Language:", es: "Idioma:" },
        UNITS: { en: "Units:", es: "Unidades:" },
        METRIC: { en: "Metric", es: "Métrico" },
        IMPERIAL: { en: "Imperial", es: "Imperial" },
        SAVE_BUTTON: { en: "Save settings", es: "Guardar configuración" }
      },
      PASSWORD: {
        TITLE: { en: "Change password", es: "Cambiar contraseña" },
        CURRENT: { en: "Current password:", es: "Contraseña actual:" },
        NEW: { en: "New password:", es: "Nueva contraseña:" },
        CONFIRM: { en: "Confirm new password:", es: "Confirmar nueva contraseña:" },
        SAVE_BUTTON: { en: "Change password", es: "Cambiar contraseña" }
      },
      LOGOUT: {
        TITLE: { en: "Logout", es: "Cerrar sesión" },
        BUTTON: { en: "Logout", es: "Cerrar sesión" }
      },
      DELETE_ACCOUNT: {
        TITLE: { en: "Delete account", es: "Eliminar cuenta" },
        BUTTON: { en: "Delete my account", es: "Eliminar mi cuenta" },
        CONFIRM: { en: "Are you sure you want to delete your account? This action cannot be undone.", es: "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer." }
      }
    },
    HOME: {
      STEPS: {
        TITLE: { en: "Daily Steps", es: "Pasos Diarios" },
        LABEL: { en: "Steps", es: "Pasos" }
      },
      WATER: {
        TITLE: { en: "Water Intake", es: "Agua Ingerida" },
        LABEL: { en: "liters", es: "litros" },
        PLACEHOLDER: { en: "Amount in ml", es: "Cantidad en ml" },
        ADD_BUTTON: { en: "Add Water (ml)", es: "Añadir agua (ml)" }
      },
      WEIGHT: {
        TITLE: { en: "Weight Log", es: "Registro de Peso" },
        PLACEHOLDER: { en: "Enter your weight (kg)", es: "Ingrese su peso (kg)" },
        REGISTER_BUTTON: { en: "Register", es: "Registrar" }
      }
    },
    PROFILE: {
      TITLE: { en: "Profile", es: "Perfil" },
      NAME: { en: "Name:", es: "Nombre:" },
      WEIGHT: { en: "Weight (kg):", es: "Peso (kg):" },
      AGE: { en: "Age:", es: "Edad:" },
      HEIGHT: { en: "Height (cm):", es: "Altura (cm):" },
      RESULTS: { en: "Results", es: "Resultados" },
      BMI: { en: "BMI:", es: "IMC:" },
      STATUS: { en: "Status:", es: "Estado:" },
      SAVE_BUTTON: { en: "Save Profile", es: "Guardar Perfil" }
    },
    MISSIONS: {
      MAP: {
        CENTER_USER: { en: "Center on my location", es: "Centrar mi localización" },
        FOLLOW_USER: { en: "Follow my location", es: "Seguir mi ubicación" },
        CENTER_DESTINATION: { en: "Center on destination point", es: "Centrar en punto de destino" }
      },
      DAILY: { en: "Daily Missions", es: "Misiones Diarias" },
      WEEKLY: { en: "Weekly Missions", es: "Misiones Semanales" },
      SPECIAL: { en: "Special Missions", es: "Misiones Especiales" },
      COMPLETED: { en: "Completed", es: "Completada" },
      PENDING: { en: "Pending", es: "Pendiente" },
      DISTANCE: { en: "Distance to destination point", es: "Distancia al punto de destino" },
      METERS: { en: "meters", es: "metros" },
      SAVE_BUTTON: { en: "Save Changes", es: "Guardar Cambios" }
    },
    STATS: {
      STEPS: { en: "Daily Steps", es: "Pasos Diarios" },
      WATER: { en: "Water Intake", es: "Agua Ingerida" },
      WEIGHT: { en: "Weight Log", es: "Registro de Peso" }
    },
    COMMON: {
      SAVE: { en: "Save", es: "Guardar" },
      CANCEL: { en: "Cancel", es: "Cancelar" },
      DELETE: { en: "Delete", es: "Eliminar" },
      EDIT: { en: "Edit", es: "Editar" }
    }
  };
  
  // Funciones para manejar el idioma actual
  type SupportedLanguage = 'en' | 'es';
  const LANGUAGE_KEY = 'app_language';
  
  export function getCurrentLanguage(): SupportedLanguage {
    const savedLang = localStorage.getItem(LANGUAGE_KEY);
    return (savedLang === 'en' || savedLang === 'es') ? savedLang : 'en';
  }
  
  export function setCurrentLanguage(lang: SupportedLanguage): void {
    localStorage.setItem(LANGUAGE_KEY, lang);
  }