import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app/app.config';

export const config: ApplicationConfig = {
  ...appConfig,
  providers: [
    provideServerRendering(),
    ...appConfig.providers,
  ]
};
