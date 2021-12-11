import { Level } from './Level';

/**
 * @summary
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
