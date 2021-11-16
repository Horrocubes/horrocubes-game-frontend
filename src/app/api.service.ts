/* IMPORTS *******************************************************************/

import { Injectable }                                 from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError }                     from 'rxjs';
import { catchError, concatMap, mergeMap, map }       from 'rxjs/internal/operators';
import { environment }                                from './../environments/environment';
import { Session }                                    from './models/Session';
import { Horrocube }                                  from './models/Horrocube';
import { Horrocard }                                  from './models/Horrocard';

import * as internal from 'events';

// EXPORTS ************************************************************************************************************/

@Injectable({
  providedIn: 'root'
})
export class ApiService
{
  _cardRarity = {
    "FOOL":	0.026,
    "MAGICIAN":	0.010,
    "HIGH_PRIESTESS":	0.047,
    "EMPRESS":	0.048,
    "EMPEROR":	0.066,
    "HIEROPHANT":	0.032,
    "LOVERS":	0.016,
    "CHARIOT":	0.059,
    "STRENGTH":	0.055,
    "HERMIT":	0.069,
    "WHEEL_OF_FORTUNE":	0.053,
    "JUSTICE":	0.012,
    "HANGED_MAN":	0.066,
    "DEATH":	0.010,
    "TEMPERANCE":	0.068,
    "DEVIL":	0.030,
    "TOWER":	0.046,
    "STAR":	0.037,
    "MOON":	0.065,
    "SUN":	0.065,
    "JUDGEMENT":	0.056,
    "WORLD":	0.066
  }

  _core = {
    "Carcosian Meteorite Fragment": 0.1198,
    "Black R'lyehian Crystal":	0.109,
    "Iridescent Carcosian Meteorite Fragment":	0.03,
    "Lu-Kthu Rigid Fragment":	0.1253,
    "Tenebrosium-115":	0.1186,
    "Golden Kadathian Steel Fragment":	0.01,
    "Hellish Mnarian Iron":	0.1215,
    "Inactive R'lyehian Crystal":	0.1242,
    "Fragmented R'lyehian Heart":	0.1217,
    "Kadathian Ruby":	0.0599,
    "Void Crystal":	0.06
  }

  _aspect = {
    "Wrath":	0.03,
    "Judgment":	0.1587,
    "Decay":	0.01,
    "Fear":	0.1593,
    "Dread":	0.1644,
    "Desolation":	0.0899,
    "Destruction":	0.0699,
    "Conquest":	0.1552,
    "Anguish":	0.1626
  }

  _mechanism = {
    "Dooms Day":	0.0598,
    "Chronal Displacement":	0.01,
    "Entropy Amplifier":	0.04,
    "Interdimencional Ressonator":	0.1828,
    "Hellish Transducer":	0.0698,
    "Worldbreaker":	0.01,
    "Reality Splitter":	0.1901,
    "Gaian Ripper":	0.1295,
    "Ythian Assimilator":	0.01,
    "Kadathain Oneiromancer": 	0.0897,
    "Elder Divination":	0.02,
    "Nociceptor Stimuli Generator":	0.1883
  }

  _commuter = {
    "Ultarian Navigation":	0.02,
    "Ythian Interdimencional":	0.03,
    "Mi-Go Spacetime":	0.0797,
    "Mnarian Intergalactic":	0.03,
    "Oneiric":	0.1349,
    "Unpredictable":	0.1377,
    "Heretic Eye":	0.02,
    "Nyarlathian Abbyssal Mirror":	0.0896,
    "Encapsulated N'rath-Gol Acid":	0.05,
    "Lu-Kthu Diluted Essence":	0.1349,
    "Parthenogenysed Shards":	0.1323,
    "Nameless Mist Tears": 	0.1409
  }

  _supports = {
    "Nithonian":	0.05,
    "Ultarian":	0.05,
    "Carcossian":	0.1283,
    "Mnarian":	0.1382,
    "Mi-Go":	0.05,
    "Thalorian":	0.1289,
    "Yithian":	0.1563,
    "Ethereal":	0.01,
    "Unbreakable Shoggothian":	0.02,
    "Luciferian Shackle": 0.1586,
    "Divine": 0.01,
    "Earthian Saturated Superalloy": 0.0997
  }

  _ornaments = {
    "Muisak Skulls":	0.137,
    "Memento Mori Vertex":	0.1519,
    "Unholy Ornaments":	0.02,
    "Ectoplasmic Ornaments":	0.1188,
    "Synthesized Misery": 	0.03,
    "Aletheian Ornaments":	0.1286,
    "Pnathian Remnants":	0.1413,
    "Hardened Yekobite":	0.05,
    "Polished Sarnathian Remains":	0.1425,
    "Molten Voonith Tusks":	0.0799
  }

  _currentCube: Horrocube;
  _currentCard: Horrocard;

  constructor(private httpClient: HttpClient) {
  }

  setCurrentCard(card: Horrocard)
  {
    this._currentCard = card;
  }

  getCurrentCard()
  {
    return this._currentCard;
  }

  setCurrentCube(cube: Horrocube)
  {
    this._currentCube = cube;
  }

  getCurrentCube()
  {
    return this._currentCube;
  }

  clearCurrentCube()
  {
    this._currentCube = new Horrocube();
  }

  verifyPolicy(policy: String): Observable<any>  {
    return this.httpClient.get<any>(environment.apiBaseUrl  + 'verifyPolicyId/' + policy)
        .pipe(catchError(this.handleError))
        .pipe(map((value) =>
        {
          let verification = { result: false, horrocube: null, card: null, horrocoin: null, proofOfCompletion: null };

          if (value === null || value === undefined)
            return verification;

            verification.result = true;

          if (value.type === "HORROCUBE")
            verification.horrocube = Object.assign(new Horrocube(), value.horrocube)

          if (value.type === "HORROCARD")
            verification.card = Object.assign(new Horrocard(), value.horrocard);

          if (value.type === "HORROCOIN")
            verification.card = value.horrocoin;

          if (value.type === "PROOF_OF_COMPLETION")
            verification.card = value.proofOfCompletion;

          return verification;
        })
        );
  }

  createSession(): Observable<Session> {
    return this.httpClient.post(environment.apiBaseUrl + 'createSession', {})
        .pipe(catchError(this.handleError))
        .pipe(map(value => Object.assign(new Session(), value))
    );
  }

  getAmount(): Observable<any> {
    return this.httpClient.get<Number>(environment.apiBaseUrl  + 'getAmount')
        .pipe(catchError(this.handleError)
    );
  }

  getMintedCount(): Observable<any> {
    return this.httpClient.get<Number>(environment.apiBaseUrl  + 'getMintedCount')
        .pipe(catchError(this.handleError)
    );
  }

  getAccount(id: String): Observable<Session> {
    return this.httpClient.get<any>(environment.apiBaseUrl  + 'getSession/' + id)
        .pipe(catchError(this.handleError))
        .pipe(map(value => Object.assign(new Session(), value))
    );
  }

  submitMintTransaction(id: String): Observable<any> {
    return this.httpClient.post<any>(environment.apiBaseUrl  + 'submitMintTransaction/' + id, {}).pipe(
      catchError(this.handleError)
    );
  }

  trackTransaction(id: String): Observable<Horrocube> {
    return this.httpClient.get<any>(environment.apiBaseUrl  + 'trackTransaction/' + id)
        .pipe(catchError(this.handleError))
        .pipe(map(value => Object.assign(new Horrocube(), value))
    );
  }

  getMintedCubes(page: number, size: number, filter:string): Observable<any>
  {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'getMintedCubes/' + page + '/' + size + '/' + filter);
  }

  getPolicyScript(utxo: string, assetName: string): Observable<any>
  {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'getPolicyScript/' + utxo + '/' + assetName );
  }

  getDefaultCubePolicyScript(): String
  {
    return "{\n"+
    "    \"type\": \"PlutusScriptV1\",\n" +
    "    \"description\": \"\",\n" +
    "    \"cborHex\": \"5911f85911f5010000333323232332233322233223232323332223332223332223322332233322233333333222222223322333332222233332222332233223322332233223322323233223232323232323232323232323232323233223232323232323322323232323232323232323232323232323233332222332232323232323232323232323232323232323232323232323232323232323232323232323232222335505c35004014223232330593303b491164964656e74697479204e4654206e6f7420666f756e640033350580523305635020500100548008cc164cc0ed24011f496e76616c696420506f7374666978206f722077726f6e6720616d6f756e7400533535096013041303a5001130021622135355504600222253353509b010041323305f330393355066233550673304433043371a002900824020002607800666aa0cc608801a66aa0cc60b201aa66a6a11c0266aa0c0607ca66a6a1380266a0aa46a611602002444666a0c40b8660c000401e9001181fa803898008b110a99a9a84f00800880111098028b119aa83099826800a804119a82403180090982e00089a84b80a4811e436f756e746572206f757470757420646174756d206e6f7420666f756e6400333505e058002480088d425c0524011b45787065637465642065786163746c79206f6e65206f7574707574002213009163303b4901114d697373696e67207369676e617475726500330375001006130600022081011222230053300330040023006001253353079001108d0113508a0135308c0133573892010250640008d014988c8c8c8c8c8c8cccd5cd19b8735573aa00a90001280112803a4c2660bea002a0042600c6ae8540084c050d5d09aba25001135573ca00226ea80084d422405262323232323232323232323232323232323232323232323333573466e1cd55cea80aa40004a0044a02e93099999999998382800a8012801a8022802a8032803a8042804a805099a81080b1aba15012133502001635742a0202666aa032eb94060d5d0a8070999aa80c3ae501735742a018266a03a0426ae8540284cd4070cd54078085d69aba15008133501675a6ae8540184cd4069d71aba150041335019335501b75c0346ae8540084c080d5d09aba25001135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135573ca00226ea80084d4220052623232323232323333573466e1cd55cea802a40004a0044a00e93099830a800a8010980b9aba1500213005357426ae8940044d55cf280089baa002135087014988c8c8c8c8c8c8c8c8cccd5cd19b8735573aa00e90001280112804a4c266610002a002a004a006260106ae8540104ccd54029d728049aba15002133500775c6ae84d5d1280089aba25001135573ca00226ea80084d4218052623232323232323333573466e1cd55cea802a40004a0044a00e9309983fa800a8010980a1aba150021335005012357426ae8940044d55cf280089baa00213508501498488c8c8c8c8c8c8cccd5cd19b8750044800094008940112613508201500113006357426aae79400c4cccd5cd19b8750014800894200049401126135573aa00226ea80084d421405261335500175ceb444888c8c8c004dd58019a80090008918009aa8470091191919191919191999aab9f0085508f01253002120010910135002220013500122002355550950112223300321300a357440124266a12802a00aa600624002266aa12402a002a004260106aae7540084c018d55cf280089aba10011223232323232323333573466e1cd55cea802a40004a0044a00e93099a82f2800a801099a8038031aba150021335007005357426ae8940044d55cf280089baa00213508201498488c8c8c8c8c8c8cccd5cd19b8735573aa00a90001280112803a4c266a0c2a002a004266a01000c6ae8540084c020d5d09aba25001135573ca00226ea80084d420405261223232323232323333573466e1cd55cea802a40004a0044a00e93099a82f2800a801099a8038031aba1500213007357426ae8940044d55cf280089baa00213508001498488c8c8c8c8c8c8c8cccd5cd19b8750054801094190940092613333573466e1d4011200225002250044984d418d40044c018d5d09aab9e500313333573466e1d4005200025061250044984d55cea80089baa00213507f4988c8c8c8cccd5cd19b8750024800881c8940092613333573466e1d400520002070250034984d55ce9baa00213507d498488c8c8c004dd60019a80090008918009aa84380911999aab9f001250870123350860130063574200460066ae8800820c04800444888c8c8c8c8c8c8cccd5cd19b8735573aa00a90001280112803a4c266aa11202a002a0042600e6ae8540084c014d5d09aba25001135573ca00226ea80084d41f126232323232323232323232323232323333573466e1d4029200625002250044984c1a940044c038d5d09aab9e500b13333573466e1d401d200425002250044984c19540044c030d5d09aab9e500813333573466e1d4011200225002250044984c18540044c02cd5d09aab9e500513333573466e1d4005200025003250064984d55cea8018982fa80089bae357426aae7940044dd500109a83ca4c4646464646464646464646464646464646464646464646464646666ae68cdc3a80aa401840f84a0049309999ab9a3370ea0289005103e1280124c26666ae68cdc3a809a40104a0044a00c9309983b2800a80109bae35742a00426eb4d5d09aba25001135573ca02426666ae68cdc3a8072400c4a0044a00c930998392800a80109bae35742a00426eb8d5d09aba25001135573ca01a26666ae68cdc3a804a40084a0044a00c93099838a800a801098069aba150021375c6ae84d5d1280089aab9e500813333573466e1d4011200225002250044984c1b540044c020d5d09aab9e500513333573466e1d4005200025003250064984d55cea80189833a800898021aba135573ca00226ea80084d41e12623232323232323232323232323333573466e1d4021200225002250084984ccc1f140054009400c4dd69aba150041375a6ae8540084dd69aba135744a00226ae8940044d55cf280289999ab9a3370ea0029000128019280324c26aae75400c4c1d540044c010d5d09aab9e50011375400426a0ee93119191919191919191999ab9a3370ea0089001128011280224c260f4a00226eb8d5d09aab9e500513333573466e1d4005200025003250064984d55cea8018983ba80089bae357426aae7940044dd500109a83b24c46464646464646666ae68cdc39aab9d500548000940089401d26133060500150021300635742a00426eb4d5d09aba25001135573ca00226ea80084d41d52623232323333573466e1cd55cea801240004a0044a0089309bae357426aae7940044dd500109a83a24c246a608a0024444444444666aa606424002a018040014266a058a002a0ee2600202444466aa60122400246a6aa0f40024466aa0fa00466aa60182400246a6aa0fa0024466aa10002004666a6aa02a00246601490000009119805801000919805000a4000002660080040024466aa600e2400246a6aa0f00024466aa0f6004666a6aa020002466aa60162400246a6aa0f80024466aa0fe0046aa02e00200244666aaa01002c004002466aa60162400246a6aa0f80024466aa0fe0046aa02a002002666aaa006022004002222444666aa605c24002a0ea66aa600e2400246a6aa0f00024466aa0f60046aa026002666aa605c24002446a6aa0f200444a66a60c6666aa6052240026a010a01a46a6aa0f8002446601400400a00c2006266a0f2008006a0ec00266aa600e2400246a6aa0f000244646466aa0fa008600200c6a00240022460026aa0fa44a66a6a0f400226aa0280084426a6aa0fe00444a66a60d26601a004012266aa0320100022600c0060042466a05044666a00a0060040026a004002246a6a00e00244002246a6a00c002440046a00240022460026aa0e4442244a66a6a0e20022a0e644266a0e8600800466aa600c24002008002266a0060020ae44a66a60ae00420b2200224424660020060042400222424446006008224424446600400a0082242444600200822400244666ae68cdc78010008290289119b8000200123530320012235305200122200220012235302f002222222222253353505d33355301c120015020253353057333573466e3c0300041641604d41800045417c00c84164415c8d4c1340048880048d4c0b000488888888880248d4c0ac004888888888801c894cd4c12000441284cd5ce0010249119b810020012223337180060040026a00240022460026aa0ba444a66a608c666ae68cdc41b8d0014804012011c4cc00c008cdc599b8e002480000044004480048d4008488ccd5401488d4d5417400888ccd5402488d4d54184008894cd4c12cccd5cd19b8700148000134130400c4cc028ccd55403c01800800400c00c00400400c48cd40054159415c4488c8c8004d4004800448c004d5416c894cd4d41600044010884cc01c008c01000444488848ccc00401000c008444800488d4c08000488888888894cd4d4138ccd54c0344800540448d4d54180004894cd4c128ccd5cd19b8f00200f04c04b13505300315052002213505135355060001220011504f350012001123001355054221123222533535055001135008004221335005300400233355300812001006004001135006001123535004001220011235350030012200213350025003503e12212330010030021200112253353503c00221003100112335530021200122533530353003002133504b0020011001504a35001200112300135504b221122253353504b0011002221330050023335530071200100500400122333573466e1c0080040cc0c888c8c8c8cc004cc018011400d22010035001200112300135504c2223535504d0022253353037333573466e2400920000380391330053300a00250073371666e3802400400c54cd4c0dd4cd4c0dcccd5cd19b87002480000e40e04ccd5cd19b89001480000e00e440e04cdc599b8e00900100315335303753353037333573466e1c00920000390381333573466e1c005200003903810381003161371a0044466aa09066e0c008004cdc300100091a980500091001111a9aa8228009119980280200100091119191918008031a80090008918009aa8249119a9a823000a4000446a6aa09600444a66a606a666ae68cdc780100501b81b09804000898030019191918008019a80090008918009aa8249119a9a823000a4000446a6aa09600444a66a606a666ae68cdc780100481b81b0800898030018900091299a9815001080088158891299a9a8180011098010008a81891999999aba4001232323232323232323333573466e1cd55cea804240004a0044a0729309999aab9f50062503825002043133335573ea0084a06e4a00408426666aae7d40049400c940d81044d5d128010a99a9a819299a9a81918031aba15002213503530080011503321533535033300735742a004426a06c60040022a0682a06626ae8940044d55cf280089baa0022503025030250302503003b2333333357480024a05e4a05e4a05e46a0606eb4008940bc0e888cc0100080048848cc00400c00880044488c0080048d4c008004880088848cc00400c0088004888888888848cccccccccc00402c02802402001c01801401000c00880048848cc00400c008800448848cc00400c0084800448848cc00400c0084800448848cc00400c00848004484888c00c010448880084488800448004848888c010014848888c00c014848888c008014848888c00401480048848cc00400c0088004848888888c01c0208848888888cc018024020848888888c014020488888880104888888800c8848888888cc0080240208848888888cc0040240208004488008488004800488848ccc00401000c00880048848cc00400c008800448488c00800c4488004480048488c00800c888488ccc00401401000c80048488c00800c8488c00400c800448d4008d4c010cd5ce000802a4c24c224a00c2400240022244004244244660020080062400222442466002006004224002224646002002446600660040040022222466a0044246600246a00644600400646a00644600200600224646460020024466006600400400244246a6008246a60080066a00600200291110303132333435363738394142434445460048811c52cdb93f3e798d9c73866450e6e2bfb4a3da911f702ea055e3042dab00332233550024891cfaa010b8d565ccb2613017eab6cc41f29c7e05c7fd91bae7fe88091200488115486f72726f63756265734d696e7465724167656e7400112212330010030021120011\"" +
    "}";
  }

  getMintedCards(page: number, size: number, filter:string): Observable<any>
  {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'getMintedCards/' + page + '/' + size + '/' + filter);
  }

  getCardPolicyScript(utxo: string, assetName: string): Observable<any>
  {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'getCardPolicyScript/' + utxo + '/' + assetName );
  }

  private handleError(error: HttpErrorResponse): any {

    console.log(error);
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error.msg}`);
    }
    return throwError(
      `${error.error.msg}`);
  }

  private extractData(res: Response): any {
    const body = res;
    return body || { };
  }

  getCardRarity(name)
  {
    return "Only " + this.roundOff(this._cardRarity[name] * 100) + "% of the total cards are of this type.";
  }

  getCoreRarity(name)
  {
    return "Only " + this.roundOff(this._core[name] * 100) + "% of the Horrocubes have this attribute.";
  }

  getAspectRarity(name)
  {
    return "Only " + this.roundOff(this._aspect[name]* 100) + "% of the Horrocubes have this attribute.";
  }

  getMechanismRarity(name)
  {
    return "Only " + this.roundOff(this._mechanism[name]* 100) + "% of the Horrocubes have this attribute.";
  }

  getCommuterRarity(name)
  {
    return "Only " + this.roundOff(this._commuter[name]* 100) + "% of the Horrocubes have this attribute.";
  }
  
  getSupportsRarity(name)
  {
    return "Only " + this.roundOff(this._supports[name]* 100) + "% of the Horrocubes have this attribute.";
  }

  getOrnamentsRarity(name)
  {
    return "Only " + this.roundOff(this._ornaments[name] * 100) + "% of the Horrocubes have this attribute.";
  }

  roundOff(num)
  {
    return Math.round(num * 100) / 100
  }
}