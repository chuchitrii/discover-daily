import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CallbackAuthGuard } from './services/guards/callback-auth-guard/callback-auth.guard';
import { DiscoverComponent } from './components/discover/discover.component';
import { CallbackComponent } from './components/callback/callback.component';
import { DiscoverAuthGuard } from './services/guards/discover-auth-guard/discover-auth.guard';
import { LoginAuthGuard } from './services/guards/login-auth-guard/login-auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DiscoverComponent,
    canActivate: [DiscoverAuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginAuthGuard],
  },
  {
    path: 'callback',
    component: CallbackComponent,
    canActivate: [CallbackAuthGuard],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
