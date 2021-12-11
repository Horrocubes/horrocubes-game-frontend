import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Horrocube } from 'src/app/models/Horrocube';
import { environment } from './../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ApiService }        from '../../api.service';

@Component({
  selector: 'cube-details',
  templateUrl: './cube-details.component.html',
  styleUrls: ['./cube-details.component.css']
})

/***
 * CubeDetailsComponent Component
 */
export class CubeDetailsComponent implements OnInit {

  _cardStrings = {
    FOOL: 'The Fool',
    MAGICIAN: 'The Magician',
    HIGH_PRIESTESS: 'The High Priestess',
    EMPRESS: 'The Empress',
    EMPEROR: 'The Emperor',
    HIEROPHANT: 'The Hierophant',
    LOVERS: 'The Lovers',
    CHARIOT: 'The Chariot',
    STRENGTH: 'Strength',
    HERMIT: 'The Hermit',
    WHEEL_OF_FORTUNE: 'Wheel of Fortune',
    JUSTICE: 'Justice',
    HANGED_MAN: 'The Hanged Man',
    DEATH: 'Death',
    TEMPERANCE: 'Temperance',
    DEVIL: 'The Devil',
    TOWER: 'The Tower',
    STAR: 'The Star',
    MOON: 'The Moon',
    SUN: 'The Sun',
    JUDGEMENT: 'Judgment',
    WORLD: 'The World'};

  _horrocube;
  _imageUrl;
  _policyScript;
  _signatureUrl;
  _policyScriptContent;
  _signatureContent;
  _isSingleIdPolicy;


  constructor(private api: ApiService, private router: Router) { }

  ngOnInit(): void {
    this._horrocube = this.api.getCurrentCube();

    if (this._horrocube == undefined || this._horrocube.assetName === '')
    {
      this.router.navigate(['/explore']);
      return;
    }

    this._imageUrl = 'https://storage.googleapis.com/horrocubes_small/' + this._horrocube.imageLink;
    this._signatureUrl = environment.ipfsBaseUrl + this._horrocube.signatureLink;

    this._signatureContent = '{ <br>' +
                             '&nbsp;&nbsp;"securityAlgorithm": "EcdsaSecp256k1Sha256",<br>\n' +
                             '&nbsp;&nbsp;"r": "' + this._horrocube.signatureR + '",<br>' +
                             '&nbsp;&nbsp;"s": "' + this._horrocube.signatureS + '"<br>' +
                             '}';

    this._isSingleIdPolicy = this._horrocube.policyId === environment.cubePolicyId;
    if (this._isSingleIdPolicy)
    {
        this._policyScript = this.api.getDefaultCubePolicyScript();
    }
    else
    {
      this.api.getPolicyScript(this._horrocube.mintingUtxo, this._horrocube.assetName).subscribe((res) => {
        this._policyScript = JSON.stringify(res); });
    }
  }

  parseAssetName(name: string)
  {
    return name.substr(9, 5);
  }

  parseCardName(key: string)
  {
    return this._cardStrings[key];
  }
}
