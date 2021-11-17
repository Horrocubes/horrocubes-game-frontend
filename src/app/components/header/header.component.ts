import { Component, OnInit, Input } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title, Meta } from '@angular/platform-browser';
import { CardanoService } from '../../cardano.service';

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
  @Input() navClass: string;
  @Input() buttonList: boolean;
  @Input() sliderTopbar: boolean;
  @Input() isdeveloper: boolean;
  @Input() shopPages: boolean;


  constructor(private router: Router, private modalService: NgbModal, private titleService: Title, private metaService: Meta, private _cardano: CardanoService) {
  }

  isCondensed = false;

  ngAfterViewInit()
  {
    if (this._cardano.isWalletInjected())
    {
      this._cardano.isWalletConnected().subscribe(x => this._isConnected = x);
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle("Horrocubes - True NFTs have come to Cardano.");
    this.metaService.addTags([
      {name: 'keywords', content: 'cnft,nft,nft meaning,nft art,nft crypto,what is a nft,whats an nft,how to buy nft,what is an nft,nft token,what does nft mean,cardano nft,how to invest in nft,nft crypto coins,nft explained,cardano,blockchain,plutus,alonzo-era nft,alonzo nft,cardano true nft,nft puzzle,ada,cardano ada, cardano steganography'},
      {name: 'title', content: 'Horrocubes | True NFTs have come to Cardano! | Solve puzzles and collect rewards.'},
      {name: 'description', content: 'Horrocubes are puzzle boxes that live on the Cardano blockchain. Players will be immersed in a story taking place in the H.P Lovecraft universe. Each time a puzzle is solved, the story advances. The ultimate goal is to unlock all chapters of the story and reach its conclusion.'},
      {name: 'robots', content: 'index, follow'},
    ]);
  }

  developerModal(content)
  {
    this.modalService.open(content, { size: 'lg', centered: true });
  }
  
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