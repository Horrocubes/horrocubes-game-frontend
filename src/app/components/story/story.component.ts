import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Horrocube } from 'src/app/models/Horrocube';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ApiService }        from '../../api.service';
import { Level } from 'src/app/models/Level';
import { StoryService } from '../../story.service';
import { Sha256 } from '../../sha256'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewChild } from '@angular/core';
import * as EmurgoSerialization from '../../vendors/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib'
import CoinSelection from '../../vendors/coinSelection.js'
import { CardanoService } from 'src/app/cardano.service';
import { Buffer } from "buffer";
@Component({
  selector: 'story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})

/***
 * CardDetailsComponent Component
 */
export class StoryComponent implements OnInit {

  _levels:Level[] = [];
  _currentLevel:Level = new Level();
  _currentCube: Horrocube;

  @ViewChild('ModalContentCorrect', { static: false })
  private _rightContent;

  @ViewChild('ModalContentIncorrect', { static: false })
  private _wrongContent;

  constructor(private _cardano: CardanoService, private api: ApiService, private router:Router, private story: StoryService, private modalService: NgbModal) { }

  typedArrayToBuffer(array) {
    // https://stackoverflow.com/questions/37228285/uint8array-to-arraybuffer
        return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset)
    }

/*transaction_body =
 { 0 : set<transaction_input>    ; inputs
 , 1 : [* transaction_output]
 , 2 : coin                      ; fee
 , ? 3 : uint                    ; time to live
 , ? 4 : [* certificate]
 , ? 5 : withdrawals
 , ? 6 : update
 , ? 7 : auxiliary_data_hash
 , ? 8 : uint                    ; validity interval start
 , ? 9 : mint
 , ? 11 : script_data_hash       ; New
 , ? 13 : set<transaction_input> ; Collateral ; new
 , ? 14 : required_signers       ; New
 , ? 15 : network_id             ; New
 }
*/
    /*
    transaction_witness_set =
  { ? 0: [* vkeywitness ]
  , ? 1: [* native_script ]
  , ? 2: [* bootstrap_witness ]
  , ? 3: [* plutus_script ] ;New
  , ? 4: [* plutus_data ] ;New
  , ? 5: [* redeemer ] ;New
  }
*/
/*
transaction =
  [ transaction_body
  , transaction_witness_set
  , bool
  , auxiliary_data / null
  ]
*/
  fixTransaction(tx, a)
  {
    let newTx = [];
    let witnessDataSet = {0: [new Array()], 3: [tx[1][0][1]], 4: tx[2], 5: tx[3] };

    newTx[0] = tx[0];
    newTx[1] = witnessDataSet;
    newTx[2] = true;
    newTx[3] = null;

/*
    let tm1 = newTx[0][1][1][1][1]
    let tm2 = newTx[0][1][2][1][1]
    let tm3 = newTx[0][1][3][1][1]

    let aarr = new Array();
    Object.keys(tm1).forEach(key => {
      aarr.push(tm1[key]);
    });

    newTx[0][1][0][1][1] = aarr;

    let aarr2 = new Array();
    Object.keys(tm2).forEach(key => {
      aarr2.push(tm2[key]);
    });

    newTx[0][1][1][1][1] = aarr2;

    let aarr3 = new Array();
    Object.keys(tm3).forEach(key => {
      aarr3.push(tm3[key]);
    });

    newTx[0][1][2][1][1] = aarr3;*/

    return newTx;
  }

  ngOnInit(): void
  {
    this.story.getCurrentLevel().subscribe((x) => this._currentLevel = x);
    this.story.getAllLevels().subscribe((x) => this._levels = x);
    this._currentCube = this.story.getcurrentCube();

    if (this._currentCube == null)
    this.router.navigate(['/']);
    console.log(this._currentCube);

    CoinSelection.setProtocolParameters(
      this._cardano.getProtocolParameters().minUtxo,
      this._cardano.getProtocolParameters().linearFee.minFeeA,
      this._cardano.getProtocolParameters().linearFee.minFeeB,
      this._cardano.getProtocolParameters().maxTxSize.toString()
    );

    //console.log(decode(this.typedArrayToBuffer(this.fromHex(this._tx))));
    //console.log(this.fixTransaction(decode(this.typedArrayToBuffer(this.fromHex(this._tx))), decode(this.typedArrayToBuffer(this.fromHex(this._txName)))));
    //console.log(decode(this.typedArrayToBuffer(this.fromHex(this._txName))));

    //onsole.log(this.toHex(encode(this.fixTransaction(decode(this.typedArrayToBuffer(this.fromHex(this._tx))), decode(this.typedArrayToBuffer(this.fromHex(this._txName)))))));
    //console.log(this._txName);
    //this._cardano.getWalletInstance().cardano.signTx(this._txName);
  }

  parseAssetName(name: String)
  {
    return name.substr(9, 5);
  }


  getLevelTrackerSegmentWidth()
  {
    return (100.0 / (this._levels.length)) + "%";
  }

  getCurrentContent()
  {
    return this._levels.find((x) => x.isCurrent);
  }

  openModal(content) {
    this.modalService.open(content, { size: 'lg', windowClass: 'modal-holder', centered: true });
  }
  
  closeModal() {
    this.modalService.dismissAll();
  }
  fromHex = (hex) => Buffer.from(hex, "hex");
  toHex(bytes: any)
  {
    return Buffer.from(bytes).toString("hex");
  } 

  fromAscii(hex)
  {
    return Buffer.from(hex).toString("hex");
  }












  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  


  async onClick(value)
  {
    let firstPass = Sha256.hash(this._currentCube.policyId + '.' + this._currentCube.assetName + value);
    let secondPass = Sha256.hash(firstPass, {messageFormat: 'hex-bytes'});

    console.log(this._currentCube.policyId + '.' + this._currentCube.assetName + value);
    console.log(firstPass);
    console.log(secondPass);
    console.log(this._currentCube.stories[0].currentLevel);
    console.log(this._currentCube.stories[0].levels[0].answerHash);
    console.log(this._currentCube.stories[0].levels[1].answerHash);
    console.log(this._currentCube.stories[0].levels[2].answerHash);
    console.log(this._currentCube.stories[0].levels[3].answerHash);
    if (secondPass === this._currentCube.stories[0].levels[this._currentCube.stories[0].currentLevel].answerHash)
    {
      this.openModal(this._rightContent);
      this._currentCube.stories[0].currentLevel += 1;

      let redeemer = this._cardano.getRedeemer("2", firstPass);
      let originalDatum = this._cardano.getDatum("2");
      let nextDatum = this._cardano.getDatum("3");
      console.log(this.toHex(originalDatum.to_bytes()));
      console.log(this.toHex(nextDatum.to_bytes()));

     // let datumxx = EmurgoSerialization.PlutusData.from_bytes(this.fromHex("d8799f00ff"));
      //console.log(this.toHex(datumxx.to_bytes()));

      //let datum = EmurgoSerialization.PlutusData.from_bytes(this.fromHex("d8799f00ff"));
      //console.log("d8799f00ff");
      //console.log(this.toHex(datum.to_bytes()));
      //let testDatum = EmurgoSerialization.PlutusData.from_bytes(this.fromHex("021a0002a5f10e809fff81d8799f00ff80f5f6"));
      /*console.log(this.toHex(EmurgoSerialization.hash_plutus_data(testDatum).to_bytes()));
      console.log("XXXXXXXXXXXXXXXXXX");
      console.log("021a0002a5f10e809fff81d8799f00ff80f5f6");
      console.log(this.toHex(testDatum.to_bytes()));*/
      //datum = Loader.Cardano.PlutusData.from_bytes(fromHex(datum));
      //if (
        //console.log("XXXXXXXXXXXXXXXXXX");
        //console.log(this.toHex(EmurgoSerialization.hash_plutus_data(originalDatum).to_bytes()));  //d8799f00ff
        //console.log(this.toHex(EmurgoSerialization.hash_plutus_data(nextDatum).to_bytes()));      //d8799f01ff
        //console.log(this.toHex(EmurgoSerialization.hash_plutus_data(redeemer.data()).to_bytes()));
        //console.log("XXXXXXXXXXXXXXXXXX");
        //console.log(this.toHex(originalDatum.to_bytes()));
        //console.log(this.toHex(nextDatum.to_bytes()));
        //console.log(this.toHex(redeemer.data().to_bytes()));
        //console.log(this.toHex(EmurgoSerialization.hash_plutus_data(testDatum).to_bytes()));

        //console.log(this.toHex(EmurgoSerialization.hash_plutus_data(testDatum).to_bytes()));
        //console.log("XXXXXXXXXXXXXXXXXX");
      //  utxo.data_hash
     // )


      const { txBuilder, datums, outputs } = this._cardano.initTx();

      const walletAddress = EmurgoSerialization.BaseAddress.from_address(
        EmurgoSerialization.Address.from_bytes(
          this.fromHex((await this._cardano.getWalletInstance().cardano.getUsedAddresses())[0])
        )
      );

      const utxos = (await this._cardano.getWalletInstance().cardano.getUtxos()).map((utxo) =>
      EmurgoSerialization.TransactionUnspentOutput.from_bytes(this.fromHex(utxo))
    );

    datums.add(nextDatum);
    datums.add(originalDatum);


    //outputs.add(this._cardano.createOutput(walletAddress.to_address(), EmurgoSerialization.Value.new(  EmurgoSerialization.BigNum.from_str("10000000")), null));
    /*"addr_test1wryv07grng6j63hf6tfvlp9ksvqw877aezhvc4jagy2tamc7umtwt+3000000+ 1 07599433c1f538dea3dfc580bf1a5422bb2753df29bdbcb76d68bffc.Horrocube00021s0Story + 1 6e8d3a062f9ab1d0b44c95ab4970e4ed8c8c9f99b577c3d3ee0cc97c.BetaTestTrophy00027x199999AB + 3 fc89b826eaf4745f78bce25297af9cb2eb44909acdf1e2bb71bed1a6.Horrocoin"*/
    let originalBalance = this._cardano.assetsToValue([
      { unit: "lovelace", quantity: "3000000" },
      {
        unit:
          "07599433c1f538dea3dfc580bf1a5422bb2753df29bdbcb76d68bffc" +
          this.fromAscii("Horrocube00021s0Story"),
        quantity: "1",
      },
      {
        unit:
          "6e8d3a062f9ab1d0b44c95ab4970e4ed8c8c9f99b577c3d3ee0cc97c" +
          this.fromAscii("BetaTestTrophy00027x199999AB"),
        quantity: "1",
      },
      {
        unit:
          "fc89b826eaf4745f78bce25297af9cb2eb44909acdf1e2bb71bed1a6" +
          this.fromAscii("Horrocoin"),
        quantity: "2",
      },
    ])

    let newOutputBallance = this._cardano.assetsToValue([
      { unit: "lovelace", quantity: "3000000" },
      {
        unit:
          "07599433c1f538dea3dfc580bf1a5422bb2753df29bdbcb76d68bffc" +
          this.fromAscii("Horrocube00021s0Story"),
        quantity: "1",
      },
      {
        unit:
          "6e8d3a062f9ab1d0b44c95ab4970e4ed8c8c9f99b577c3d3ee0cc97c" +
          this.fromAscii("BetaTestTrophy00027x199999AB"),
        quantity: "1",
      },
      {
        unit:
          "fc89b826eaf4745f78bce25297af9cb2eb44909acdf1e2bb71bed1a6" +
          this.fromAscii("Horrocoin"),
        quantity: "1",
      },
    ])


    let claimCoin = this._cardano.assetsToValue([
      { unit: "lovelace", quantity: "2000000" },
      {
        unit:
          "fc89b826eaf4745f78bce25297af9cb2eb44909acdf1e2bb71bed1a6" +
          this.fromAscii("Horrocoin"),
        quantity: "1",
      },
      {
        unit:
          "b79424e6d0d309e2268b5c1bc6900d1cd0d0fd71f081e864caa90c81" +
          this.fromAscii("Horrocube00021"),
        quantity: "1",
      }
    ])

    /*
          outputs.add(
        this.createOutput(
          CONTRACT_ADDRESS(),
          assetsToValue([
            { unit: "lovelace", quantity: bidAmount },
            {
              unit:
                this.contractInfo.policyBid +
                fromAscii(this.contractInfo.prefixSpaceBudBid + budId),
              quantity: "1",
            },
          ]),
          {
            datum: bidDatum,
            index: 0,
            tradeOwnerAddress: walletAddress,
            metadata,
          }
        )
      );*/
      
    outputs.add(this._cardano.createOutput(EmurgoSerialization.Address.from_bech32(this._currentCube.stories[0].scriptAddress
    ), newOutputBallance, nextDatum));
    
    outputs.add(this._cardano.createOutput(walletAddress.to_address(), claimCoin, null));
    
    /*
            return {
          datum,
          tradeOwnerAddress:
            tradeOwnerAddress &&
            EmurgoSerialization.Address.from_bytes(fromHex(tradeOwnerAddress)),
          utxo: EmurgoSerialization.TransactionUnspentOutput.new(
            EmurgoSerialization.TransactionInput.new(
              EmurgoSerialization.TransactionHash.from_bytes(fromHex(utxo.tx_hash)),
              utxo.output_index
            ),
            EmurgoSerialization.TransactionOutput.new(
              CONTRACT_ADDRESS(),
              assetsToValue(utxo.amount)
            )
          ),
          budId,*/

    console.log(this._currentCube.stories[0]);

    //let utxoId = this._currentCube.stories[0].eUtxoId.split('#')[0];
    //let utxoIndex = this._currentCube.stories[0].eUtxoId.split('#')[1];/*
    let utxo = EmurgoSerialization.TransactionUnspentOutput.new(
      EmurgoSerialization.TransactionInput.new(
        EmurgoSerialization.TransactionHash.from_bytes(this.fromHex("cd5a811d90f70d2fd789179c6d967d6c77fdcdcfacb353237dc8745e1e98a456")),
        0),
        EmurgoSerialization.TransactionOutput.new(
          this._cardano.getContractAddress("addr_test1wryv07grng6j63hf6tfvlp9ksvqw877aezhvc4jagy2tamc7umtwt"),
          originalBalance
        ));

        
    let scrips = this._cardano.getContract(this._currentCube.stories[0].plutusScript);
    const txHash = await this._cardano.finalizeTx(
      scrips,
      txBuilder,
      walletAddress,
      utxos,
      outputs,
      datums,
      undefined,
      utxo,
      redeemer
    );
    return txHash;
/*
      console.log("a");

    const tx = EmurgoSerialization.Transaction.from_bytes(Buffer.from(this.txs, "hex"));
  console.log("b");

    console.log(tx);
    const size = tx.to_bytes().length * 2;
    console.log(size);

    let txVkeyWitnesses = await this._cardano.getWalletInstance().cardano.signTx(
      this.toHex(tx.to_bytes()),
      true
    );

    txVkeyWitnesses = EmurgoSerialization.TransactionWitnessSet.from_bytes(
      this.fromHex(txVkeyWitnesses)
    );

    const transactionWitnessSet = EmurgoSerialization.TransactionWitnessSet.new();
    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

    const signedTx = EmurgoSerialization.Transaction.new(
      tx.body(),
      transactionWitnessSet,
      tx.auxiliary_data()
    );

    console.log("Full Tx Size", signedTx.to_bytes().length);

    const txHash = await this._cardano.getWalletInstance().cardano.submitTx(this.toHex(signedTx.to_bytes()));
    console.log(txHash);*/

    }
    else
    {
      this.openModal(this._wrongContent);
    }

  }

}