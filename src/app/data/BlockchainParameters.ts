/**
 * @file BlockchainParameters.ts
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

// EXPORTS ************************************************************************************************************/

/**
 * @summary Cardano blockchain parameters.
 */
 export class BlockchainParameters {
    /**
     * Gets the Cardano CDDL language views as a hex string.
     *
     * @returns The language views.
     */
    static getLanguageViews() {
      return 'a141005901d59f1a000302590001011a00060bc719026d00011a000249f01903e800011a000249f018201a0025cea81971f70419744d186419744d186419744d186419744d186419744d186419744d18641864186419744d18641a000249f018201a000249f018201a000249f018201a000249f01903e800011a000249f018201a000249f01903e800081a000242201a00067e2318760001011a000249f01903e800081a000249f01a0001b79818f7011a000249f0192710011a0002155e19052e011903e81a000249f01903e8011a000249f018201a000249f018201a000249f0182001011a000249f0011a000249f0041a000194af18f8011a000194af18f8011a0002377c190556011a0002bdea1901f1011a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000242201a00067e23187600010119f04c192bd200011a000249f018201a000242201a00067e2318760001011a000242201a00067e2318760001011a0025cea81971f704001a000141bb041a000249f019138800011a000249f018201a000302590001011a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a00330da70101ff';
    }

    /**
     * Cardano's current protocol parameters. May be better to query this from the backend.
     *
     * @returns The protocol parameters.
     */
    static getProtocolParameters() {
      return {
        linearFee: {
          minFeeA: '44',
          minFeeB: '155381'
        },
        minUtxo: '1000000',
        poolDeposit: '500000000',
        keyDeposit: '2000000',
        maxValSize: 5000,
        maxTxSize: 16384,
        priceMem: 5.77e-2,
        priceStep: 7.21e-5
      };
    }
  }
