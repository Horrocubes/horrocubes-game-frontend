/**
 * @file Horrocard.ts
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

import { Story } from './Story';

/* EXPORTS *******************************************************************/

/**
 * @summary The Horrocubes model.
 */
export class Horrocube
 {
     constructor(
         public assetName: string  = '',
         public name: string  = '',
         public core: string  = '',
         public aspect: string  = '',
         public mechanism: string  = '',
         public commuter: string  = '',
         public supports: string  = '',
         public ornament: string  = '',
         public background: string  = '',
         public firstCard: string  = '',
         public secondCard: string  = '',
         public lastCard: string  = '',
         public imageLink: string  = '',
         public persistentImageLink: string  = '',
         public policyScriptLink: string  = '',
         public signatureLink: string  = '',
         public policyId: string  = '',
         public txId: string  = '',
         public mintingUtxo: string  = '',
         public newlyMinted: boolean = false,
         public stories: Story[] = [])
     {
     }
 }
