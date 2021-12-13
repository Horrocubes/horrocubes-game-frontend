/**
 * @file DAppConnectorService.ts
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

import { Injectable }                              from '@angular/core';
import { HttpClient, HttpErrorResponse }           from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, concatMap, mergeMap, map }    from 'rxjs/internal/operators';
import { environment }                             from '../environments/environment';
import { Horrocube }                               from './models/Horrocube';
import { Story }                                   from './models/Story';
import { CardanoRef }                              from './models/CardanoRef';
import { Value }                                   from './vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import { defer }                                   from 'rxjs';
import { tap }                                     from 'rxjs/operators';
import { Buffer }                                  from 'buffer';
import { Level }                                   from './models/Level';
import { Policies }                                from './data/Policies';
import { Collectible }                             from './models/Collectible';
import { BlockchainParameters }                    from "./data/BlockchainParameters"
import { DatumMappings }                           from "./data/DatumMappings"
import { BetaStoryOutputs }                        from "./data/BetaStoryOutputs"
import CoinSelection                               from './vendors/coinSelection.js'
import * as blake                                  from "blake2b"
import * as EmurgoSerialization                    from './vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'

// CONSTANTS **********************************************************************************************************/

/* TODO: These constants are hardcoded for the beta, however this should change depending on the story */
const MAX_PUZZLE_INDEX:  number = 3;
const STORY_NFT_PREFIX:  string = "Story0000Horrocube";
const TROPHY_NFT_PREFIX: string = "AzathothianPillar";
const REWARDS_POLICY_ID: string = "6e8d3a062f9ab1d0b44c95ab4970e4ed8c8c9f99b577c3d3ee0cc97c";
const ADA_LOVELACE:      string = "lovelace";
const MEM_BUDGET:        string = "12500000";
const CPU_BUDGET:        string = "3500000000";

// EXPORTS ************************************************************************************************************/

@Injectable(
{
  providedIn: 'root'
})

/**
 * @summary Service for signing and sending transactions to the blockchain.
 *
 * @remark Most of the code in this class was taken from https://github.com/Berry-Pool/spacebudz.
 */
export class DAppConnectorService
{
  private _isConnected$: BehaviorSubject < boolean > = new BehaviorSubject < boolean > (false);

  /**
   * Initiaize a new instance of the DAppConnector class.
   */
  constructor(private _cardanoRef: CardanoRef, private httpClient: HttpClient)
  {
    CoinSelection.setProtocolParameters(
      BlockchainParameters.getProtocolParameters().minUtxo,
      BlockchainParameters.getProtocolParameters().linearFee.minFeeA,
      BlockchainParameters.getProtocolParameters().linearFee.minFeeB,
      BlockchainParameters.getProtocolParameters().maxTxSize.toString()
    );
  }

  // RESTFUL CALLS ******************************************************************************************************/

  /**
   * Tracks the state of a transaction.
   * 
   * @param id The transaction id.
   * 
   * @returns True if the transaction has been confirmed; otherwise; false.
   */
  trackTransaction(id: String): Observable < Horrocube >
  {
    return this.httpClient.get < any > (environment.apiBaseUrl + 'isTransactionVerified/' + id)
      .pipe(catchError(this.handleError))
      .pipe(map(value => value.confirmed));
  }

  /**
   * Gets the list of stories for the given Horrocube.
   * 
   * @param cube The horrocube.
   * 
   * @returns The stories.
   */
  getStories(cube: string): Observable < any >
  {
    return this.httpClient.get < any > (environment.apiBaseUrl + 'getStories/' + cube);
  }

  /**
   * Gets the asset metadata.
   * 
   * @param policyId The policy ID of the asset.
   * @param tokenName The token name of the asset.
   * 
   * @returns The metadata.
   */
  getAssetDetail(policyId, tokenName): Observable < any >
  {
    return this.httpClient.get < any > (environment.apiBaseUrl + 'getAssetData/' + policyId + '/' + tokenName);
  }

  // WALLET FUNCTIONS ***************************************************************************************************/

  /**
   * Gets whether the user is connected to the wallet.
   * 
   * @returns Observable with the wallet connection state.
   */
  getConnectionState()
  {
    return this._isConnected$;
  }

  /**
   * Request wallet access to the user.
   */
  requestWalletAccess()
  {
    defer(() => this._cardanoRef.cardano.enable()).pipe(tap((isWalletEnabled) =>
    {
      this._isConnected$.next(isWalletEnabled);
    })).subscribe();
  }

  /**
   * Gets whether the wallet is connected.
   * 
   * @returns true if the wallet is connected; otherwise; false.
   */
  isWalletConnected()
  {
    return defer(() => this._cardanoRef.cardano.isEnabled()).pipe(tap((isWalletEnabled) =>
    {
      this._isConnected$.next(isWalletEnabled);
    }));
  }

  /**
   * Gets whether the Nami wallet is injected in the browser.
   * 
   * @returns true if the wallet is injected; otherwise; false.
   */
  isWalletInjected()
  {
    return this._cardanoRef.cardano !== undefined;
  }

  /**
   * Gets the wallet instance.
   * 
   * @returns The wallet instance
   */
  getWalletInstance()
  {
    return this._cardanoRef.cardano;
  }

  /**
   * Gets the Horrocubes on the current wallet.
   * 
   * @returns An observable with the Horrocubes.
   */
  getHorrocubes(): Observable < any >
  {
    const walletObservable$ = defer(() => this._cardanoRef.cardano.getBalance());

    return walletObservable$.pipe(map((result) =>
      {
        const val: Value = Value.from_bytes(Buffer.from(result, 'hex'));

        let assets = this.valueToAssets(val);


        assets = assets.filter((x) => x.unit !== ADA_LOVELACE && Policies.isValidCube(x.policyId));
        return assets;
      }))
      .pipe(concatMap(x => x))
      .pipe(mergeMap(x => this.getStories(x.policyId + '.' + x.tokenName)))
      .pipe(map(x => this.createHorrocube(x)));
  }

  /**
   * Gets all Horrocubes collectables from the wallet.
   * 
   * @returns Observable with the collectables.
   */
  getCollectibles()
  {
    const walletObservable$ = defer(() => this._cardanoRef.cardano.getBalance());

    return walletObservable$.pipe(map((result) =>
      {
        const val: Value = Value.from_bytes(Buffer.from(result, 'hex'));

        let assets = this.valueToAssets(val);

        assets = assets.filter((x) => x.unit !== ADA_LOVELACE && Policies.isValidCollectible(x.policyId));

        return assets;
      }))
      .pipe(concatMap(x => x))
      .pipe(mergeMap(x => this.getAssetDetail(x.policyId, x.tokenName)))
      .pipe(map(x =>
      {
        if (x === null)
          return x;

        return new Collectible(x.policyId, x.assetName, x.name, this.getCachedUrl(x.image));
      }));
  }

  /**
   * Creates a horrocube insntance from an asset.
   * 
   * @param asset The asset.
   * 
   * @returns The Horrocube.
   */
  createHorrocube(asset)
  {
    const cube: Horrocube = new Horrocube(
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
      '',
      '',
      asset.cube.policyId,
      '',
      '');

    for (let i = 0; i < asset.stories.length; ++i)
    {
      const story: Story = new Story();

      const metadata = JSON.parse(asset.stories[i].metadata);

      story.assetId = asset.stories[i].policyId;
      story.currentLevel = 0;
      story.image = this.getCachedUrl(metadata.image);
      story.name = metadata.name;
      story.scriptAddress = asset.stories[i].scriptAddress;

      if (asset.utxos[i] === undefined)
      {
        continue;
      }

      story.eUtxoId = JSON.parse(asset.utxos[i]);
      story.plutusScript = JSON.parse(asset.stories[i].plutusScript);

      metadata.description.forEach(segment =>
      {
        story.description += segment;
      });

      const lvls: Level[] = [];
      metadata.levels.forEach(level =>
      {
        const lvl: Level = new Level(level.title, level.content, [], level.answer);
        lvls.push(lvl);
      });

      story.levels = lvls;

      if (Object.keys(story.eUtxoId).length > 0)
      {
        cube.stories.push(story);
      }
    }

    return cube;
  }

  /**
   * Creates an story object from an asset object.
   * 
   * @param asset The asset object.
   * 
   * @returns The story object.
   */
  createStory(asset)
  {
    const cube: Horrocube = new Horrocube(
      this.hexToAscii(asset.asset_name),
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
      '',
      '',
      asset.policy_id,
      '',
      '');

    return cube;
  }

  /**
   * Gets the cache URL from the IPFS url.
   * 
   * @param url The IPFS url.
   * 
   * @returns The cache URL.
   */
  getCachedUrl(url: string)
  {
    return 'https://storage.googleapis.com/horrocubes_small_ipfs/' + url.replace('ipfs://', '') + '.png';
  }

  /**
   * Builds a transaction to interact with the Horrocubes contract.
   * 
   * @param horrocube The horrocube owning the eUTXO.
   * @param service  The Cardano service instance.
   * @param currentDatum The datum sitting in the current eUTXO.
   * @param nextDatum The datum to be added in the next eUTXO.
   * @param answerHash The answer pre image.
   * 
   * @returns The transaction.
   */
  async buildTransaction(horrocube: Horrocube, currentDatum: number, nextDatum: number, answerHash: string)
  {
    let redeemerObj = this.getRedeemer(currentDatum.toString(), answerHash);
    let originalDatumObj = this.getDatum(currentDatum.toString());
    let nextDatumObj = this.getDatum(nextDatum.toString());

    const datums = EmurgoSerialization.PlutusList.new();
    const outputs = EmurgoSerialization.TransactionOutputs.new();

    let txBuilder: EmurgoSerialization.TransactionBuilder = this.createTranscationBuilder();

    const walletAddress = EmurgoSerialization.BaseAddress.from_address(
      EmurgoSerialization.Address.from_bytes(this.fromHex((await this.getWalletInstance().getUsedAddresses())[0])));

    const utxos = (await this.getWalletInstance().getUtxos())
      .map((utxo) => EmurgoSerialization.TransactionUnspentOutput.from_bytes(this.fromHex(utxo)));

    if (currentDatum < MAX_PUZZLE_INDEX)
      datums.add(nextDatumObj);

    datums.add(originalDatumObj);

    let storyToken;
    let trophyToken;

    this.parseObjectProperties(horrocube.stories[0].eUtxoId.content.value, (k, prop) =>
    {

      if (k.includes(STORY_NFT_PREFIX))
        storyToken = REWARDS_POLICY_ID + this.toHex(k);

      if (k.includes(TROPHY_NFT_PREFIX))
        trophyToken = REWARDS_POLICY_ID + this.toHex(k);
    })

    let originalBalance = BetaStoryOutputs.getOriginalBalance(currentDatum, storyToken, trophyToken);
    let newOutputBallance = BetaStoryOutputs.getNewBalance(currentDatum, storyToken, trophyToken);

    let claimCoin = BetaStoryOutputs.getClaimBalance(currentDatum,
      horrocube.policyId + this.toHex(horrocube.assetName),
      storyToken,
      trophyToken);

    if (currentDatum < MAX_PUZZLE_INDEX)
      outputs.add(this.createOutput(EmurgoSerialization.Address.from_bech32(horrocube.stories[0].scriptAddress), newOutputBallance, nextDatumObj));

    outputs.add(this.createOutput(walletAddress.to_address(), claimCoin, null));
    outputs.add(this.createOutput(walletAddress.to_address(), BetaStoryOutputs.getAdaOnlyBalance(), null));

    let utxoId = horrocube.stories[0].eUtxoId.id.split('#')[0];
    let utxoIndex = horrocube.stories[0].eUtxoId.id.split('#')[1];

    let scriptUtxo = EmurgoSerialization.TransactionUnspentOutput.new(
      EmurgoSerialization.TransactionInput.new(EmurgoSerialization.TransactionHash.from_bytes(this.fromHex(utxoId)), parseInt(utxoIndex)),
      EmurgoSerialization.TransactionOutput.new(this.getContractAddress(horrocube.stories[0].scriptAddress), originalBalance));

    let plutusScript = this.getContract(horrocube.stories[0].plutusScript);

    const transactionWitnessSet = EmurgoSerialization.TransactionWitnessSet.new();
    const redeemers = EmurgoSerialization.Redeemers.new();

    let
    {
      input,
      change
    } = CoinSelection.randomImprove(utxos, outputs, 8, scriptUtxo ? [scriptUtxo] : []);

    input.forEach((utxo) =>
    {
      txBuilder.add_input(
        utxo.output().address(),
        utxo.input(),
        utxo.output().amount()
      );
    });

    for (let i = 0; i < outputs.len(); i++)
      txBuilder.add_output(outputs.get(i));

    if (scriptUtxo)
    {
      const redeemerIndex = txBuilder
        .index_of_input(scriptUtxo.input())
        .toString();

      let redeemer = EmurgoSerialization.Redeemer.new(
        EmurgoSerialization.RedeemerTag.new_spend(),
        EmurgoSerialization.BigNum.from_str(redeemerIndex),
        redeemerObj,
        EmurgoSerialization.ExUnits.new(
          EmurgoSerialization.BigNum.from_str(MEM_BUDGET),
          EmurgoSerialization.BigNum.from_str(CPU_BUDGET)
        )
      );

      redeemers.add(redeemer);

      txBuilder.set_redeemers(EmurgoSerialization.Redeemers.from_bytes(redeemers.to_bytes()));
      txBuilder.set_plutus_data(EmurgoSerialization.PlutusList.from_bytes(datums.to_bytes()));
      txBuilder.set_plutus_scripts(plutusScript);

      const collateral = (await this.getWalletInstance().getCollateral()).map((utxo) =>
        EmurgoSerialization.TransactionUnspentOutput.from_bytes(this.fromHex(utxo))
      );

      this.setCollateral(txBuilder, collateral);

      transactionWitnessSet.set_plutus_scripts(plutusScript);
      transactionWitnessSet.set_plutus_data(datums);
      transactionWitnessSet.set_redeemers(redeemers);
    }

    let auxData = EmurgoSerialization.AuxiliaryData.new();
    const generalMetadata = EmurgoSerialization.GeneralTransactionMetadata.new();
    auxData.set_metadata(generalMetadata);
    txBuilder.set_auxiliary_data(auxData);

    const changeMultiAssets = change.multiasset();

    // check if change value is too big for single output
    if (changeMultiAssets && change.to_bytes().length * 2 > BlockchainParameters.getProtocolParameters().maxValSize)
    {
      const partialChange = EmurgoSerialization.Value.new(EmurgoSerialization.BigNum.from_str("0"));

      const partialMultiAssets = EmurgoSerialization.MultiAsset.new();
      const policies = changeMultiAssets.keys();

      const makeSplit = () =>
      {
        for (let j = 0; j < changeMultiAssets.len(); j++)
        {
          const policy = policies.get(j);
          const policyAssets = changeMultiAssets.get(policy);
          const assetNames = policyAssets.keys();
          const assets = EmurgoSerialization.Assets.new();

          for (let k = 0; k < assetNames.len(); k++)
          {
            const policyAsset = assetNames.get(k);
            const quantity = policyAssets.get(policyAsset);

            assets.insert(policyAsset, quantity);

            const checkMultiAssets = EmurgoSerialization.MultiAsset.from_bytes(partialMultiAssets.to_bytes());

            checkMultiAssets.insert(policy, assets);

            const checkValue = EmurgoSerialization.Value.new(EmurgoSerialization.BigNum.from_str("0"));

            checkValue.set_multiasset(checkMultiAssets);

            if (checkValue.to_bytes().length * 2 >= BlockchainParameters.getProtocolParameters().maxValSize)
            {
              partialMultiAssets.insert(policy, assets);
              return;
            }
          }

          partialMultiAssets.insert(policy, assets);
        }
      };
      makeSplit();

      partialChange.set_multiasset(partialMultiAssets);

      const minAda = EmurgoSerialization.min_ada_required(partialChange,
        EmurgoSerialization.BigNum.from_str(BlockchainParameters.getProtocolParameters().minUtxo));

      partialChange.set_coin(minAda);

      txBuilder.add_output(
        EmurgoSerialization.TransactionOutput.new(
          walletAddress.to_address(),
          partialChange));
    }

    txBuilder.add_change_if_needed(walletAddress.to_address());

    const txBody = txBuilder.build();

    const tx = EmurgoSerialization.Transaction.new(
      txBody,
      EmurgoSerialization.TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
      auxData);

    const size = tx.to_bytes().length * 2;

    if (size > BlockchainParameters.getProtocolParameters().maxTxSize)
      throw new Error("MAX_SIZE_REACHED");

    let originalRedeemers = this.toHex(redeemers.to_bytes());
    let originalDatums = this.toHex(datums.to_bytes());

    let newDatums = originalDatums.replace(DatumMappings.getSerializationLibDatumData(currentDatum), DatumMappings.getCliDatumData(currentDatum)).replace(DatumMappings.getSerializationLibDatumData(nextDatum), DatumMappings.getCliDatumData(nextDatum));
    let output = new Uint8Array(32)
    let dataX = this.fromHex(originalRedeemers + originalDatums + BlockchainParameters.getLanguageViews());

    let originalScriptDataHash = blake(output.length).update(dataX).digest('hex');

    let output2 = new Uint8Array(32)
    let dataX2 = this.fromHex(originalRedeemers + newDatums + BlockchainParameters.getLanguageViews());

    let newDataHash = blake(output2.length).update(dataX2).digest('hex');

    // HACK: Replace the serialized datum from the serialization lib with the Cardano CLI serialized datum. 
    let fixedTx = this.toHex(tx.to_bytes()).replace(DatumMappings.getSerializationLibDatumHash(currentDatum), DatumMappings.getCliDatumHash(currentDatum));
    fixedTx = fixedTx.replace(DatumMappings.getSerializationLibDatumHash(nextDatum), DatumMappings.getCliDatumHash(nextDatum));
    fixedTx = fixedTx.replace(DatumMappings.getSerializationLibDatumData(currentDatum), DatumMappings.getCliDatumData(currentDatum));
    fixedTx = fixedTx.replace(DatumMappings.getSerializationLibDatumData(nextDatum), DatumMappings.getCliDatumData(nextDatum));
    fixedTx = fixedTx.replace(originalScriptDataHash, newDataHash);

    let txVkeyWitnesses = await this.getWalletInstance().signTx(fixedTx, true);
    txVkeyWitnesses = EmurgoSerialization.TransactionWitnessSet.from_bytes(this.fromHex(txVkeyWitnesses));

    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

    const signedTx = EmurgoSerialization.Transaction.new(
      tx.body(),
      transactionWitnessSet,
      tx.auxiliary_data()
    );

    console.log("Full Tx Size", signedTx.to_bytes().length);

    // HACK: Replace the serialized datum from the serialization lib with the Cardano CLI serialized datum. 
    let fixedSignedTx = this.toHex(signedTx.to_bytes()).replace(DatumMappings.getSerializationLibDatumHash(currentDatum), DatumMappings.getCliDatumHash(currentDatum));
    fixedSignedTx = fixedSignedTx.replace(DatumMappings.getSerializationLibDatumHash(nextDatum), DatumMappings.getCliDatumHash(nextDatum));
    fixedSignedTx = fixedSignedTx.replace(DatumMappings.getSerializationLibDatumData(currentDatum), DatumMappings.getCliDatumData(currentDatum));
    fixedSignedTx = fixedSignedTx.replace(DatumMappings.getSerializationLibDatumData(nextDatum), DatumMappings.getCliDatumData(nextDatum));
    fixedSignedTx = fixedSignedTx.replace(originalScriptDataHash, newDataHash);

    return fixedSignedTx;
  }

  /**
   * Sends a signed transaction to the blockchain.
   * 
   * @param service The cardano service.
   * @param tx The transaction.
   * 
   * @returns the transaction hash.
   */
  async sendTransaction(service, tx: string)
  {
    const txHash = await service.getWalletInstance().cardano.submitTx(tx);
    return txHash;
  }

  /**
   * Creates the transaction builder object.
   * 
   * @returns The transaction builder.
   */
  createTranscationBuilder()
  {
    let protocolParameters = BlockchainParameters.getProtocolParameters();

    const txBuilder = EmurgoSerialization.TransactionBuilder.new(
      EmurgoSerialization.LinearFee.new(
        EmurgoSerialization.BigNum.from_str(
          protocolParameters.linearFee.minFeeA
        ),
        EmurgoSerialization.BigNum.from_str(
          protocolParameters.linearFee.minFeeB
        )
      ),
      EmurgoSerialization.BigNum.from_str(protocolParameters.minUtxo),
      EmurgoSerialization.BigNum.from_str(protocolParameters.poolDeposit),
      EmurgoSerialization.BigNum.from_str(protocolParameters.keyDeposit),
      protocolParameters.maxValSize,
      protocolParameters.maxTxSize,
      protocolParameters.priceMem,
      protocolParameters.priceStep,
      EmurgoSerialization.LanguageViews.new(Buffer.from(BlockchainParameters.getLanguageViews(), "hex"))
    );
    return txBuilder;
  }

  /**
   * Creates a new eUTXO.
   * 
   * @param address The target address.
   * @param value The value to be locked on the eUTXO.
   * @param datum The datum sitting at the eUTXO.
   * 
   * @return The new output.
   */
  createOutput(address, value, datum)
  {
    let protocolParameters = BlockchainParameters.getProtocolParameters();

    const v = value;
    const minAda = EmurgoSerialization.min_ada_required(
      v,
      EmurgoSerialization.BigNum.from_str(protocolParameters.minUtxo),
      datum && EmurgoSerialization.hash_plutus_data(datum)
    );

    if (minAda.compare(v.coin()) == 1)
      v.set_coin(minAda);

    const output = EmurgoSerialization.TransactionOutput.new(address, v);

    if (datum)
      output.set_data_hash(EmurgoSerialization.hash_plutus_data(datum));

    return output;
  }

  /**
   * Sets the collatera utxo on the transaction.
   * 
   * @param txBuilder The transaction builder.
   * @param utxos The utxos to be used as collateral.
   * 
   */
  setCollateral(txBuilder, utxos)
  {
    const inputs = EmurgoSerialization.TransactionInputs.new();
    utxos.forEach((utxo) =>
    {
      inputs.add(utxo.input());
    });
    txBuilder.set_collateral(inputs);
  }

  /**
   * Creates the PlutusScript from the serialized CBOR string.
   * 
   * @param contract The contract serialized as a CBOR string.
   * 
   * @returns Gets the PlutusScript.
   */
  getContract(contract)
  {

    const scripts = EmurgoSerialization.PlutusScripts.new();
    scripts.add(EmurgoSerialization.PlutusScript.new(this.fromHex(contract.cborHex.slice(6))));
    return scripts;
  };

  /**
   * Builds a Address instance from the bech32 encoded address.
   * 
   * @param address The bech32 encoded address.
   * 
   * @returns The contract address object.
   */
  getContractAddress(address)
  {
    return EmurgoSerialization.Address.from_bech32(address);
  }

  /**
   * Gets a datum object from the given value.
   * 
   * @param level The current leve to be encoded on the Datum.
   * 
   * @returns The datum object.
   */
  getDatum(level: string)
  {
    let fieldsInner = EmurgoSerialization.PlutusList.new();

    fieldsInner.add(EmurgoSerialization.PlutusData.new_integer(EmurgoSerialization.BigInt.from_str(level)));

    return EmurgoSerialization.PlutusData.new_constr_plutus_data(
      EmurgoSerialization.ConstrPlutusData.new(
        EmurgoSerialization.Int.new_i32(0),
        fieldsInner
      )
    );
  };

  /**
   * Gets the redeemer object from the given values.
   * 
   * @param level The level we are trying to clear.
   * @param answer the answer.
   * 
   * @returns The redeemer object.
   */
  getRedeemer(level: string, answer: string)
  {
    const fieldsInner = EmurgoSerialization.PlutusList.new();

    fieldsInner.add(EmurgoSerialization.PlutusData.new_integer(EmurgoSerialization.BigInt.from_str(level)));
    fieldsInner.add(EmurgoSerialization.PlutusData.new_bytes(this.fromHex(answer)));

    const redeemerData = EmurgoSerialization.PlutusData.new_constr_plutus_data(
      EmurgoSerialization.ConstrPlutusData.new(
        EmurgoSerialization.Int.new_i32(0),
        fieldsInner
      )
    );

    return redeemerData;
  };

  // INTERNALS **********************************************************************************************************/

  /**
   * Converts a value object the assets data structure.
   * 
   * @param value The value object.
   * 
   * @returns The aassets structure.
   */
  private valueToAssets(value: Value)
  {
    const assets = [];
    assets.push(
    {
      unit: ADA_LOVELACE,
      quantity: value.coin().to_str()
    });
    if (value.multiasset())
    {
      const multiAssets = value.multiasset().keys();
      for (let j = 0; j < multiAssets.len(); j++)
      {
        const policy = multiAssets.get(j);
        const policyAssets = value.multiasset().get(policy);
        const assetNames = policyAssets.keys();
        for (let k = 0; k < assetNames.len(); k++)
        {
          const policyAsset = assetNames.get(k);
          const quantity = policyAssets.get(policyAsset);
          const asset =
            assets.push(
            {
              policyId: Buffer.from(policy.to_bytes()).toString('hex'),
              tokenName: Buffer.from(policyAsset.name()).toString(),
              unit: Buffer.from(policy.to_bytes()).toString('hex') + Buffer.from(policyAsset.name()).toString('hex'),
              quantity: quantity.to_str(),
            });
        }
      }
    }
    return assets;
  }

  /**
   * Converts a hexadecimal string into a byte buffer.
   * 
   * @param hex the string to be converted.
   * 
   * @returns The byte array.
   */
  private fromHex(hex)
  {
    return Buffer.from(hex, "hex");
  }

  /**
   * Converts a byte array to a hex string.
   * 
   * @param bytes The bytes to be encoded into a hex string.
   * 
   * @returns The byte array.
   */
  private toHex(bytes: any)
  {
    return Buffer.from(bytes).toString("hex");
  }

  /**
   * Converts from hex to ASCII.
   * 
   * @param hex The HEX string to be converted to ASCII.
   * 
   * @returns The ASCII string.
   */
  private hexToAscii(hex)
  {
    const hexString = hex.toString();
    let str = '';

    for (let i = 0; i < hexString.length; i += 2)
      str += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));

    return str;
  }

  /**
   * Converts from ASCII to hex.
   * 
   * @param message The ASCII string to be encoded.
   * 
   * @returns The HEX encoded string.
   */
  private asciiToHex(message: string)
  {
    const hexArray = [];

    for (let n = 0, l = message.length; n < l; n++)
    {
      const hexChar = Number(message.charCodeAt(n)).toString(16);
      hexArray.push(hexChar);
    }

    return hexArray.join('');
  }

  /**
   * Parse all keys and values from a javascript object.
   * 
   * @param obj The object to be parsed.
   * @param parse The parsing callback.
   */
  private parseObjectProperties(obj, parse)
  {
    for (var k in obj)
    {
      if (typeof obj[k] === 'object' && obj[k] !== null)
      {
        this.parseObjectProperties(obj[k], parse)
      }
      else if (obj.hasOwnProperty(k))
      {
        parse(k, obj[k])
      }
    }
  }

  /**
   * Generic errorn handler for HTTP calls.
   * 
   * @param error The error.
   * 
   * @returns The error handler.
   */
  private handleError(error: HttpErrorResponse): any
  {
    if (error.error instanceof ErrorEvent)
    {
      console.error('An error occurred:', error.error.message);
    }
    else
    {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error.msg}`);
    }
    return throwError(`${error.error.msg}`);
  }
}