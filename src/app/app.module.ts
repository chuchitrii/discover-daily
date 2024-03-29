import { PlaylistComponent } from './components/playlist/playlist.component';
import { SearchFiltersComponent } from './components/search-filters/search-filters.component';
import { GenresStatsComponent } from './components/genres-stats/genres-stats.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { DiscoverComponent } from './components/discover/discover.component';
import { CallbackComponent } from './components/callback/callback.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchFiltersPrettyComponent } from './components/search-filters-pretty/search-filters-pretty.component';
import { DEFAULT_TIMEOUT, DiscoverInterceptor } from './services/interceptor/discover-interceptor.service';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSliderModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    DiscoverComponent,
    CallbackComponent,
    HeaderComponent,
    FooterComponent,
    GenresStatsComponent,
    SearchFiltersComponent,
    PlaylistComponent,
    SearchFiltersPrettyComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: DiscoverInterceptor, multi: true },
    { provide: DEFAULT_TIMEOUT, useValue: 5000 },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
