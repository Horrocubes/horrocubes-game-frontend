import {Value } from '../../vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
import { Buffer } from "buffer";
import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import * as EmurgoSerialization from '../../vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
import { CardanoRef } from '../../models/CardanoRef';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})


/**
 * Index Component
 */

 //testnetozfiHqTtDYvfiwgG4PQmRyt5E3tBJVDs
export class IndexComponent implements OnInit {

  constructor(private _cardanoRef: CardanoRef, private _http: HttpClient) {}

  ngOnInit(): void
  {
    console.log(EmurgoSerialization);
    console.log(EmurgoSerialization.BigNum.from_str("1").to_str());

    
    console.log(this._cardanoRef.cardano.enable().then((result) => console.log(result)));

    console.log(this._cardanoRef.cardano);
    console.log(this._cardanoRef.cardano.getBalance().then((result: string) =>
    {
      let val:Value = Value.from_bytes(Buffer.from(result, "hex"));
      let assets = this.valueToAssets(val);

      for (let i = 0; i < assets.length; ++i)
      {
        if (assets[i].unit === 'lovelace')
          continue;

        this.getAssetDetail(assets[i].unit).subscribe((result) => console.log(result));
      }
      
    }));
  }

  scrollToRewards() {
    let element = document.getElementById("rewards");
    
      if(element) {
        element.scrollIntoView(); // scroll to a particular element
      }
     }

     //c80b6a4ecfcc6632ab03c4ca4afe94a8613c4972db3aa9afcd155cc1486f72726f63617264546865466f6f6c48616c6c6f7765656e32313030303036
     //e4a17bd85c7394d900a3c2942c01fb5d9e862537fbe6a2cdfbe319cd486f72726f637562653030303533
    // curl -H 'project_id: testnetozfiHqTtDYvfiwgG4PQmRyt5E3tBJVDs' https://cardano-testnet.blockfrost.io/api/v0/asset/e4a17bd85c7394d900a3c2942c01fb5d9e862537fbe6a2cdfbe319cd486f72726f637562653030303533

    getAssetDetail(asset_id): Observable<any>
    {
      var HOST = 'https://cardano-testnet.blockfrost.io/api/v0/assets/';
      console.log(asset_id);
      console.log(HOST + '/asset/' + asset_id);

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
      console.log(value);
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
               unit:Buffer.from(policy.to_bytes()).toString("hex")+Buffer.from(policyAsset.name()).toString("hex"),
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

  hex2a(hexx) {
    if (!hexx) {
        return "";
    }
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
}
