/**
 * @file DatumMappings.ts
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
 * Datums mapping between the cardano CLI and the Emurgo serialization lib.
 * 
 * This wont be needed once we can upgrade the serialization lib.
 */
 export class DatumMappings
 {
     /**
      * Gets the datum hash for the current level (as per the CLI).
      * 
      * @param hash The datum hash.
      * 
      * @returns The current level as a number.
      */
    static getLevelFromDatum(hash)
    {
        const levels = new Map([
            ["b7afc0e9c25e4fa2933e0ed75b11024f44b271223ddeb5e919c9ed09489e29a1", 0],
            ["58b85f4b6b8f3d8e62f406ee77f09afc99a9e1b959389367969bcce3c485c6ad", 1],
            ["5ee16ffa589de2be0dfd2c4eb55ae6d22e6d96d5cccc5b3e63f9589638169cc8", 2],
            ["0103c27d58a7b32241bb7f03045fae8edc01dd2f2a70a349addc17f6536fde76", 3],
            ["8bb54ceaee2f57731094a2e96b8ad87bcc8988b1fa838e8c833eb3b72eae29a1", 4],
            ["a8d62f7d299c470f1c672c172444cea4f9736ed97c21e5b0dff77410f58689fd", 5],
            ["2789c54367d48b5d54644965eea5cbb849c00d691ae9263f36d34ed8fef8d9cf", 6],
            ["22cfa4b3f876b12f285721b99232586202eb2663d8ec30bc420882c11d58ebe6", 7],
            ["dd378f70303fc1869bb7eca1310ee32d131cc46e1b5a6c2e73fdd291dc8461ff", 8],
            ["80be0d8f11f2df126a00eba07026d43ceb1b83ed8a038a305e3b1af707f0bae7", 9],
            ["5de14ff6fe4968dc30b11882ed211372b3bcd605643335ff6aa636c597a55360", 10]
        ]);

        return levels.get(hash);
    }

    /**
     * Gets the datum hash of the datum calculated by the serialization lib for the given datum value.
     * 
     * @param level The level value.
     * 
     * @returns The datum hash as calculated by the serialization lib.
     */
    static getSerializationLibDatumHash(level)
    {
        const levels = new Map([
            [0, "ca7c7ee367eb3da9130fe742aad88ab2108c64a7f8bfadb94c64e6da5e333279"],
            [1, "c730e5e75dd3ca7086ba024b9633a01e191c3accfdea7302beeb94f39a9297af"],
            [2, "3374f272ab737750444ffafd7f682ff8de62c7bcc4312b594d56cd8f17314d59"],
            [3, "cc9528efd674ca906dc4cd725fb5bb4769aae4b860f167577fa822478298d807"],
            [4, "b8e9339edbbb60e472403502e00656b3adc037fa78339eca727a481a72be7dd5"],
            [5, "4e94cf6c9ab0e276b403aa942301c445d3a91243a4febd95e684518bd0ffe844"],
            [6, "d2726e53cb79d2ad065e970fd3ae951c028f2fd72d40ed091c0c7a172dd1ec5b"],
            [7, "411dc07e8e7207c15a5901e29896f03e5a1dcf010eea0180607cf1e88b787b34"],
            [8, "9b35408157d77b818b953d62245927a73a96b5299cc41795e51290c432f47bc1"],
            [9, "f0a6ceed57a85b7d94d995866323b4f26f84808f600b76fa82c9d6cf691d3905"],
            [10, "c5f7f54a41df0ba1612c41c2605b9a1d81d60a82725b0c870f0b7bad0527bec1"]
        ]);

        return levels.get(level);
    }

    /**
     * Gets the data of the datum calculated by the serialization lib for the given datum value.
     * 
     * @param level The level value.
     * 
     * @returns The datum as calculated by the serialization lib.
     */
    static getSerializationLibDatumData(level) {
        const levels = new Map([
            [0, "d866820081c24100"],
            [1, "d86682008101"],
            [2, "d86682008102"],
            [3, "d86682008103"],
            [4, "d86682008104"],
            [5, "d86682008105"],
            [6, "d86682008106"],
            [7, "d86682008107"],
            [8, "d86682008108"],
            [9, "d86682008109"],
            [10, "d8668200810a"]
        ]);

        return levels.get(level);
    }

    /**
     * Gets the data of the datum calculated by the Cardano CLI for the given datum value.
     * 
     * @param level The level value.
     * 
     * @returns The datum as calculated by the Cardano CLI.
     */
    static getCliDatumData(level)
    {
        const levels = new Map([
            [0, "d8799f00ff"],
            [1, "d8799f01ff"],
            [2, "d8799f02ff"],
            [3, "d8799f03ff"],
            [4, "d8799f04ff"],
            [5, "d8799f05ff"],
            [6, "d8799f06ff"],
            [7, "d8799f07ff"],
            [8, "d8799f08ff"],
            [9, "d8799f09ff"],
            [10, "d8799f0aff"]
        ]);

        return levels.get(level);
    }

    /**
     * Gets the datum hash of the datum calculated by the Cardano CLI for the given datum value.
     * 
     * @param level The level value.
     * 
     * @returns The datum hash as calculated by the Cardano CLI.
     */
    static getCliDatumHash(level) {
        const levels = new Map([
            [0, "b7afc0e9c25e4fa2933e0ed75b11024f44b271223ddeb5e919c9ed09489e29a1"],
            [1, "58b85f4b6b8f3d8e62f406ee77f09afc99a9e1b959389367969bcce3c485c6ad"],
            [2, "5ee16ffa589de2be0dfd2c4eb55ae6d22e6d96d5cccc5b3e63f9589638169cc8"],
            [3, "0103c27d58a7b32241bb7f03045fae8edc01dd2f2a70a349addc17f6536fde76"],
            [4, "8bb54ceaee2f57731094a2e96b8ad87bcc8988b1fa838e8c833eb3b72eae29a1"],
            [5, "a8d62f7d299c470f1c672c172444cea4f9736ed97c21e5b0dff77410f58689fd"],
            [6, "2789c54367d48b5d54644965eea5cbb849c00d691ae9263f36d34ed8fef8d9cf"],
            [7, "22cfa4b3f876b12f285721b99232586202eb2663d8ec30bc420882c11d58ebe6"],
            [8, "dd378f70303fc1869bb7eca1310ee32d131cc46e1b5a6c2e73fdd291dc8461ff"],
            [9, "80be0d8f11f2df126a00eba07026d43ceb1b83ed8a038a305e3b1af707f0bae7"],
            [10, "5de14ff6fe4968dc30b11882ed211372b3bcd605643335ff6aa636c597a55360"]
        ]);

        return levels.get(level);
    }


    /**
     * Gets the datum value as JSON.
     * 
     * @param level The level value.
     * 
     * @returns The datum as JSON.
     */
    static getDatumFromLevel(index)
    {
        const datums = new Map([
            [0, {
                constructor: 0,
                fields: [{
                    int: 0
                }]
            }],
            [1, {
                constructor: 0,
                fields: [{
                    int: 1
                }]
            }],
            [2, {
                constructor: 0,
                fields: [{
                    int: 2
                }]
            }],
            [3, {
                constructor: 0,
                fields: [{
                    int: 3
                }]
            }],
            [4, {
                constructor: 0,
                fields: [{
                    int: 4
                }]
            }],
            [5, {
                constructor: 0,
                fields: [{
                    int: 5
                }]
            }],
            [6, {
                constructor: 0,
                fields: [{
                    int: 6
                }]
            }],
            [7, {
                constructor: 0,
                fields: [{
                    int: 7
                }]
            }],
            [8, {
                constructor: 0,
                fields: [{
                    int: 8
                }]
            }],
            [9, {
                constructor: 0,
                fields: [{
                    int: 9
                }]
            }],
            [10, {
                constructor: 0,
                fields: [{
                    int: 10
                }]
            }]
        ]);

        return datums.get(index);
    }
}