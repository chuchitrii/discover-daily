import { SearchFiltersComponent } from './components/search-filters/search-filters.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { CallbackComponent } from './components/callback/callback.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchFiltersPrettyComponent } from './components/search-filters-pretty/search-filters-pretty.component';
import { DEFAULT_TIMEOUT, DiscoverInterceptor } from './services/interceptor/discover-interceptor.service';
import { StatsComponent } from './components/stats/stats.component';
import { RecommendComponent } from './components/recommend/recommend.component';
import { StatsTopArtistsComponent } from './components/stats-top-artists/stats-top-artists.component';
import { StatsGenresComponent } from './components/stats-genres/stats-genres.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { discoverState } from './state/discover.reducer';
import { environment } from '../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { DiscoverEffects } from './state/discover.effects';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    StoreModule.forRoot({ discoverState }, {}),
    EffectsModule.forRoot([DiscoverEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    CallbackComponent,
    HeaderComponent,
    SearchFiltersComponent,
    SearchFiltersPrettyComponent,
    StatsComponent,
    RecommendComponent,
    StatsTopArtistsComponent,
    StatsGenresComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: DiscoverInterceptor, multi: true },
    { provide: DEFAULT_TIMEOUT, useValue: 5000 },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
