import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { DiscoverComponent } from './components/discover/discover.component';
import { CallbackComponent } from './components/callback/callback.component';

@NgModule({
  imports: [CommonModule, BrowserModule, AppRoutingModule],
  declarations: [
    AppComponent,
    LoginComponent,
    DiscoverComponent,
    CallbackComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
