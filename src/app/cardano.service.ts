/**
 * @file CardanoService.ts
 *
 * @author Angel Castillo <angel.castillo@horrocubes.io>
 * @date   Dec 10 2021
 *
 * @copyright Copyright 2021 Horrocubes
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

import { Injectable }                                 from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, concatMap, mergeMap, map }       from 'rxjs/internal/operators';
import { environment }                                from './../environments/environment';
import { Session }                                    from './models/Session';
import { Horrocube }                                  from './models/Horrocube';
import { Horrocard }                                  from './models/Horrocard';
import { Story }                                      from './models/Story';
import { CardanoRef }                                 from './models/CardanoRef';
import * as internal from 'events';
import * as EmurgoSerialization from './vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
import { Value } from                './vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
import { Subject, defer } from 'rxjs';
import { switchMap, filter, tap } from 'rxjs/operators';
import { Buffer } from "buffer";
import { Level } from './models/Level';
import { ApiService } from './api.service';
import CoinSelection from './vendors/coinSelection.js'
import * as libsodiumWrappers from "libsodium-wrappers";
import * as blake from "blake2b"
import { Policies } from "./data/Policies"
import { BlockchainParameters } from "./data/BlockchainParameters"
import { DatumMappings } from "./data/DatumMappings"

// EXPORTS ************************************************************************************************************/

@Injectable({
  providedIn: 'root'
})
export class CardanoService
{
  public cubes: Horrocube[] = [];  
  public _isConnected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _interval;
  _isWalletEnabled = false;

  DATUM_LABEL = 405;
  ADDRESS_LABEL = 406;

  constructor(private _cardanoRef: CardanoRef, private _http: HttpClient, private _apiService: ApiService)
  {
  }

  getConnectionState()
  {
    return this._isConnected$;
  }

  requestWalletAccess()
  {
    this.startTimer();
    defer(() => this._cardanoRef.cardano.enable()).pipe(tap((isWalletEnabled)=> 
    {
      this._isWalletEnabled = isWalletEnabled;
      this._isConnected$.next(isWalletEnabled);
    })).subscribe();
  }

  isWalletConnected()
  {
    return defer(() => this._cardanoRef.cardano.isEnabled()).pipe(tap((isWalletEnabled)=> 
    {
      this._isWalletEnabled = isWalletEnabled;
      this._isConnected$.next(isWalletEnabled);
    }));
  }

  isWalletInjected()
  {
    return this._cardanoRef.cardano !== undefined;
  }

  getWalletInstance()
  {
    return this._cardanoRef;
  }
  getAdaBalance()
  {
  }

  // horrocube, story, asset_id, metadata, script address, contract.plutus 
  getHorrocubes() : Observable<any>
  {
    const walletObservable$ = defer(() => this._cardanoRef.cardano.getBalance());

    return walletObservable$.pipe(map((result) =>
    {
      let val:Value = Value.from_bytes(Buffer.from(result, "hex"));

      let assets = this.valueToAssets(val);


      assets = assets.filter((x) => x.unit !== 'lovelace' && Policies.isValidCube(x.policyId));
      return assets;
    }))
    .pipe(concatMap(x => x))
    .pipe(mergeMap(x => this._apiService.getStories(x.policyId + "." + x.tokenName)))
    .pipe(map(x => this.createHorrocube(x)));
}

  getHorrocards()
  {
    const walletObservable$ = defer(() => this._cardanoRef.cardano.getBalance());

    return walletObservable$.pipe(map((result) =>
    {
      let val:Value = Value.from_bytes(Buffer.from(result, "hex"));

      let assets = this.valueToAssets(val);

      assets = assets.filter((x) => x.unit !== 'lovelace' && Policies.isValidCollectible(x.policyId));

      return assets;
    }))
    .pipe(concatMap(x => x))
    .pipe(mergeMap(x => this.getAssetDetail(x.unit)))
    .pipe(map(x => this.createHorrocard(x)));
  }

  getAssetDetail(asset_id): Observable<any>
    {
      var HOST = 'https://cardano-testnet.blockfrost.io/api/v0/assets/';

      // Step 1
    const httpHeaders: HttpHeaders = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'project_id': 'testnetozfiHqTtDYvfiwgG4PQmRyt5E3tBJVDs'
    });

      return this._http.get(HOST + asset_id, { headers: httpHeaders });
  };


 valueToAssets(value: Value)
 {
       const assets = [];
       assets.push({ unit: "lovelace", quantity: value.coin().to_str() });
       if (value.multiasset()) {
         const multiAssets = value.multiasset().keys();
         for (let j = 0; j < multiAssets.len(); j++) {
           const policy = multiAssets.get(j);
           const policyAssets = value.multiasset().get(policy);
           const assetNames = policyAssets.keys();
           for (let k = 0; k < assetNames.len(); k++) {
             const policyAsset = assetNames.get(k);
             const quantity = policyAssets.get(policyAsset);
             const asset =
             assets.push({
               policyId: Buffer.from(policy.to_bytes()).toString("hex"),
               tokenName: Buffer.from(policyAsset.name()).toString(),
               unit:Buffer.from(policy.to_bytes()).toString("hex") + Buffer.from(policyAsset.name()).toString("hex"),
               quantity: quantity.to_str(),
             });
           }
         }
       }
       return assets;
     };

  toHexString(byteArray) {
    return Array.from(byteArray, (byte: any)=> {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

  createHorrocube(asset)
  {
    let cube: Horrocube = new Horrocube(
      asset.cube.assetName,
      asset.cube.name,
      asset.cube.core,
      asset.cube.aspect,
      asset.cube.mechanism,
      asset.cube.commuter,
      asset.cube.supports,
      asset.cube.ornament,
      asset.cube.background,
      asset.cube.firstCard,
      asset.cube.secondCard,
      asset.cube.lastCard,
      this.getCachedUrl(asset.cube.persistentImageLink),
      asset.cube.persistentImageLink,
      "",
      "",
      asset.cube.policyId,
      "",
      "");

      for (let  i = 0; i < asset.stories.length; ++i)
      {
        let story: Story = new Story();

        let metadata = JSON.parse(asset.stories[i].metadata);

        story.assetId = asset.stories[i].policyId;
        story.currentLevel = 0;
        story.image = this.getCachedUrl(metadata.image);
        story.name = metadata.name;
        story.scriptAddress = asset.stories[i].scriptAddress;

        if(asset.utxos[i] === undefined)
          continue;

        story.eUtxoId = JSON.parse(asset.utxos[i]);
        story.plutusScript = JSON.parse(asset.stories[i].plutusScript)

        metadata.description.forEach(segment =>
        {
          story.description += segment;
        });

        let lvls:Level[] = [];
        metadata.levels.forEach(level =>
        {
          let lvl: Level = new Level(level.title, level.content, [], level.answer);
          lvls.push(lvl);
        });

        story.levels = lvls;

        if (Object.keys(story.eUtxoId).length > 0)
            cube.stories.push(story);
      }

    return cube;
  }

  fromHex = (hex) => Buffer.from(hex, "hex");
  toHex = (bytes) => Buffer.from(bytes).toString("hex");

  
  createStory(asset)
  {
    let cube: Horrocube = new Horrocube(
      this.hex2a(asset.asset_name),
      asset.onchain_metadata.name,
      asset.onchain_metadata.properties.core,
      asset.onchain_metadata.properties.aspect,
      asset.onchain_metadata.properties.mechanism,
      asset.onchain_metadata.properties.commuter,
      asset.onchain_metadata.properties.supports,
      asset.onchain_metadata.properties.ornament,
      asset.onchain_metadata.properties.background,
      asset.onchain_metadata.cards[0].name,
      asset.onchain_metadata.cards[1].name,
      asset.onchain_metadata.cards[2].name,
      this.getCachedUrl(asset.onchain_metadata.image),
      asset.onchain_metadata.image,
      "",
      "",
      asset.policy_id,
      "",
      "");

    return cube;
  }

  createHorrocard(asset)
  {
    let card: Horrocard = new Horrocard(
      this.hex2a(asset.asset_name),
      asset.onchain_metadata.name,
      asset.onchain_metadata.description,
      this.getCachedUrl(asset.onchain_metadata.image),
      asset.onchain_metadata.image,
      "",
      "",
      "",
      asset.policy_id,
      "",
      "");

    return card;
  }

  hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  a2Hex(str)
  {
    var arr1 = [];
    for (var n = 0, l = str.length; n < l; n ++) 
      {
      var hex = Number(str.charCodeAt(n)).toString(16);
      arr1.push(hex);
    }
    return arr1.join('');
  }

  getCachedUrl(url: string)
  {
    return "https://storage.googleapis.com/horrocubes_small_ipfs/" + url.replace("ipfs://", "") + ".png";
  }

  startTimer()
  {
    this._interval = setInterval(() => {
      this._cardanoRef.cardano.isEnabled().then(isWalletEnabled => 
        {
          if (isWalletEnabled !== this._isWalletEnabled)
          {
            this._isWalletEnabled = isWalletEnabled;
            this._isConnected$.next(isWalletEnabled);
          }
        });
    },5000)
  }
}