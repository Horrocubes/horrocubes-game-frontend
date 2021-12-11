import { Component, OnInit, ViewChild } from '@angular/core';
import { Router }            from '@angular/router';
import { ApiService }        from '../../api.service';
import { Session }           from '../../models/Session';
import { Horrocube }         from '../../models/Horrocube';
import { Observable, interval }                     from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'get-one',
  templateUrl: './get-one.component.html',
  styleUrls: ['./get-one.component.css']
})

/***
 * get-one Component
 */
export class GetOneComponent implements OnInit {

  constructor(private router: Router, private api: ApiService, private modalService: NgbModal) { }

  @ViewChild('ModalContent', { static: false })
  private _content;
  _session: Session;
  _amount: Number;
  _horrocube: Horrocube;
  _timeLeft = 1200;
  _interval;
  _isLoading = true;
  _pollingData: any;
  _accountFunded = false;

  ngOnInit(): void
  {
    if (window == null || window.navigator == null) {
      return;
    }

      // We dont want the crawlers to trigger a new sesion on the server.
    if (this.detectRobot(window.navigator.userAgent)) {
      return;
    }

    this.api.createSession().subscribe((session: Session) =>
    {
        this._session = session;

        this.api.getAmount().subscribe((amount: number) =>
        {
            this._amount = amount / 1000000;
            this._isLoading = false;
            this.startTimer();

            this._pollingData = interval(5000).pipe(
              switchMap(() => this.api.getAccount(this._session.key))).subscribe((data) => {
                 this._session = data;
                 console.log(this._session);
                 if ((this._session.address.balance / 1000000) === this._amount)
                 {
                  this._pollingData.unsubscribe();
                  this.api.submitMintTransaction(this._session.key).subscribe(() =>
                  {
                    this.openModal(this._content);
                    this._accountFunded =  true;
                    clearInterval(this._interval);
                    this._pollingData = interval(5000).pipe(
                      switchMap(() => this.api.trackTransaction(this._session.key))).subscribe((data) => {
                        console.log(data);
                        this._horrocube = data;
                        if (this._horrocube.assetName !== '')
                        {
                          this._pollingData.unsubscribe();
                          this._horrocube.newlyMinted = true;
                          this.closeModal();
                          this.api.setCurrentCube(this._horrocube);
                          this.router.navigate(['/cube-details']);
                        }
                      });
                  });
                 }
              });

        });
    });
  }

  startTimer() {
    this._interval = setInterval(() => {
      if (this._timeLeft > 0) {
        this._timeLeft--;
      } else {
        clearInterval(this._interval);
        this.router.navigate(['/session-expired', this._session.key]);
      }
    }, 1000);
  }

  copyToClipboard(item) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (item));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }

  ngOnDestroy() {
    if (this._pollingData) {
      this._pollingData.unsubscribe();
    }
}

openModal(content) {
  this.modalService.open(content, { size: 'lg', windowClass: 'modal-holder', centered: true });
}

closeModal() {
  this.modalService.dismissAll();
}

detectRobot(userAgent: string)
{
  const robots = new RegExp(([
    /bot/, /spider/, /crawl/,                               // GENERAL TERMS
    /APIs-Google/, /AdsBot/, /Googlebot/,                   // GOOGLE ROBOTS
    /mediapartners/, /Google Favicon/,
    /FeedFetcher/, /Google-Read-Aloud/,
    /DuplexWeb-Google/, /googleweblight/,
    /bing/, /yandex/, /baidu/, /duckduck/, /yahoo/,           // OTHER ENGINES
    /ecosia/, /ia_archiver/,
    /facebook/, /instagram/, /pinterest/, /reddit/,          // SOCIAL MEDIA
    /slack/, /twitter/, /whatsapp/, /youtube/,
    /semrush/,                                            // OTHER
  ] as RegExp[]).map((r) => r.source).join('|'), 'i');     // BUILD REGEXP + "i" FLAG

  return robots.test(userAgent);
}

}
