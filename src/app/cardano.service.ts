/* IMPORTS *******************************************************************/

import { Injectable }                                 from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError }                     from 'rxjs';
import { catchError, concatMap, mergeMap, map }       from 'rxjs/internal/operators';
import { environment }                                from '../environments/environment';
import { Session }                                    from './models/Session';
import { Horrocube }                                  from './models/Horrocube';
import { Horrocard }                                  from './models/Horrocard';
import { CardanoRef }                                 from './models/CardanoRef';
import * as internal from 'events';
import * as EmurgoSerialization from './vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
import { Value } from                './vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
import { Subject, defer } from 'rxjs';
import { switchMap, filter, tap } from 'rxjs/operators';
import { Buffer } from "buffer";

// EXPORTS ************************************************************************************************************/

@Injectable({
  providedIn: 'root'
})
export class CardanoService
{
  public cubes: Horrocube[] = [];  
  public _isConnected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _interval;
  _isWalletEnabled = false;
  constructor(private _cardanoRef: CardanoRef, private _http: HttpClient)
  {
  }

  getConnectionState()
  {
    return this._isConnected$;
  }

  requestWalletAccess()
  {
    this.startTimer();
    defer(() => this._cardanoRef.cardano.enable()).pipe(tap((isWalletEnabled)=> 
    {
      this._isWalletEnabled = isWalletEnabled;
      this._isConnected$.next(isWalletEnabled);
    })).subscribe();
  }

  isWalletConnected()
  {
    return defer(() => this._cardanoRef.cardano.isEnabled()).pipe(tap((isWalletEnabled)=> 
    {
      this._isWalletEnabled = isWalletEnabled;
      this._isConnected$.next(isWalletEnabled);
    }));
  }

  isWalletInjected()
  {
    return this._cardanoRef.cardano !== undefined;
  }

  getAdaBalance()
  {
  }

  getHorrocubes() : Observable<any>
  {
    const walletObservable$ = defer(() => this._cardanoRef.cardano.getBalance());

    return walletObservable$.pipe(map((result) =>
    {
      let val:Value = Value.from_bytes(Buffer.from(result, "hex"));

      let assets = this.valueToAssets(val);

      assets = assets.filter((x) => x.unit !== 'lovelace' && this.isValidCube(x.policyId));

      return assets;
    }))
    .pipe(concatMap(x => x))
    .pipe(mergeMap(x => this.getAssetDetail(x.unit)))
    .pipe(map(x => this.createHorrocube(x)));
  }

  getHorrocards()
  {
    const walletObservable$ = defer(() => this._cardanoRef.cardano.getBalance());

    return walletObservable$.pipe(map((result) =>
    {
      let val:Value = Value.from_bytes(Buffer.from(result, "hex"));

      let assets = this.valueToAssets(val);

      assets = assets.filter((x) => x.unit !== 'lovelace' && this.isValidCard(x.policyId));

      return assets;
    }))
    .pipe(concatMap(x => x))
    .pipe(mergeMap(x => this.getAssetDetail(x.unit)))
    .pipe(map(x => this.createHorrocard(x)));
  }

  getAssetDetail(asset_id): Observable<any>
    {
      var HOST = 'https://cardano-testnet.blockfrost.io/api/v0/assets/';

      // Step 1
    const httpHeaders: HttpHeaders = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'project_id': 'testnetozfiHqTtDYvfiwgG4PQmRyt5E3tBJVDs'
    });

      return this._http.get(HOST + asset_id, { headers: httpHeaders });
  };

 valueToAssets(value: Value)
 {
       const assets = [];
       assets.push({ unit: "lovelace", quantity: value.coin().to_str() });
       if (value.multiasset()) {
         const multiAssets = value.multiasset().keys();
         for (let j = 0; j < multiAssets.len(); j++) {
           const policy = multiAssets.get(j);
           const policyAssets = value.multiasset().get(policy);
           const assetNames = policyAssets.keys();
           for (let k = 0; k < assetNames.len(); k++) {
             const policyAsset = assetNames.get(k);
             const quantity = policyAssets.get(policyAsset);
             const asset =
             assets.push({
               policyId: Buffer.from(policy.to_bytes()).toString("hex"),
               tokenName: Buffer.from(policyAsset.name()).toString(),
               unit:Buffer.from(policy.to_bytes()).toString("hex") + Buffer.from(policyAsset.name()).toString("hex"),
               quantity: quantity.to_str(),
             });
           }
         }
       }
       return assets;
     };

  toHexString(byteArray) {
    return Array.from(byteArray, (byte: any)=> {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

  createHorrocube(asset)
  {
    let cube: Horrocube = new Horrocube(
      this.hex2a(asset.asset_name),
      asset.onchain_metadata.name,
      asset.onchain_metadata.properties.core,
      asset.onchain_metadata.properties.aspect,
      asset.onchain_metadata.properties.mechanism,
      asset.onchain_metadata.properties.commuter,
      asset.onchain_metadata.properties.supports,
      asset.onchain_metadata.properties.ornament,
      asset.onchain_metadata.properties.background,
      asset.onchain_metadata.cards[0].name,
      asset.onchain_metadata.cards[1].name,
      asset.onchain_metadata.cards[2].name,
      this.getCachedUrl(asset.onchain_metadata.image),
      asset.onchain_metadata.image,
      "",
      "",
      asset.policy_id,
      "",
      "");

    return cube;
  }

  createHorrocard(asset)
  {
    let card: Horrocard = new Horrocard(
      this.hex2a(asset.asset_name),
      asset.onchain_metadata.name,
      asset.onchain_metadata.description,
      this.getCachedUrl(asset.onchain_metadata.image),
      asset.onchain_metadata.image,
      "",
      "",
      "",
      asset.policy_id,
      "",
      "");

    return card;
  }


  hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  getCachedUrl(url: string)
  {
    return "https://storage.googleapis.com/horrocubes_small_ipfs/" + url.replace("ipfs://", "") + ".png";
  }

  startTimer()
  {
    this._interval = setInterval(() => {
      this._cardanoRef.cardano.isEnabled().then(isWalletEnabled => 
        {
          console.log(isWalletEnabled);
          if (isWalletEnabled !== this._isWalletEnabled)
          {
            this._isWalletEnabled = isWalletEnabled;
            this._isConnected$.next(isWalletEnabled);
          }
        });
    },5000)
  }

  isValidCard(policyId: string)
  {
    let cardIds = [
      "d3d980c53b67d66a2d8172dc3bee40a5bc38d02e2bc109f54246bb50",
      "c8602bd3eb8665bfa62cc5d7173e97adc66a9daf899a254c7fb85672",
      "a16ecbbd3aff13246693b0e21f406d3b29c3051c3ec8ea082b592058",
      "1220989fc667af6c50fec9bff4c62879a8ac6a8a1f2ddfdfd21f7088",
      "d7882361b44515de6b42795a054424d9e002a7877c40169e6a07dcd5",
      "deeedde96f1dd93462f9fa44330a30ba5be776ab5559813d6ac707d6",
      "ad207061b4cb9adfc5f297c34d2dfe76e5fb40b12eacfab740c3afe2",
      "a20ac182a5dd40165589065bd6f44fb09018429aa2c533b0c0ce3c71",
      "88556c36e74e1f55a8f039d3a16b25b651549cd16d106c6422811287",
      "2d0d43391149e97addf05ac54f7df131aef478ef15af6cd337540a83",
      "640851407b51c6a6d76b996fce41f1c3f2cb9297be88c4d5ccdc507b",
      "b79b3475958382d4c27e12fa596df2ae91e9d396034f41d3c3b74950",
      "6131dc3cbc4439990c6bb58a98d7ab708cc92e1cd9bb0634989b97a9",
      "8fb6b47725b43c658b8bacd993034ef502452f396be01ecb17570127",
      "f72d76357fdba610dd8488eb8e1053f7df6cdb2d5911b36b4ce1d11f",
      "6bcdbd7f5c431cfea8c96da84a0594d83673e1099cfd9c245d5dfb76",
      "c132c642d1c23aff3cc7765417339857374c4299ab9eb1d74464b43a",
      "0c8248f2b18fd947f7d48215db9deb5f9f681c5a351d9617d1e52599",
      "b62c9a4149ba429763f11d9fc022bbbbfb1768ee237684c8da5c17ed",
      "464f7f988389aeb6ab521aa0faf54e989e1127a96ed3f3252d301ede",
      "0f31c11abc08ff0a0fbb9f5d6cccf55adf32f53d500ae26431d33040",
      "9062ddab9b360011c72fe2f090526d25bbef8650f8b8a7f62dd9b533",
      "bd9a134410b23c6a48d094954855e5c09a31488bbf1c8c0d928071d8",
      "4caa545c58c77f771ba72ce22570e8db7a4beab27270e5ee24dc7e96",
      "69b8506d2246e43b0e0a3674fd4bbd31956129c5ac954d54a780fde5",
      "2e893457af93e6b8a5b726740f8ee3bc01832bc8fd8d4b2aaf650e9f",
      "338ac816b176fca705d34a980ed6ee7f3de65f8a698434edfee66349",
      "909e33633b23bfa40e2fcc7bf188ff7bad230e96f9316a994fb3dda0",
      "f68597bafca90faf6df0b64e6333255a5b04e224ab2773c841f8ee93",
      "769c5aa37b390155ce5d826354f31ff896ec853ca0002ce837e668b5",
      "dabf2789611ab41f8f2681b070bf583961bf32cd7f3e531462067dc5",
      "0a937dbcc1d434eeeff58ad3971939a82c8f8ee412ad5a9b612b1e12",
      "bee6f32b15d7b71375137b0e198391c46ddcc09ebf14be4ab944ff76",
      "8fb31d84d50caee9cb6df607d17bf5ef7403717883633a2372a9994a",
      "5a50aa3731a6bc03bf4ceadccadc6ef29c5ac0ee57048ac0328a55ec",
      "9e4f9d921e5aae3bf9211bbffcfd6727845127f8b7304f19ee6109a4",
      "cf3d0ca05501e95f6849b41bd01ca502b3d1dd988d9c41a0bf070c79",
      "1b433d19e8cbd2f4ae1395fc20379d3f7e8ec768b9ae8d53c4e5f977",
      "52ceb9eb59f402eab23bfa29281816b18b44df572fb3b7ece5418eea",
      "1c1378e126eae8f005786a34f32c2f83d0e1122352d18e103691c1ef",
      // Testnet
      "c80b6a4ecfcc6632ab03c4ca4afe94a8613c4972db3aa9afcd155cc1"];

      return cardIds.includes(policyId);
  }

  isValidCube(policyId: string)
  {
    let cubeIds = [
      "160b85e53e25ef49272c421f04b702bc32184d102865fd1dc8815cde",
      "7dab1c3d035cc25c561af5aad81b771b4e1a4e216e56a00f30a6b236",
      "cabd2a8746c2ce630f6b07d74299357039b93ef64f86768492fdf90a",
      "63b7eed7f10efffe30541e46335d33373ce66be3fd4fcef299705ff2",
      "acf681bc8e6d903352306e164058ca878f2a3eef32caf36b1c44b458",
      "d71f40bebcdd43aaa3bcedad938cf4565ae8d65ad3d6281327d76353",
      "34de3632417bce6e45485e9b98f051b9bf5514ac55d7dd67efdea8b0",
      "87fc8f0c7f4c6680ea5b08018043eed94939f0714d6c43e56e947ab2",
      "becfcc661b49bd7899109b280065ebb391bbb21d82717c7635d0b66c",
      "bfe296543e5ac21931a1cd79e19fc18353204ad2336bb8a5da938df8",
      "50ab682fea8902ea75bc40fecc5ddfbbf6b8ae77518b74e97621f1ac",
      "68bb7f5cfbf43b332a3743a793875c0d6508ddd4df9d27eb6dc9bb64",
      "c916b3d14a51087cc967223aad3f2e4e5c01993f5429719c32c2061e",
      "c1996b36d11bf42103745844cc5ee9bf13fde475fa909809e2da7261",
      "2161af28e544066081a36a85857f8894910984ea50f5a7a1d7a345e2",
      "e560f9553bd140e11e5d6736de038ef56d4ca77a5ae8b8cb1aa2be3a",
      "35b05f66750095dcbd5869227a1e266c9fdb474d326f38253148c741",
      "26f4b6c2deb8a351d90e8b49a64c36e4a959bda8192e8140e26e882f",
      "f5daf595a9e8134466b78169e692636f9ac1d52ad74b609c766fb4c7",
      "0b672b49539eeaa0b5b62f8822f6dd6db716633198c702342e927b92",
      "399a2e29a8f0200ef9efce967ba085c685bb3901b7841302a9a10926",
      "d65346b77fe4ca82d6774d30b3c8d19e5dfd0f7b09e9846470ee4c73",
      "353a0340cdc84e7e95ba45ba3b88b0614befedd399a826e9aa835393",
      "7c4bc699e0d311aa25b5a7ccc1a89a27b0745a98858ac047e4119015",
      "cc301594af06629e00fa12ee5eeb7eb4d266e33a0430da98c3ee174e",
      "39b91084a6004597cfe41c9872d5c083ad2fb07a931196c9321a5f24",
      "5d12cc3d302c78a677d1827a3d8c389b0feee730f1bb9fb7414a0e73",
      "921db7e9df6e2cc7b1cba0e6ec6cc3042db3ea5f6adce7f8ee70e076",
      "2bd6a500521f9ee4b552e6c6d2ae532fec4ca725b619e9591f2484bc",
      "b30e20f989246f377513aae4b97aa6546725cd3c885a7aa591c30a0e",
      "6e5add9728a52105c1052057a9bb5f145fc0458d0753226acb75dc24",
      "bfe13329137f0b3132ff96d184eb815dddcb1479678007760610324c",
      "22858959d5cad733ffc9269ac201a4765a8720aeacc8a936f2dcbc5f",
      "d9a587524d78e37ab52c28bbcccf1c3ad474093efecc9ba0127eaaf6",
      "edfcee93d3bff4a9a906713c0c1d8908f2ae1b599b1f4f6f0f98c163",
      "c589375ea51230c4228f22c130a2f3f7a598339f04b084030f0d9a20",
      "9b0842a8ef14842c2d157cebb2b69bdfb53ce50a09c4ac7e35fa0ee6",
      "818f81e57c8c778650a2189fb7173679e4ee9a9f57444cab87e4f1da",
      "9b40811430bf6ec864328289550c03c9ab203ba98a02f50aa931cb8e",
      "78fb2987cbbe9ca98c2293c27755e9333cf9bab1b0535a41b402c41a",
      "727b87562a62181302e1ddd1ebc7eda94157f426183b53dc42c3b85f",
      "30d82d10ea659092a86b30235e7e98bbf30ac9446b230d4c37deae98",
      "7d93cf0e689bf831350725f4611f40ead7649ca42553f7f80919691b",
      "e9db68eac03b34e49c7cc13a6c3f8beb965be0cdefdb2a2f2e39cbe7",
      "7a11a52eea6badcb9e8a627294010054377e7f012fdb232af93776cb",
      "ad525d02b04409c6431057c3d902a20de5ce1816c571b476db1b7714",
      "2ef91add0a7c39f4d9414fcbbe7a5266d4ccf4b082ec967834673973",
      "164c70215781040e5994b672400ba8efce6a9572834401c424667f42",
      "dd3502ca993e2d1b03d3375f75a8faa2d24f4caa3d70bd69f4edb48d",
      "804db5ebe4e2e263d9d8e004645289610d62c03de8c7d3f00b5a71c3",
      "679942d4efa7eeabfb9eb6ed0a5dd0d68e415c3a19877d6b29e399f8",
      "e0f42e5a33d2b97e044c124337d5f3503fb49185aef10ee52c2e0462",
      "30f10e47ec8144673688c1eba8d537e77d61fb865e20a7b149c511e3",
      "e290e51c8a62d6a3577bd47e7b84a0045275069f1f3f97488f1ee4d0",
      "e0ec454aeb947383e68bdeb9fff912f31ab224a00fa2a47954f5e27a",
      "9e98f2432cb2a27cbb6909cb770203fd8f9e75308cb9e4dbf6ca5525",
      "23ae02519e79b0256f53fcaa5a78a5624568b1b678f17501e86c2e87",
      "e7cfa2938ea99e3ca383c6fb61a0064dad00eeb8949ff0be2a8d155a",
      "8dff004ae347aa6dea140cd8d2554a9f6e989e18a390b81deeaed56c",
      "1d43926625e3fb2da1bc431b33d47ca38e43ae5cec25b27bfb88cae4",
      "83590de42a05bc22d5f26518358d23c4a24b78f62693a3be363d2298",
      "2c46133d4936c1dcb038f8b4673199ae748916e8403d8f2368c0d224",
      "c48b6d3061573b8c5f85e0f4b67d5dff63ae8ef52d534a674efa37fd",
      "18926f6ffc0e7afaea4d8c670951ecef1ae92a70afe0f684af227486",
      "0cf881636303f5b5bd25fe9f10137789a8d3ff92bdc643e2cf7b8b36",
      "855bea6674eed9c0c2bb912fcf67f91f756140744075d4caafc49f5e",
      "5e665bcfc1f2d2d1b95b496ddc805d2351af444514d871bd9fff9d83",
      "745fcb6fa55d64c1899f63eb4d9e2b2e249d0302a16276a9d6fa397d",
      "ac070453bfd9c5f3f8be9acb16377fa1e400e5bd1ddc12611313533b",
      "77220f27c2f02b47cf3123bb85b19c65fe7bbe249041e929c433aeef",
      "878d0651fe0f5669d6a991d1c0891edf4bc83173b371c715229eee2f",
      "cbdfbe75975daa5825a7a326873cfa69c12ea11d30704ff9a432d5a7",
      "ef4f61c01c14e4f2ee333df232eb457271d7758ef019210258e37669",
      "4a5a3656c1eb332876c83f522dd14c304db181c7c5ac861ecd553f7b",
      "d31073682dbc9aa49e32930d359a756cdffd2a7375243ab34ddd4dde",
      "c65e2384c9472e049142f42f31336d9b54f04328a35acbd523e41aac",
      "086b0233bce3cedcb3582eff89731fbd953a5e3f8d5d28dccf145eee",
      "1bbab80fd9e1c1757c077d572d27703d52d814ede78b50b91f3968f7",
      "9eb23e21e6716de14ae6edffe23b699cebd5b046f40b21454ddf1874",
      "df901267f9a50c85fd00cf5b5a64f9437b923a328f63bc4cba3aca9c",
      "a0a9842e15cb65b4604f7af15f9cfd6bc26ea2de4774c3be5bc41493",
      "fd10dfe0476e78415efd362db73d5d9a901dfb67b13efcc0b0fac1c7",
      "386537eeb2ef91ded93367d9c5057d2f44959c19d507b48179b72c33",
      "9db2ba9356fece0ac8912e6a1454507353d8930dabff2eab8ce11745",
      "f3a64ad1774428c07833bf95876deaa1d47f9ac34d6270e1a40b1ee9",
      "c9c9f239342d2a1b66f21d062e739fe42a284dfe57f2efa2f61e013d",
      "59745c5558060de6761868d6b4abdcc132faffdf83c70cc39e74d370",
      "63f8a1a0a74437844ee3bf6d5c1fcb8477e02f6c06c127698009614c",
      "249108eb0f5991983742d8a51b9b0f54198f6e0f0ba668d28e3036b9",
      "08d19d2f1a4d69c634877257c1fc58e647c71f239f670671b0694658",
      "9a5cdbcc8d11c8b8a46ddad6329de088e6369c1b5843a548e03593bc",
      "d2561f3a69a85c615ee2b801f387867de05b82eb186321eeb773a2d5",
      "89a6027eaa3c73ff790b80584f016dfd176061157011a48f615de89a",
      "cd914ca4ec6af0c2b9e768367a717117cad8c09a3b3614724e292983",
      "aac960fff6ece1054a6ce8da5762b7428017ee57f76fc2cd6f173fc1",
      "b981d9692d096bf99d824bf1ab2b94d6640a25a62b8876d6ea299a66",
      "54fb5553e026b03e5ec58b4bc58f4e77e2b53cdfbd7fd50dc6502c48",
      "7603e6c3296008255e673abe3de9a621890d3ded73cbe0ab45382890",
      "b4bcbd81b32ae8bfc766575388c3c01aba839116ca86942f48ed5c0d",
      "dcafac1c0eaec56f0b6073eee77e1ec33fee3dad5c32b6877da30974",
      "3b29d9d04f2244606f0ab83986da9d854ab17f34024c56f12d4ca310",
      "9b184033947bce51a3fce8eba6bde5ef4ca5fcab361dfc85a293ff08",
      "5623637b5cb37ae368fcb7708a0d74e8476dba86bb641a717c291a1a",
      "fef5348da68a403b785eb0153fdaec60c4e1349bb780ceca30cafcf1",
      "8d9181aa71feb07c640a573e9cd9c3e9714be4aa4bb26603755ff48c",
      "d3fa77d7d054d0cd052f7cbe5688db59bd59c9a194df5dfda26aaf12",
      "1b950c09b4f389b22bbe82bfb66d9baa7b8d1a6b3b87361c418485a9",
      "0792f5cef09140107b91f474b68f3d8689d7eb065c8ff2bf4e7e7296",
      "3740b702faf006562f2585845c1797aac959e380116fbdab4dc6f59c",
      "b7904b0123ca101934eae0ca38eb5b0ca390ec3b82fc4f5a38369b25",
      "0bfd7ee1a5ce7a0c96407c36113b9c599b5ceb275d33c0727e39969d",
      "c4ec214faca2251df9c2c4e98dc314ddac7ba9c5c4416d11e68fbf5e",
      "0890a33124f193a9833215496ebe3a495f34909314da7b300aa7df1d",
      "1e24e56d0ac340b69fa3d05c50f7b491d4ff671fbbcff37935329ace",
      "2e02ab6cef8a3d79e4a680bc2dbd0f85b69825886e234bfb0517b12f",
      "76ba1a48a32417a7271ef5454c8087ddc45a9899a793bea003a2791d",
      "d18382c215643d18058f805c02bdb55c4f847805c3e649fde2026081",
      "0c240eb92e64a7734482550b834ea4cc5d0aba793fd8eff384bfc615",
      "29e53a451c1a484815be4cadd9263a0f1db65a96aeb5cfd151172c40",
      "5d1728d53989494960f1348373a4f78417c5dc70d839aa4d9f9038d2",
      "6eb3fb3fea3bafc1b983ac41c49314eef9acca5a5ab7b11eea043e07",
      "2d7a72ac27603cf1b3323f0b6f34e6fb78ee7027eaaff07f5281a8d7",
      "6545ab3e6128bb4de1db6f8f99b55e28ddc97886e196e13f3c213e9c",
      "91af71f5059ea5649ccf9acf45eaaa76d9ba599f81dbfcb71e5ecedc",
      "d69b7f256b9fc8947d68084c1840f01a90ea8c109194a7720ba810c6",
      "a625653a3f60b2d2792c3c64dcdb30debf87254f4a8aea9d4156075f",
      "80d58280b8a0b0498a757f14ba11dc5a9c622ce4505b88edc74d5173",
      "7efc180e630a170fb1a5373b8920702b8e86c0191d14aa983dc9b0aa",
      "b60cf8ac88686fab42edf283fcf2780d217d0bed7f9cb45956546327",
      "ee956443bd2ad0802a64ed62f222109bde419ba1dd4b6fee808d6d72",
      "fd493e4af6fbb2a10687ec515972063e4af3be64705e71b8ae8348cf",
      "35650eb46af30965ae44c23f61ab06153d7f776542cddb4ac46f92d8",
      "19663818bf2364e1b8a90e2e1c559499fa41badd5cdcf8b307a77d31",
      "d805a89a4c8f3d28c4296c51eb46f089f3add1936c9012552803000a",
      "fe3cf57ebef4804456e80fcd61b0ab89b1ac6fd0344954cafefebdb0",
      "f236f60f8085f6ac9770eca26391a14c9b2a8d566698893838842c0a",
      "58f37d34bedd2e00ffad1196a0b51fedf8acffe1ae9c25d6b75e3ceb",
      "665621f8ffcaccd8ee98bfd79c5c23ca40fdf41b47927620126f3cc0",
      "f47b86e5b3dc2e76db6d63b495887f5a4cf0aa52b5561e649351fbf0",
      "1b03ee0ce555a76228d6dcf3fc736eea6718768e57c89c211d1d55a4",
      "634b1b32dc095bda959cf1f38bffb9565a6d4fd58d272b19130a3cd2",
      "96384d16679c37920b3e6b005132c782c46561876ab9edede835ed74",
      "db45799ce58c7f8703a4105a9a797ba91ad6fada3cacd473238accc5",
      "1fec978b14d86b990bf9452259730e6628cbd168a031fdd260472903",
      "e05c581d8640e34212871cac8e5cb9d9f9da62cace89b4ab9af904ee",
      "287367a597fe668f88c680a553320dfaff4b86245afda3226bb32991",
      "199dfa6bebf5361946dd271f7ce395f90f64dfba61dbd32a6d91bed4",
      "e9eebb11ea8bf9d606053b051fb8f77c8740c1ea94134f5460f81018",
      "6e4c6a06fbd9edc3c6f6194103aea50caaab5b9b4881056f16d13aa7",
      "68e1f1cba5873a8c80c7e196a2186003690d26d56e9ec63a9b3fd27a",
      "a8b6608190dc34040f3707668556d7ffb763d7436e9abf8283349f72",
      "faf0f55e49f1183f917f44a0fed3b5e87fa8ab89918382972b236f78",
      "79aee4f5e6ec26ecd65cb12e04908499722870c827b2c2e46bb4c6f9",
      "b1e01b41587aefef4d7ebc1fb3dc549e3f0bd873855754d184138d2d",
      "79544efe558ffe290c6ad86205660c16e9b9c24245bbe7819416764c",
      "e49717318d1218ebc1002f453072ed11f8e5b155647bc3ed1df85ac4",
      "1a6bf6a677fda02cbc3a6f420ed4c0ed3398022f5a100a588671a3b2",
      "8331458667700509ed9dc696272ad0f9af3724a6a4b86e1c17623d3b",
      "e27236d9fd3abe1daa9cf021ad9a920246e035c6610bb750357ced43",
      "52d2b53277bedc785e934be77785fa2cd29c07624cd882bdc817f69d",
      "d33b2d598751829d415e83d25bffcc90d2ce92a4be28e666a9e82cb2",
      "31cae8718e17e45b4dd54a2ca5bc90271f26c78d3cf1a12d31a64c10",
      "b2864cc2531a9ea81749fb2de0b933eb1ed70d23c41cb06f66c62c63",
      "010e9bf4c6f1b488610bd759277f0c214a15c6590acbc00903ce198d",
      "589714359a6f6afd2589afcdcbd0635ed6c58ac902b5a580d0c75465",
      "393727dbc83c6f9985f8a5d96ec11f91d20307b134a5b3445ba43bf5",
      "d929e8a6d38aa0e3fe7bdad42eafe2c20a747b0185d187c587fb7310",
      "65d079f5cd98c9f1ded322d0732950ea4d4c66a9161de6950f0e1713",
      "9fabad6d47980724d22909d0759ac17615dc75656ecf02203fe89dcd",
      "d367b96509996ab41aac2206e0e02e5a724064ef2eac5f93c456d7fc",
      "93c30f2041c4704767d0a8535661e457ec3f9af8f0ff5f4da9d52b7a",
      "9408ac37d623f80b4a539b5576e4484861fbf33fe42bcdd7e24c8690",
      "c8a2efc9129ab0131ba38f53eef12afac51b0f6847880c173927dc2b",
      "c7fdb88f2b7ff3c8be44d11afed0fc8be775370eb7f85bc95c0fa33a",
      "283cd6a035687995d0532a46df1290596662c25b76881fc7d7e5e5e2",
      "d4ab7ba21ba1e2d7be86e31d1b99247ebc45eace09c94509d14a74f0",
      "9ada5292c4d99884d73ac7d6d37b4f7eab28e4da24fdd70166050246",
      "b3ccc2d1c9e5390c1d2d365c8abaff5062de1913228509b5590306c6",
      "163980bd0748565543458efb3ca3b1363371147987f189cf267bb731",
      "327a01adf251d60d7ce1e1983ea4e5ef87b2c5d4cda328ad054aeb2c",
      "ca89a080e84ab18f04135fa95f2d32d51148785abde2fb3f5dc33c96",
      "12df850444c416b671556ebf740a19ff0f289af71b34f4721029b4a6",
      "625e8c26cddfc48928ebfec5d610774328e8453e878a198f5628fed3",
      "89a0cff59597ed3f64a40cb1e582b5d1f6be210120f2953fc9b70e1e",
      // Testnet cubes
      "e4a17bd85c7394d900a3c2942c01fb5d9e862537fbe6a2cdfbe319cd",
      "527663e2a745f28b30c02abc3a815cceda0631982b00eafec7c7ce53"];

      return cubeIds.includes(policyId);
  }
}