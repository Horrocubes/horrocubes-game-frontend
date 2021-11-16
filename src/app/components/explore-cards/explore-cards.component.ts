import { Component, OnInit } from '@angular/core';
import { Horrocard } from 'src/app/models/Horrocard';
import { ApiService }        from '../../api.service';
import { Router }            from '@angular/router';

@Component({
  selector: 'explore-cards',
  templateUrl: './explore-cards.component.html',
  styleUrls: ['./explore-cards.component.css']
})

/***
 * Portfolio classic four component
 */
export class ExploreCardsComponent implements OnInit {

  public cards: Horrocard[] = [];  
  page: number = 0; 
  isLoading: boolean =  true;
  totalPages: number = 0;
  loadingPage: boolean = false;
  filter: string = "";
  constructor(private api: ApiService, private router: Router) { }

  ngOnInit(): void
  {
    this.getCards(""); 
  }

  // To get image data from api  
  getCards(filter: string) {  
    this.api.getMintedCards(this.page, 8, filter).subscribe((res) => this.onSuccess(res));  
  }  
  
  // When we got data on a success  
  onSuccess(res) {  
    if (res != undefined)
    {  
      this.totalPages = res.totalPages;
      res.horrocards.forEach(item =>
      {  
        this.cards.push(item);  
      });  
    }
    this.loadingPage = false;
    this.isLoading = false;
  }  
  
  // When scroll down the screen  
  onScroll()  
  {  
    if (this.totalPages === this.page)
      return;

    this.page = this.page + 1;  
    this.loadingPage = true;
    this.getCards(this.filter);  
  } 

  goToDetail(card)
  {
    this.api.setCurrentCard(card);
    this.router.navigate(['/card-details']);
  }

  parseAssetName(name: string)
  {
    return name.substr(name.length - 5, name.length);
  }

  searchCube(number: string)
  {
    this.page = 0;  
    this.isLoading = true;
    this.cards = [];
    this.filter = number;
    this.getCards(this.filter);
  }

  cleanCardName(name: string)
  {
    name = name.replace('Horrocard - ', '');
    name = name.split(' #')[0];
    return name;
  }
}
