import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config'; // Configuração padrão da aplicação
import { serverRoutes } from './app.routes.server'; // Rotas específicas para SSR

// Configuração do servidor
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),  // Habilita a renderização no servidor
    provideServerRouting(serverRoutes)  // Fornece as rotas do servidor
  ]
};

// Mescla as configurações de aplicação padrão com as específicas para SSR
export const config = mergeApplicationConfig(appConfig, serverConfig);
