import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSnackBarModule,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
})
export class AppModule {}