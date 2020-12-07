import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CallbackAuthGuard } from './services/guards/callback-auth-guard/callback-auth.guard';
import { DiscoverComponent } from './components/discover/discover.component';
import { CallbackComponent } from './components/callback/callback.component';
import { DiscoverAuthGuard } from './services/guards/discover-auth-guard/discover-auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'callback',
    component: CallbackComponent,
    canActivate: [CallbackAuthGuard],
  },
  {
    path: 'discover-daily',
    component: DiscoverComponent,
    canActivate: [DiscoverAuthGuard],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
