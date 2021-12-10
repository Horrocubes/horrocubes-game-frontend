/**
 * @file TransactionBuilder.ts
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

// IMPORTS ************************************************************************************************************/
import {
    Value
  } from "../vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib";
  import * as EmurgoSerialization from '../vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
  import {
    BlockchainParameters
  } from "../data/BlockchainParameters"
  import {
    DatumMappings
  } from "../data/DatumMappings"
  import {
    BetaStoryOutputs
  } from "../data/BetaStoryOutputs"
  import CoinSelection from '../vendors/coinSelection.js'
  import * as blake from "blake2b"
  import {
    CardanoService
  } from "../cardano.service";
  import {
    Horrocube
  } from "../models/Horrocube";
  import { Buffer } from "buffer";

  // CONSTANTS **********************************************************************************************************/
  
  /* TODO: These constants are hardcoded for the beta, however this should change depending on the story */
  const MAX_PUZZLE_INDEX:  number = 3;
  const STORY_NFT_PREFIX:  string = "Story0000Horrocube";
  const TROPHY_NFT_PREFIX: string = "AzathothianPillar";
  const REWARDS_POLICY_ID: string = "6e8d3a062f9ab1d0b44c95ab4970e4ed8c8c9f99b577c3d3ee0cc97c";
  const ADA_LOVELACE:      string = "lovelace";
  const MEM_BUDGET:        string = "12000000";
  const CPU_BUDGET:        string = "4000000000";
  const DATUM_LABEL:       number = 405;
  const ADDRESS_LABEL:     number = 406;

  // EXPORTS ************************************************************************************************************/
  
  /**
   * @summary Helper class for building, signing and sending transactions to the blockchain.
   *
   * @remark Most of the code in this class was taken from https://github.com/Berry-Pool/spacebudz.
   */
  export class DAppConnector
  {
    /**
     * Initiaize a new instance of the DAppConnector class.
     */
    constructor()
    {
        CoinSelection.setProtocolParameters(
            BlockchainParameters.getProtocolParameters().minUtxo,
            BlockchainParameters.getProtocolParameters().linearFee.minFeeA,
            BlockchainParameters.getProtocolParameters().linearFee.minFeeB,
            BlockchainParameters.getProtocolParameters().maxTxSize.toString()
        );
    }
  
    fromHex = (hex) => Buffer.from(hex, "hex");
    toHex(bytes: any) {
      return Buffer.from(bytes).toString("hex");
    }
  
    fromAscii(hex) {
      return Buffer.from(hex).toString("hex");
    }
  
    /**
     * Converts a given Value to a javascript object.
     * 
     * @param value The value to be converted.
     * 
     * @returns The new Javascript object.
     */
    valueToAssets(value: Value) {
      const assets = [];
      assets.push({
        unit: ADA_LOVELACE,
        quantity: value.coin().to_str()
      });
  
      if (value.multiasset()) {
        const multiAssets = value.multiasset().keys();
  
        for (let j = 0; j < multiAssets.len(); j++) {
          const policy = multiAssets.get(j);
          const policyAssets = value.multiasset().get(policy);
          const assetNames = policyAssets.keys();
  
          for (let k = 0; k < assetNames.len(); k++) {
            const policyAsset = assetNames.get(k);
            const quantity = policyAssets.get(policyAsset);
  
            assets.push({
              policyId: Buffer.from(policy.to_bytes()).toString("hex"),
              tokenName: Buffer.from(policyAsset.name()).toString(),
              unit: Buffer.from(policy.to_bytes()).toString("hex") + Buffer.from(policyAsset.name()).toString("hex"),
              quantity: quantity.to_str(),
            });
          }
        }
      }
      return assets;
    };
  
    /**
     * Converts the given byte array to a hex string.
     * 
     * @param byteArray The bytearray to be converted.
     * 
     * @returns The byte array as a hex string.
     */
    toHexString(byteArray) {
      return Array.from(byteArray, (byte: any) => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2)
      }).join('');
    }
  
    // use this recursive function with a parse funciton
    parseObjectProperties(obj, parse) {
      for (var k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
          this.parseObjectProperties(obj[k], parse)
        } else if (obj.hasOwnProperty(k)) {
          parse(k, obj[k])
        }
      }
    }
  
    async buildTransaction(horrocube: Horrocube, service: CardanoService, currentDatum: number, nextDatum: number, answerHash: string)
    {
      let redeemerObj = this.getRedeemer(currentDatum.toString(), answerHash);
      let originalDatumObj = this.getDatum(currentDatum.toString());
      let nextDatumObj = this.getDatum(nextDatum.toString());
  
      const datums = EmurgoSerialization.PlutusList.new();
      const outputs = EmurgoSerialization.TransactionOutputs.new();
      const metadata = { [DATUM_LABEL]: {}, [ADDRESS_LABEL]: {} };

      let txBuilder: EmurgoSerialization.TransactionBuilder = this.createTranscationBuilder();
  
      const walletAddress = EmurgoSerialization.BaseAddress.from_address(
        EmurgoSerialization.Address.from_bytes(this.fromHex((await service.getWalletInstance().cardano.getUsedAddresses())[0])));
  
      const utxos = (await service.getWalletInstance().cardano.getUtxos())
        .map((utxo) => EmurgoSerialization.TransactionUnspentOutput.from_bytes(this.fromHex(utxo)));
  
      if (currentDatum < MAX_PUZZLE_INDEX)
        datums.add(nextDatumObj);
  
      datums.add(originalDatumObj);
  
      let storyToken;
      let trophyToken;
  
      this.parseObjectProperties(horrocube.stories[0].eUtxoId.content.value, (k, prop) => {
  
        if (k.includes(STORY_NFT_PREFIX))
          storyToken = REWARDS_POLICY_ID + this.toHex(k);
  
        if (k.includes(TROPHY_NFT_PREFIX))
          trophyToken = REWARDS_POLICY_ID + this.toHex(k);
      })
  
      let originalBalance = BetaStoryOutputs.getOriginalBalance(currentDatum, storyToken, trophyToken);
      let newOutputBallance = BetaStoryOutputs.getNewBalance(currentDatum, storyToken, trophyToken);
  
      let claimCoin = BetaStoryOutputs.getClaimBalance(currentDatum,
        horrocube.policyId + this.fromAscii(horrocube.assetName),
        storyToken,
        trophyToken);
  
      if (currentDatum < MAX_PUZZLE_INDEX) {
        outputs.add(this.createOutput(EmurgoSerialization.Address.from_bech32(horrocube.stories[0].scriptAddress), newOutputBallance, nextDatumObj));
      }
  
      outputs.add(this.createOutput(walletAddress.to_address(), claimCoin, null));
      outputs.add(this.createOutput(walletAddress.to_address(), BetaStoryOutputs.getAdaOnlyBalance(), null));
  
      let utxoId = horrocube.stories[0].eUtxoId.id.split('#')[0];
      let utxoIndex = horrocube.stories[0].eUtxoId.id.split('#')[1];
      let scriptUtxo = EmurgoSerialization.TransactionUnspentOutput.new(
        EmurgoSerialization.TransactionInput.new(
          EmurgoSerialization.TransactionHash.from_bytes(this.fromHex(utxoId)),
          parseInt(utxoIndex)),
        EmurgoSerialization.TransactionOutput.new(
          this.getContractAddress(horrocube.stories[0].scriptAddress),
          originalBalance
        ));
  
      let plutusScript = this.getContract(horrocube.stories[0].plutusScript);
  
      const transactionWitnessSet = EmurgoSerialization.TransactionWitnessSet.new();
      const redeemers = EmurgoSerialization.Redeemers.new();
      let {
        input,
        change
      } = CoinSelection.randomImprove(utxos, outputs, 8, scriptUtxo ? [scriptUtxo] : []);
  
      input.forEach((utxo) => {
        txBuilder.add_input(
          utxo.output().address(),
          utxo.input(),
          utxo.output().amount()
        );
      });
  
      for (let i = 0; i < outputs.len(); i++) {
        txBuilder.add_output(outputs.get(i));
      }
      if (scriptUtxo) {
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
        txBuilder.set_redeemers(
          EmurgoSerialization.Redeemers.from_bytes(redeemers.to_bytes())
        );
  
        txBuilder.set_plutus_data(
          EmurgoSerialization.PlutusList.from_bytes(datums.to_bytes())
        );
        txBuilder.set_plutus_scripts(plutusScript);
        const collateral = (await service.getWalletInstance().cardano.getCollateral()).map((utxo) =>
          EmurgoSerialization.TransactionUnspentOutput.from_bytes(this.fromHex(utxo))
        );
        this.setCollateral(txBuilder, collateral);
  
        transactionWitnessSet.set_plutus_scripts(plutusScript);
        transactionWitnessSet.set_plutus_data(datums);
        transactionWitnessSet.set_redeemers(redeemers);
      }
  
      let aux_data;
      aux_data = EmurgoSerialization.AuxiliaryData.new();
      const generalMetadata = EmurgoSerialization.GeneralTransactionMetadata.new();
      aux_data.set_metadata(generalMetadata);
      txBuilder.set_auxiliary_data(aux_data);
      
      const changeMultiAssets = change.multiasset();
  
      // check if change value is too big for single output
      if (
        changeMultiAssets &&
        change.to_bytes().length * 2 > BlockchainParameters.getProtocolParameters().maxValSize
      ) {
        const partialChange = EmurgoSerialization.Value.new(
          EmurgoSerialization.BigNum.from_str("0")
        );
  
        const partialMultiAssets = EmurgoSerialization.MultiAsset.new();
        const policies = changeMultiAssets.keys();
        const makeSplit = () => {
          for (let j = 0; j < changeMultiAssets.len(); j++) {
            const policy = policies.get(j);
            const policyAssets = changeMultiAssets.get(policy);
            const assetNames = policyAssets.keys();
            const assets = EmurgoSerialization.Assets.new();
            for (let k = 0; k < assetNames.len(); k++) {
              const policyAsset = assetNames.get(k);
              const quantity = policyAssets.get(policyAsset);
              assets.insert(policyAsset, quantity);
              //check size
              const checkMultiAssets = EmurgoSerialization.MultiAsset.from_bytes(
                partialMultiAssets.to_bytes()
              );
              checkMultiAssets.insert(policy, assets);
              const checkValue = EmurgoSerialization.Value.new(
                EmurgoSerialization.BigNum.from_str("0")
              );
              checkValue.set_multiasset(checkMultiAssets);
              if (
                checkValue.to_bytes().length * 2 >=
                BlockchainParameters.getProtocolParameters().maxValSize
              ) {
                partialMultiAssets.insert(policy, assets);
                return;
              }
            }
            partialMultiAssets.insert(policy, assets);
          }
        };
        makeSplit();
        partialChange.set_multiasset(partialMultiAssets);
        const minAda = EmurgoSerialization.min_ada_required(
          partialChange,
          EmurgoSerialization.BigNum.from_str(BlockchainParameters.getProtocolParameters().minUtxo)
        );
        partialChange.set_coin(minAda);
  
        txBuilder.add_output(
          EmurgoSerialization.TransactionOutput.new(
            walletAddress.to_address(),
            partialChange
          )
        );
      }
  
      txBuilder.add_change_if_needed(walletAddress.to_address());
      const txBody = txBuilder.build();
      const tx = EmurgoSerialization.Transaction.new(
        txBody,
        EmurgoSerialization.TransactionWitnessSet.from_bytes(
          transactionWitnessSet.to_bytes()
        ),
        aux_data
      );
  
      const size = tx.to_bytes().length * 2;
  
      if (size > BlockchainParameters.getProtocolParameters().maxTxSize)
        throw new Error("MAX_SIZE_REACHED");
  
      let originalRedeemers = this.toHex(redeemers.to_bytes());
      let originalDatums = this.toHex(datums.to_bytes());
  
      let newDatums = originalDatums.replace(DatumMappings.getSerializationLibDatumData(currentDatum), DatumMappings.getCliDatumData(currentDatum)).replace(DatumMappings.getSerializationLibDatumData(nextDatum), DatumMappings.getCliDatumData(nextDatum));
      console.log(this.toHex(redeemers.to_bytes()));
      console.log(this.toHex(datums.to_bytes()));
      console.log(newDatums);
  
      let output = new Uint8Array(32)
      let dataX = this.fromHex(originalRedeemers + originalDatums + BlockchainParameters.getLanguageViews());
  
      let originalScriptDataHash = blake(output.length).update(dataX).digest('hex');
  
      let output2 = new Uint8Array(32)
      let dataX2 = this.fromHex(originalRedeemers + newDatums + BlockchainParameters.getLanguageViews());
  
      let newDataHash = blake(output2.length).update(dataX2).digest('hex');
  
      let fixedTx = this.toHex(tx.to_bytes()).replace(DatumMappings.getSerializationLibDatumHash(currentDatum), DatumMappings.getCliDatumHash(currentDatum));
      fixedTx = fixedTx.replace(DatumMappings.getSerializationLibDatumHash(nextDatum), DatumMappings.getCliDatumHash(nextDatum));
      fixedTx = fixedTx.replace(DatumMappings.getSerializationLibDatumData(currentDatum), DatumMappings.getCliDatumData(currentDatum));
      fixedTx = fixedTx.replace(DatumMappings.getSerializationLibDatumData(nextDatum), DatumMappings.getCliDatumData(nextDatum));
      fixedTx = fixedTx.replace(originalScriptDataHash, newDataHash);
  
      let txVkeyWitnesses = await service.getWalletInstance().cardano.signTx(
        fixedTx,
        true
      );
  
      txVkeyWitnesses = EmurgoSerialization.TransactionWitnessSet.from_bytes(
        this.fromHex(txVkeyWitnesses)
      );
  
      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
  
  
      const signedTx = EmurgoSerialization.Transaction.new(
        tx.body(),
        transactionWitnessSet,
        tx.auxiliary_data()
      );
  
      console.log("Full Tx Size", signedTx.to_bytes().length);
  
      let fixedSignedTx = this.toHex(signedTx.to_bytes()).replace(DatumMappings.getSerializationLibDatumHash(currentDatum), DatumMappings.getCliDatumHash(currentDatum));
      fixedSignedTx = fixedSignedTx.replace(DatumMappings.getSerializationLibDatumHash(nextDatum), DatumMappings.getCliDatumHash(nextDatum));
      fixedSignedTx = fixedSignedTx.replace(DatumMappings.getSerializationLibDatumData(currentDatum), DatumMappings.getCliDatumData(currentDatum));
      fixedSignedTx = fixedSignedTx.replace(DatumMappings.getSerializationLibDatumData(nextDatum), DatumMappings.getCliDatumData(nextDatum));
      fixedSignedTx = fixedSignedTx.replace(originalScriptDataHash, newDataHash);
  
      return fixedSignedTx;
    }
  
  
    async sendTransaction(service, tx: string) {
      const txHash = await service.getWalletInstance().cardano.submitTx(tx);
      return txHash;
    }
  
    createTranscationBuilder() {
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
     * @private
     */
    createOutput(address, value, datum) {
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
  
      if (datum) {
        output.set_data_hash(EmurgoSerialization.hash_plutus_data(datum));
      }
  
      return output;
    }
  
    /**
     * @private
     */
    setCollateral(txBuilder, utxos) {
      const inputs = EmurgoSerialization.TransactionInputs.new();
      utxos.forEach((utxo) => {
        inputs.add(utxo.input());
      });
      txBuilder.set_collateral(inputs);
    }
  
    hex2a(hexx) {
      var hex = hexx.toString(); //force conversion
      var str = '';
      for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str;
    }
  
    a2Hex(str) {
      var arr1 = [];
      for (var n = 0, l = str.length; n < l; n++) {
        var hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
      }
      return arr1.join('');
    }
  
    getContract(contract) {
  
      const scripts = EmurgoSerialization.PlutusScripts.new();
      scripts.add(EmurgoSerialization.PlutusScript.new(this.fromHex(contract.cborHex.slice(6))));
      return scripts;
    };
  
    getContractAddress(address) {
      return EmurgoSerialization.Address.from_bech32(address);
    }
  
    // Datums
    getDatum(level: string) {
      let fieldsInner = EmurgoSerialization.PlutusList.new();
  
      fieldsInner.add(EmurgoSerialization.PlutusData.new_integer(EmurgoSerialization.BigInt.from_str(level)));
  
      return EmurgoSerialization.PlutusData.new_constr_plutus_data(
        EmurgoSerialization.ConstrPlutusData.new(
          EmurgoSerialization.Int.new_i32(0),
          fieldsInner
        )
      );
    };
  
    getRedeemer(level: string, answer: string) {
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
  }