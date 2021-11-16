import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './components/index/index.component';
import { PageErrorComponent } from './components/page-error/page-error.component';
import { PagePrivacyComponent } from './components/page-privacy/page-privacy.component';
import { PageTermsComponent } from './components/page-terms/page-terms.component';
import { ExploreComponent } from './components/explore/explore.component';
import { MasterPageComponent } from './components/master-page/master-page.component';
import { FaqComponent } from './components/faq/faq.component';
import { VerifyComponent } from './components/verify/verify.component';
import { GetOneComponent } from './components/get-one/get-one.component';
import { CubeDetailsComponent } from './components/cube-details/cube-details.component';
import { CardDetailsComponent } from './components/card-details/card-details.component';
import { TransactionCompleteComponent } from './components/transaction-complete/transaction-complete.component';
import { SessionExpiredComponent } from './components/session-expired/session-expired.component';
import { combineLatest } from 'rxjs/internal/operators';
import { ExploreCardsComponent } from './components/explore-cards/explore-cards.component';

const routes: Routes = [
  {
    path: '',
    component: MasterPageComponent,
    children: [
      { path: '', component: IndexComponent },
      { path: 'index', component: IndexComponent },
      { path: 'page-privacy', component: PagePrivacyComponent },
      { path: 'page-terms', component: PageTermsComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'explore', component: ExploreComponent },
      { path: 'explore-cards', component: ExploreCardsComponent },
      { path: 'verify', component: VerifyComponent },
      { path: 'get-one', component: GetOneComponent },
      { path: 'cube-details', component: CubeDetailsComponent },
      { path: 'card-details', component: CardDetailsComponent },
      { path: 'transaction-completed', component: TransactionCompleteComponent },
      { path: 'session-expired/:id', component: SessionExpiredComponent },
      { path: '**', pathMatch: 'full', component: PageErrorComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "enabled",
  scrollOffset: [0, 0],
  // Enable scrolling to anchors
  anchorScrolling: "enabled"})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
