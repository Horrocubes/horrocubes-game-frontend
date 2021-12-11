import {Value, Transaction, TransactionUnspentOutput, BaseAddress, RewardAddress, TransactionWitnessSet } from '../vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';

/**
 * @summary The Nami wallet Cardano object.
 */
export interface Cardano
 {
   /**
    * Will ask the user to give access to requested website. If access is given, this function will return true,
    * otherwise throws an error. If the user calls this function again with already having permission to the requested website,
    * it will simply return true.
    */
   enable(): Promise<boolean>;

   /**
    * Returns true if wallet has access to requested website, false otherwise.
    */
   isEnabled(): Promise<boolean>;

   /**
    * Gets the balance Value as a hex encoded cbor string.
    */
   getBalance(): Promise<string>;

   /**
    * Sings the given payload.
    *
    * The returned CoseSign1 object contains the payload, signature and the following protected headers:
    *
    * key_id => PublicKey,
    * address => BaseAddress | RewardAddress
    * algorithm_id => EdDSA(0) (the algorithm used for Cardano addresses).
    *
    * @param address If address is the BaseAddress the signature is returned with the Payment Credential, otherwise if the address
    * is the RewardAddress the signature is returned with the Stake Credential.
    *
    * @param payload Is a hex encoded utf8 string. CoseSign1 is a hex encoded bytes string.
    */
   signData(address, payload): Promise<any>;

   /**
    * Transaction is a hex encoded cbor string. TransactionWitnessSet is a hex encoded cbor string.
    *
    * @param tx the transaction to be signed.
    * @param partialSign is by default false and optional. The wallet needs to provide all required signatures. If it can't an error is thrown,
    * otherwise the TransactionWitnessSet is returned. If partialSign is true, the wallet doesn't need to provide all required signatures.
    *
    * @return The TransactionWitnessSet object.
    */
   signTx(payload: String, partialSign?: boolean): Promise<TransactionWitnessSet>;

   /**
    * Nami Wallet doesn't utilize the concept of multipe addresses per wallet. This function will return an array of length 1 and will always return
    * the same single address. Just to follow the standards of the proposed CIP, it will return the address in an array.
    */
   getUsedAddresses(): Promise<[BaseAddress]>;

   /**
    * This will always return an empty array []. Same reason as above, simply to follow the standards.
    */
   getUnusedAddresses(): Promise<[BaseAddress]>;

   /**
    * RewardAddress is a hex encoded bytes string.
    */
   getRewardAddress(): Promise<[RewardAddress]>;

   /**
    * Will return the same address as the one in getUsedAddresses().
    */
   getChangeAddress(): Promise<[BaseAddress]>;

   /**
    * Returns 0 if on testnet, otherwise 1 if on mainnet.
    */
   getNetworkId(): Promise<number>;

   /**
    * TransactionUnspentOutput is a hex encoded bytes string.
    *
    * amount and paginate are optional parameters. They are meant to filter the overall utxo set of a user's wallet.
    */
   getUtxos(amount?: Value, paginate?: {page: number, limit: number}): Promise<[TransactionUnspentOutput]>;

   /**
    * Gets the collateral.
    */
   getCollateral(): Promise<[TransactionUnspentOutput]>;

   /**
    * Returns the transaction hash, if transaction was submitted successfully, otherwise throws an error.
    */
   submitTx(payload: String): Promise<any>;

   /**
    * Note To follow the standards of multiple addresses the callback will return an array, although Nami Wallet will
    * just return an array with a single address, which is the same as the one in getUsedAddresses().
    */
   onAccountChange(): Promise<[RewardAddress]>;

   /**
    * @param callback Triggers the callback when a network change occurs.
    *
    * Callback:
    *   (network : number) => void
    */
   onNetworkChange(callback);
 }
