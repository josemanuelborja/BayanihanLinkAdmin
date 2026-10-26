import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RequestManagementComponent } from './request-management/request-management.component';
import { RequestReviewComponent } from './request-management/request-review/request-review.component';
import { RequestReviewRecordedComponent } from './request-management/request-review-recorded/request-review-recorded.component';
import { DonationOffersComponent } from './donation-offers/donation-offers.component';
import { ExternalPartnerCoordinationComponent } from './external-coordination/external-coordination.component';
import { StatusMonitoringComponent } from './status-monitoring/status-monitoring.component';
import { DswdLoginComponent } from './dswd-admin/dswd-login/dswd-login.component';
import { DswdDashboardComponent } from './dswd-admin/dswd-dashboard/dswd-dashboard.component';
import { DswdReviewComponent } from './dswd-admin/dswd-review/dswd-review.component';
import { dswdRequestExistsGuard, dswdSessionGuard } from './dswd-admin/dswd-request.guard';

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
    path: 'request-review-recorded/:id',
    component: RequestReviewRecordedComponent
  },

  {
    path: 'donation-offers',
    component: DonationOffersComponent
  },

  {
    path: 'external-coordination',
    component: ExternalPartnerCoordinationComponent
  },

  {
    path: 'external-coordination/:requestId',
    component: ExternalPartnerCoordinationComponent
  },

  {
    path: 'external-coordination/:requestId/:offerId',
    component: ExternalPartnerCoordinationComponent
  },

  {
    path: 'dswd/login',
    component: DswdLoginComponent
  },

  {
    path: 'dswd/dashboard',
    component: DswdDashboardComponent,
    canActivate: [dswdSessionGuard]
  },

  {
    path: 'dswd/review/:id',
    component: DswdReviewComponent,
    canActivate: [dswdSessionGuard, dswdRequestExistsGuard]
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
