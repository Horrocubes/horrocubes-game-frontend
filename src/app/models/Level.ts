import { LevelFile } from './LevelFile';

/**
 * @summary The batting model.
 */
export class Level
 {
     constructor(
         public title: String = '',
         public content: String = '',
         public files: LevelFile[] = [],
         public answerHash: String = '',
         public isSolved: boolean = false,
         public isEncrypted: boolean = true,
         public isCurrent: boolean = true)
     {
     }
 }
