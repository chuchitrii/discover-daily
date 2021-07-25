import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CallbackAuthGuard } from './services/guards/callback-auth-guard/callback-auth.guard';
import { CallbackComponent } from './components/callback/callback.component';
import { DiscoverAuthGuard } from './services/guards/discover-auth-guard/discover-auth.guard';
import { LoginAuthGuard } from './services/guards/login-auth-guard/login-auth.guard';
import { RecommendComponent } from './components/recommend/recommend.component';
import { StatsComponent } from './components/stats/stats.component';

const routes: Routes = [
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
  {
    path: '',
    component: StatsComponent,
    canActivate: [DiscoverAuthGuard],
  },
  {
    path: 'recommend',
    component: RecommendComponent,
    canActivate: [DiscoverAuthGuard],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
