/**
 * @summary The batting model.
 */
 export class Horrocube
 {
     constructor(
         public assetName:           String  = "",
         public name:                String  = "",
         public core:                String  = "",
         public aspect:              String  = "",
         public mechanism:           String  = "",
         public commuter:            String  = "",
         public supports:            String  = "",
         public ornament:            String  = "",
         public background:          String  = "",
         public firstCard:           String  = "",
         public secondCard:          String  = "",
         public lastCard:            String  = "",
         public imageLink:           String  = "",
         public persistentImageLink: String  = "",
         public policyScriptLink:    String  = "",
         public signatureLink:       String  = "",
         public policyId:            String  = "",
         public txId:                String  = "",
         public mintingUtxo:         String  = "",
         public newlyMinted:         boolean = false)
     {
     }
 }