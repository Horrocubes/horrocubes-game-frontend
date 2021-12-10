import {Value } from '../../vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { CardanoRef } from '../../models/CardanoRef';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Horrocube } from '../../models/Horrocube';
import { Horrocard } from '../../models/Horrocard';
import { CardanoService } from '../../cardano.service';
import { StoryService } from '../../story.service';
import { DatumMappings } from '../../data/DatumMappings';
import { Router, NavigationEnd } from "@angular/router";

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
  constructor(private _cardano: CardanoService, private _story: StoryService, private router: Router) {}

  ngOnInit(): void
  {
    if (!this._cardano.isWalletInjected())
    {
      console.log("Missing Nami Wallet");
      return;
    }

    this.cubes = [];
    this.isNamiWalletPresent = true;

    this._cardano.getConnectionState().subscribe(x => 
    {
      this.isConnected = x;

      if (this.isConnected)
      {
        this._cardano.getHorrocubes().subscribe(asset => 
          {
            
            if (asset.stories.length > 0)
            {
              for (let i =0; i < asset.stories.length; ++i)
              {
                if (asset.stories[i].eUtxoId === null || asset.stories[i].eUtxoId.datumhash === null)
                  continue;

                asset.stories[i].currentLevel = DatumMappings.getLevelFromDatum(asset.stories[i].eUtxoId.content.datumhash);
              }
            }


            this.cubes.push(asset);
            this.cubes.sort((a, b) => a.assetName.localeCompare(b.assetName));
            this.isLoading = false;
          });

          this._cardano.getHorrocards().subscribe(asset => 
            {
              this.cards.push(asset);
              this.cards.sort((a, b) => a.assetName.localeCompare(b.assetName));
              this.isLoading = false;
            });
      }
    });
  }


  parseAssetName(name: string)
  {
    return name.substr(9, 5);
  }


  parseCardAssetName(name: string)
  {
    if (name.includes("Horrocard"))
      return name.substr(name.length - 5, 5); 

    return name.substr(name.length - 14, 5);
  }

  cleanCardName(name: string)
  {
    name = name.replace('Horrocard - ', '');
    name = name.split(' #')[0];
    return name;
  }

  openStory(cube: Horrocube)
  {
    this._story.setCurrentCube(cube);
    this.router.navigate(['/story']);
  }
}
