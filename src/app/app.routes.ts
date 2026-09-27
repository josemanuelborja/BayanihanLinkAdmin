import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RequestManagementComponent } from './request-management/request-management.component';
import { RequestReviewComponent } from './request-management/request-review/request-review.component';
import { RequestVerifiedComponent } from './request-management/request-verified/request-verified.component';
import { DonationOffersComponent } from './donation-offers/donation-offers.component';
import { DswdCoordinationComponent } from './dswd-coordination/dswd-coordination.component';
import { StatusMonitoringComponent } from './status-monitoring/status-monitoring.component';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'dashboard',
    component: DashboardComponent
  },

  {
    path: 'request-management',
    component: RequestManagementComponent
  },

  {
    path: 'request-review/:id',
    component: RequestReviewComponent
  },

  {
    path: 'request-verified/:id',
    component: RequestVerifiedComponent
  },

  {
    path: 'donation-offers',
    component: DonationOffersComponent
  },

  {
    path: 'dswd-coordination',
    component: DswdCoordinationComponent
  },

  {
    path: 'dswd-coordination/:requestId',
    component: DswdCoordinationComponent
  },

  {
    path: 'dswd-coordination/:requestId/:offerId',
    component: DswdCoordinationComponent
  },

  {
    path: 'status-monitoring',
    component: StatusMonitoringComponent
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];