/**
 * @file BetaStoryOutputs.ts
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

// IMPORTS *************************************************************************************************************/

import * as EmurgoSerialization from '../vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
import { Buffer } from "buffer";
// CONSTANTS **********************************************************************************************************/

const COINS_POLICY_ID: string = "fc89b826eaf4745f78bce25297af9cb2eb44909acdf1e2bb71bed1a6";
const COINS_TOKEN_NAME: string = "Horrocoin";
const ADA_LOVELACE: string = "lovelace";
const MAX_PUZZLE_INDEX: number = 3;
const ADA_ONLY_OUTPUT: string = "5000000";
const CONTRACT_ADA_OUTPUT: string = "3000000";
const NFT_TRANSFER_ADA_OUTPUT: string = "3000000";
const CONTRACT_COIN_BALANCE: number = 4;

// EXPORTS ************************************************************************************************************/

/**
 * Contains all the outputs that must be generated in order to interact with the beta test smart contract.
 * 
 * The contract validates al balance transitions, failing to create the correct amount for the eUTXO will
 * result in failure.
 * 
 * TODO: This data must be variable dependeing on the story.
 */
export class BetaStoryOutputs
{
  /**
   * Gets balance that will be claimed from the contract at each stage.
   * 
   * @param datum The datum value of the new output.
   * @param cube The cube token. 
   * @param story The story token. 
   * @param trophy The trophy token.
   * 
   * @returns 
   */
  static getClaimBalance(datum: number, cube: string, story: string, trophy: string)
  {
    let claimCoin;
    if (datum < MAX_PUZZLE_INDEX) {
      claimCoin = this.assetsToValue([{
          unit: ADA_LOVELACE,
          quantity: NFT_TRANSFER_ADA_OUTPUT
        },
        {
          unit: COINS_POLICY_ID + this.fromAscii(COINS_TOKEN_NAME),
          quantity: "1",
        },
        {
          unit: cube,
          quantity: "1",
        }
      ])
    } else {
      claimCoin = this.assetsToValue([{
          unit: ADA_LOVELACE,
          quantity: NFT_TRANSFER_ADA_OUTPUT
        },
        {
          unit: COINS_POLICY_ID + this.fromAscii(COINS_TOKEN_NAME),
          quantity: "1",
        },
        {
          unit: cube,
          quantity: "1",
        },
        {
          unit: story,
          quantity: "1",
        },
        {
          unit: trophy,
          quantity: "1",
        }
      ])
    }

    return claimCoin;
  }

  /**
   * Gets the ncurrent balance of the output given its datum value.
   * 
   * @param datum The datum value of the new output.
   * @param story The story token. 
   * @param trophy The trophy token.
   * 
   * @returns The current value object of the contract.
   */
  static getOriginalBalance(datum: number, story, trophy)
  {
    let originalBalance = this.assetsToValue([{
        unit: ADA_LOVELACE,
        quantity: CONTRACT_ADA_OUTPUT
      },
      {
        unit: story,
        quantity: "1",
      },
      {
        unit: trophy,
        quantity: "1",
      },
      {
        unit: COINS_POLICY_ID + this.fromAscii(COINS_TOKEN_NAME),
        quantity: (CONTRACT_COIN_BALANCE - datum).toString(),
      },
    ])

    return originalBalance;
  }

  /**
   * Gets the new balance in the contract for the given datum value.
   * 
   * @param datum The datum value of the new output.
   * @param story The story token. 
   * @param trophy The trophy token.
   * 
   * @returns The new value object for the contract.
   */
  static getNewBalance(datum: number, story: string, trophy: string)
  {
    let originalBalance = this.assetsToValue([{
        unit: ADA_LOVELACE,
        quantity: CONTRACT_ADA_OUTPUT
      },
      {
        unit: story,
        quantity: "1",
      },
      {
        unit: trophy,
        quantity: "1",
      },
      {
        unit: COINS_POLICY_ID + this.fromAscii(COINS_TOKEN_NAME),
        quantity: (4 - (datum + 1)).toString(),
      },
    ])

    return originalBalance;
  }

  /**
   * Gets the ADA only output. We generate this output to make sure the wallets always have at least one output
   * with only ADA (other than the collateral).
   * 
   * @returns The value containing the ADA balance.
   */
  static getAdaOnlyBalance()
  {
    let originalBalance = this.assetsToValue([{
      unit: ADA_LOVELACE,
      quantity: ADA_ONLY_OUTPUT
    }, ])

    return originalBalance;
  }

  /**
   * Converts a javascript object to a EmurgoSerialization.Value.
   * 
   * @param assets The value encoded in a javascript object.
   * 
   * @returns The value.
   */
  static assetsToValue(assets)
  {
    const multiAsset = EmurgoSerialization.MultiAsset.new();
    const lovelace = assets.find((asset) => asset.unit === ADA_LOVELACE);
    const policies = [
      ...new Set(
        assets
        .filter((asset) => asset.unit !== ADA_LOVELACE)
        .map((asset) => asset.unit.slice(0, 56))
      ),
    ];
    policies.forEach((policy: string) => {
      const policyAssets = assets.filter(
        (asset) => asset.unit.slice(0, 56) === policy
      );
      const assetsValue = EmurgoSerialization.Assets.new();
      policyAssets.forEach((asset) => {
        assetsValue.insert(
          EmurgoSerialization.AssetName.new(Buffer.from(asset.unit.slice(56), "hex")),
          EmurgoSerialization.BigNum.from_str(asset.quantity)
        );
      });
      multiAsset.insert(
        EmurgoSerialization.ScriptHash.from_bytes(Buffer.from(policy, "hex")),
        assetsValue
      );
    });
    const value = EmurgoSerialization.Value.new(
      EmurgoSerialization.BigNum.from_str(lovelace ? lovelace.quantity : "0")
    );
    if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);

    return value;
  };

  // PRIVATE FUNCTIONS **************************************************************************************************/

  /**
   * Converts a hex string to a byte buffer.
   * 
   * @param hex The hex string.
   * 
   * @returns The byte buffer.
   */
  private static fromAscii(hex)
  {
    return Buffer.from(hex).toString("hex");
  }
}