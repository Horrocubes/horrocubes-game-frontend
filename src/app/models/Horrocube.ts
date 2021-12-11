import { Story } from './Story';

/**
 * @summary The batting model.
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
