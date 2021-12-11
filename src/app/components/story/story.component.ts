import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Horrocube } from 'src/app/models/Horrocube';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ApiService }        from '../../api.service';
import { Level } from 'src/app/models/Level';
import { StoryService } from '../../story.service';
import { Sha256 } from '../../vendors/sha256';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewChild } from '@angular/core';
import { CardanoService } from '../../cardano.service';
import { Buffer } from 'buffer';
import { DAppConnector } from 'src/app/cardano/DAppConnector';

@Component({
  selector: 'story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})

/***
 * CardDetailsComponent Component
 */
export class StoryComponent implements OnInit {

  _levels: Level[] = [];
  _currentLevel: Level = new Level();
  _currentCube: Horrocube;
  _interval;

  @ViewChild('ModalContentCorrect', { static: false })
  private _rightContent;

  @ViewChild('ModalContentIncorrect', { static: false })
  private _wrongContent;

  constructor(private _cardano: CardanoService, private api: ApiService, private router: Router, private story: StoryService, private modalService: NgbModal) { }

  ngOnInit(): void
  {
    this.story.getCurrentLevel().subscribe((x) => this._currentLevel = x);
    this.story.getAllLevels().subscribe((x) => this._levels = x);
    this._currentCube = this.story.getcurrentCube();

    if (this._currentCube == null) {
    this.router.navigate(['/']);
    }
    console.log(this._currentCube);
  }

  parseAssetName(name: String)
  {
    return name.substr(9, 5);
  }

  getLevelTrackerSegmentWidth()
  {
    return (100.0 / (this._levels.length)) + '%';
  }

  getCurrentContent()
  {
    return this._levels.find((x) => x.isCurrent);
  }

  openModal(content) {
    this.modalService.open(content, { size: 'lg', windowClass: 'modal-holder', centered: true });
  }

  closeModal() {
    this.modalService.dismissAll();
  }
  fromHex = (hex) => Buffer.from(hex, 'hex');
  toHex(bytes: any)
  {
    return Buffer.from(bytes).toString('hex');
  }

  fromAscii(hex)
  {
    return Buffer.from(hex).toString('hex');
  }

  async onClick(value)
  {
    const firstPass = Sha256.hash(this._currentCube.policyId + '.' + this._currentCube.assetName + value);
    const secondPass = Sha256.hash(firstPass, {messageFormat: 'hex-bytes'});

    console.log(this._currentCube.policyId + '.' + this._currentCube.assetName + value);
    console.log(firstPass);
    console.log(secondPass);

    if (secondPass === this._currentCube.stories[0].levels[this._currentCube.stories[0].currentLevel].answerHash)
    {
      const currDatumValue = this._currentCube.stories[0].currentLevel;
      const nexDatValue    = currDatumValue + 1;

      this.openModal(this._rightContent);
      this._currentCube.stories[0].currentLevel += 1;

      const connect = new DAppConnector();

      const tx = await connect.buildTransaction(this._currentCube, this._cardano, currDatumValue, nexDatValue, firstPass);
      let txId = await connect.sendTransaction(this._cardano, tx);

      this.startTimer(txId);
    }
    else
    {
      this.openModal(this._wrongContent);
    }
  }

  startTimer(txId)
  {
    console.log(txId);
    this._interval = setInterval(() => {
      this.api.trackTransaction(txId).subscribe((isConfirmed) =>
      {
        console.log(txId);
        console.log(isConfirmed);
        if (isConfirmed)
        {
          clearInterval(this._interval);
          this.router.navigate(['/']);
          this.closeModal();
        }
      });
    }, 5000);
  }
}
