import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';

// Importe o provider de rotas já configurado com hash
import { appRouterProvider } from './app/app.routes';

// Locale pt-BR
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

// Registra o locale antes do bootstrap
registerLocaleData(localePt, 'pt-BR');

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    appRouterProvider, // Use o provider já com hash location
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
})
  .catch(err => console.error(err));