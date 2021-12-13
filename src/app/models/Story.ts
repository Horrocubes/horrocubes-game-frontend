/**
 * @file Story.ts
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

/* IMPROTS *******************************************************************/

import { Level } from './Level';

/* EXPORTS *******************************************************************/

/**
 * The story model.
 */
export class Story
 {
     constructor(
         public name: string = '',
         public levels: Level[] = [],
         public image: string = '',
         public description: string = '',
         public assetId: string = '',
         public scriptAddress: string = '',
         public eUtxoId: any = {},
         public currentLevel: number = 0,
         public plutusScript: any = {})
     {
     }
 }
