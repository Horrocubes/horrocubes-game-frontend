import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Horrocube } from 'src/app/models/Horrocube';
import { environment } from './../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ApiService }        from '../../api.service';

@Component({
  selector: 'card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.css']
})

/***
 * CardDetailsComponent Component
 */
export class CardDetailsComponent implements OnInit {
  _horrocard;
  _imageUrl;
  _policyScript;
  _signatureContent;


  constructor(private api: ApiService, private router:Router) { }

  ngOnInit(): void {
    this._horrocard = this.api.getCurrentCard();

    if (this._horrocard == undefined || this._horrocard.assetName === "")
    {
      this.router.navigate(['/explore']);
      return;
    }

    this._imageUrl = "https://storage.googleapis.com/horrocubes-cards-small/" + this._horrocard.imageLink;

    this._signatureContent = "{ <br>"+
                             "&nbsp;&nbsp;\"securityAlgorithm\": \"EcdsaSecp256k1Sha256\",<br>\n" +
                             "&nbsp;&nbsp;\"r\": \"" + this._horrocard.signatureR + "\",<br>" +
                             "&nbsp;&nbsp;\"s\": \"" + this._horrocard.signatureS + "\"<br>" +
                             "}"

    this.api.getPolicyScript(this._horrocard.mintingUtxo, this._horrocard.assetName).subscribe((res) => {
      this._policyScript = JSON.stringify(res)});  

  }

  parseAssetName(name: string)
  {
    return name.substr(name.length - 5, name.length);
  }

  getDescription(name: string)
  {
    if (name.indexOf('HorrocardTheFoolHalloween21') !== -1)
    {
      return "Horrocubes Halloween 2021 special edition. This card can no longer be obtained.";
    }
    
    return this._horrocard.description;
  }

  cleanCardName(name: string)
  {
    name = name.replace('Horrocard - ', '');
    name = name.split(' #')[0];
    return name;
  }
}
