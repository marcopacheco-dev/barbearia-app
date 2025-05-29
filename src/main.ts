import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { JwtInterceptor } from './app/interceptors/jwt.interceptor'; // Caminho conforme seu projeto
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { appConfig } from './app/app.config';

// Registra a localidade brasileira
registerLocaleData(localePt, 'pt-BR');

// Função para inicializar a aplicação com todas as configurações e providers
bootstrapApplication(AppComponent, {
  ...appConfig,  // Inclui todas as configurações do appConfig
  providers: [
    provideHttpClient(withInterceptors([JwtInterceptor])),  // Configura o HttpClient com o JwtInterceptor
    ...appConfig.providers,    // Adiciona qualquer provider já configurado em appConfig
    { provide: LOCALE_ID, useValue: 'pt-BR' }  // Define o idioma da aplicação como pt-BR
  ]
}).catch(err => {
  // Log de erro caso a inicialização falhe
  console.error('Erro ao inicializar a aplicação:', err);
});
