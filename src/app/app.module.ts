import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { NgxYoutubePlayerModule } from 'ngx-youtube-player';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CountToModule } from 'angular-count-to';
import { NgxMasonryModule } from 'ngx-masonry';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { ScrollspyDirective } from './components/scrollspy.directive';
import { PoweredByComponent } from './components/powered-by-logo/powered-by-logo.component';
import { MasterPageComponent } from './components/master-page/master-page.component';
import { IndexComponent } from './components/index/index.component';
import { PageErrorComponent } from './components/page-error/page-error.component';
import { PagePrivacyComponent } from './components/page-privacy/page-privacy.component';
import { PageTermsComponent } from './components/page-terms/page-terms.component';
import { FaqComponent } from './components/faq/faq.component';
import { VerifyComponent } from './components/verify/verify.component';
import { GetOneComponent } from './components/get-one/get-one.component';
import { CubeDetailsComponent } from './components/cube-details/cube-details.component';
import { TransactionCompleteComponent } from './components/transaction-complete/transaction-complete.component';
import { SessionExpiredComponent } from './components/session-expired/session-expired.component';
import { ApiService } from './api.service';
import { SpinnersAngularModule   } from 'spinners-angular';
import { allIcons } from 'angular-feather/icons';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ExploreComponent } from './components/explore/explore.component';
import { ExploreCardsComponent } from './components/explore-cards/explore-cards.component';
import { FeatherModule } from 'angular-feather';
import { HttpClientModule } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CardanoRef } from './models/CardanoRef';
import { CardanoService } from './cardano.service';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MasterPageComponent,
    IndexComponent,
    PageErrorComponent,
    PagePrivacyComponent,
    PageTermsComponent,
    ExploreComponent,
    ScrollspyDirective,
    PoweredByComponent,
    FaqComponent,
    VerifyComponent,
    GetOneComponent,
    CubeDetailsComponent,
    TransactionCompleteComponent,
    SessionExpiredComponent,
    ExploreCardsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule,
    CarouselModule,
    FeatherModule.pick(allIcons),
    ScrollToModule.forRoot(),
    RouterModule.forRoot([], { relativeLinkResolution: 'legacy' }),
    NgxYoutubePlayerModule,
    NgbDropdownModule,
    CKEditorModule,
    NgbModule,
    NgbNavModule,
    FormsModule,
    SwiperModule,
    NgxTypedJsModule,
    FlatpickrModule.forRoot(),
    CountToModule,
    NgxMasonryModule,
    LightboxModule,
    HttpClientModule,
    SpinnersAngularModule,
    InfiniteScrollModule
  ],
  exports: [
    FeatherModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    { provide: CardanoRef, useValue: window },
    ApiService,
    CardanoService,
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
