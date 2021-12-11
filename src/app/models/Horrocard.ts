
/**
 * @summary The Horrocard model.
 */
 export class Horrocard
 {
     constructor(
         public assetName: string  = '',
         public name: string  = '',
         public description: string  = '',
         public imageLink: string  = '',
         public persistentImageLink: string  = '',
         public persistentBackLink: string  = '',
         public policyScriptLink: string  = '',
         public signatureLink: string  = '',
         public policyId: string  = '',
         public txId: string  = '',
         public mintingUtxo: string  = '',
         public newlyMinted: boolean = false)
     {
     }
 }
