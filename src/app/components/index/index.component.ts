/**
 * @file IndexComponent.ts
 *
 * @author Angel Castillo <angel.castillo@horrocubes.io>
 * @date   Dec 10 2021
 *
 * @copyright Copyright 2021 Horrocubes.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* IMPORTS *******************************************************************/

import { Component, OnInit }    from '@angular/core';
import { Horrocube }            from '../../models/Horrocube';
import { Collectible }          from '../../models/Collectible';
import { DAppConnectorService } from '../../DAppConnector.service';
import { DatumMappings }        from '../../data/DatumMappings';
import { Router }               from '@angular/router';

// EXPORTS ************************************************************************************************************/

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
  inActiveCubes: Horrocube[] = [];
  collectibles: Collectible[] = [];
  isLoading =  true;
  isConnected =  false;
  isNamiWalletPresent = false;

  /**
   * @summary Initializes a new instance of the Footer class.
   * 
   * @param _cardano The Cardano dApp connector.
   * @param router The router.
   */
  constructor(private _cardano: DAppConnectorService, private router: Router)
  {
  }

  /**
   * @summary Initialize the component after Angular initializes the data-bound input properties.
   */
  ngOnInit(): void
  {
    if (!this._cardano.isWalletInjected())
    {
      console.log('Missing Nami Wallet');
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
              for (let i = 0; i < asset.stories.length; ++i)
              {
                if (asset.stories[i].eUtxoId === null || asset.stories[i].eUtxoId.datumhash === null) {
                  continue;
                }

                asset.stories[i].currentLevel = DatumMappings.getLevelFromDatum(asset.stories[i].eUtxoId.content.datumhash);
              }
            }

            if (asset.stories.length > 0)
            {

              for (let i=0 ; i< this.cubes.length; ++i)
              {
                if (this.cubes[i].name === asset.name)
                  return;
              }
              
              this.cubes.push(asset);
              this.cubes.sort((a, b) => a.assetName.localeCompare(b.assetName));
              this.isLoading = false;
            }
            else
            {
              for (let i=0 ; i < this.inActiveCubes.length; ++i)
              {
                if (this.inActiveCubes[i].name === asset.name)
                  return;
              }

              this.inActiveCubes.push(asset);
              this.inActiveCubes.sort((a, b) => a.assetName.localeCompare(b.assetName));
              this.isLoading = false;
            }
          });
      }
    });
  }

  /**
   * Gets the current progress of this cube in this story.
   * 
   * @param horrocube The cube to get the story from.
   * 
   * @returns The progress percentage.
   */
  getProgress(horrocube: Horrocube)
  {
    return (horrocube.stories[0]?.currentLevel) * (100 / horrocube.stories[0]?.levels.length);
  }

  /**
   * Gets whether this wallet has any Horrocubes.
   * 
   * @return true if has cubes; otherwise; false.
   */
  hasCubes(): boolean
  {
    return this.inActiveCubes.length > 0 || this.cubes.length > 0;
  }

  /**
   * Parses the asset name (takes the serial digits only)
   * 
   * @param name The asset name.
   * 
   * @returns The serial numbers.
   */
  parseAssetName(name: string)
  {
    return name.substr(9, 5);
  }

  /**
   * Parses the card name (takes the serial digits only).
   * 
   * @param name The card name.
   * 
   * @returns The serial numbers.
   */
  parseCardAssetName(name: string)
  {
    if (name.includes('Horrocard')) {
      return name.substr(name.length - 5, 5);
    }

    return name.substr(name.length - 14, 5);
  }

  /**
   * Cleans the Card name.
   * 
   * @param name The card name.
   * 
   * @returns The cleaned card name.
   */
  cleanCardName(name: string)
  {
    name = name.replace('Horrocard - ', '');
    name = name.split(' #')[0];
    return name;
  }

  /**
   * Opens a story.
   * 
   * @param cube The cube to open the story for.
   */
  openStory(cube: Horrocube)
  {
    this._cardano.setCurrentCube(cube);
    this.router.navigate(['/story']);
  }
}
