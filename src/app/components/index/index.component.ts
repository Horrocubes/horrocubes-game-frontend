import {Value } from '../../vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { CardanoRef } from '../../models/CardanoRef';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Horrocube } from '../../models/Horrocube';
import { Horrocard } from '../../models/Horrocard';
import { CardanoService } from '../../cardano.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})

/**
 * Index Component
 */
export class IndexComponent implements OnInit {

  cubes: Horrocube[] = [];
  cards: Horrocard[] = [];
  isLoading: boolean =  true;
  isConnected: boolean =  false;
  isNamiWalletPresent: boolean = false;
  constructor(private _cardano: CardanoService) {}

  ngOnInit(): void
  {
    if (!this._cardano.isWalletInjected())
    {
      console.log("Missing Nami Wallet");
      return;
    }

    this.isNamiWalletPresent = true;

    this._cardano.getConnectionState().subscribe(x => 
    {
      console.log(x);
      this.isConnected = x;

      if (this.isConnected)
      {
        this._cardano.getHorrocubes().subscribe(asset => 
          {
            this.cubes = [];
            this.cubes.push(asset);
            this.isLoading = false;
          });
          
      }
    });
  }


  parseAssetName(name: string)
  {
    return name.substr(9, 5);
  }
}
