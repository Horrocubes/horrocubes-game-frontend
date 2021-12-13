/**
 * @file FooterComponent.ts
 *
 * @author Angel Castillo <angel.castillo@horrocubes.io>
 * @date   Dec 10 2021
 *
 * @copyright Copyright 2021 Horrocubes.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* IMPORTS *******************************************************************/

import { Component, OnInit, Input } from "@angular/core";
import { NgbModal }                 from '@ng-bootstrap/ng-bootstrap';
import { Title, Meta }              from '@angular/platform-browser';
import { DAppConnectorService }     from '../../DAppConnector.service';

// EXPORTS ************************************************************************************************************/

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})

/***
 * Header Component
 */
export class HeaderComponent implements OnInit {

  _isConnected = false;
  isCondensed = false;
  @Input() navClass: string;
  @Input() buttonList: boolean;
  @Input() sliderTopbar: boolean;
  @Input() isdeveloper: boolean;
  @Input() shopPages: boolean;


  /**
   * @summary Initializes a new instance of the HeaderComponent class.
   */
  constructor(private modalService: NgbModal, private titleService: Title, private metaService: Meta, private _cardano: DAppConnectorService)
  {
  }

  /**
   * Executed after Angular initializes the component's views and child views.
   */
  ngAfterViewInit()
  {
    if (this._cardano.isWalletInjected())
    {
      this._cardano.isWalletConnected().subscribe(x => this._isConnected = x);
    }
  }

  /**
   * @summary Initialize the component after Angular initializes the data-bound input properties.
   */
  ngOnInit(): void
  {
    this.titleService.setTitle("Horrocubes - True NFTs have come to Cardano.");
    this.metaService.addTags([
      {name: 'keywords', content: 'cnft,nft,nft meaning,nft art,nft crypto,what is a nft,whats an nft,how to buy nft,what is an nft,nft token,what does nft mean,cardano nft,how to invest in nft,nft crypto coins,nft explained,cardano,blockchain,plutus,alonzo-era nft,alonzo nft,cardano true nft,nft puzzle,ada,cardano ada, cardano steganography'},
      {name: 'title', content: 'Horrocubes | True NFTs have come to Cardano! | Solve puzzles and collect rewards.'},
      {name: 'description', content: 'Horrocubes are puzzle boxes that live on the Cardano blockchain. Players will be immersed in a story taking place in the H.P Lovecraft universe. Each time a puzzle is solved, the story advances. The ultimate goal is to unlock all chapters of the story and reach its conclusion.'},
      {name: 'robots', content: 'index, follow'},
    ]);
  }

  /**
   * Display the modal component.
   * 
   * @param content The content on the modal.
   */
  developerModal(content)
  {
    this.modalService.open(content, { size: 'lg', centered: true });
  }
  
  /**
   * Connect to Nami wallet.
   */
  connect()
  {
    if (!this._cardano.isWalletInjected())
      return;

    if (this._isConnected)
      return;

    this._cardano.requestWalletAccess();
    this._cardano.getConnectionState().subscribe(x => this._isConnected = x);
  }
}