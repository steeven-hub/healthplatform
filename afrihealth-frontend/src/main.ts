import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app'; // Vérifie que c'est bien src/app/app.ts

bootstrapApplication(AppComponent).catch((err) => console.error(err));