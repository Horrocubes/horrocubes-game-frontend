/**
 * @summary The Horrocard model.
 */
 export class Horrocard
 {
     constructor(
         public assetName:           String  = "",
         public name:                String  = "",
         public description:         String  = "",
         public imageLink:           String  = "",
         public persistentImageLink: String  = "",
         public persistentBackLink:  String  = "",
         public policyScriptLink:    String  = "",
         public signatureLink:       String  = "",
         public policyId:            String  = "",
         public txId:                String  = "",
         public mintingUtxo:         String  = "",
         public newlyMinted:         boolean = false)
     {
     }
 }