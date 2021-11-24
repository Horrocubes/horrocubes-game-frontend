import { Level } from './Level';

/**
 * @summary The batting model.
 */
 export class Story
 {
     constructor(
         public name: string = "",
         public levels: Level[] = [],
         public image: string = "",
         public description: string = "")
     {
     }
 }