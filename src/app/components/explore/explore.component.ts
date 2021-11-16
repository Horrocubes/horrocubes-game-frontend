import { Component, OnInit } from '@angular/core';
import { Horrocube } from 'src/app/models/Horrocube';
import { ApiService }        from '../../api.service';
import { Router }            from '@angular/router';

@Component({
  selector: 'explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})

/***
 * Portfolio classic four component
 */
export class ExploreComponent implements OnInit {

  public cubes: Horrocube[] = [];  
  page: number = 0; 
  isLoading: boolean =  true;
  totalPages: number = 0;
  loadingPage: boolean = false;
  filter: string = "";
  minted: number = -1; 
  constructor(private api: ApiService, private router: Router) { }

  ngOnInit(): void
  {
    this.getCubes(""); 

    this.api.getMintedCount().subscribe((minted: number) =>
    {
        this.minted = minted;
    });
  }

  // To get image data from api  
  getCubes(filter: string) {  
    this.api.getMintedCubes(this.page, 8, filter).subscribe((res) => this.onSuccess(res));  
  }  
  
  // When we got data on a success  
  onSuccess(res) {  
    if (res != undefined)
    {  
      this.totalPages = res.totalPages;
      res.horrocubes.forEach(item =>
      {  
        this.cubes.push(item);  
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
    this.getCubes(this.filter);  
  } 

  goToDetail(cube)
  {
    this.api.setCurrentCube(cube);
    this.router.navigate(['/cube-details']);
  }

  parseAssetName(name: string)
  {
    return name.substr(9, 5);
  }

  searchCube(number: string)
  {
    this.page = 0;  
    this.isLoading = true;
    this.cubes = [];
    this.filter = number;
    this.getCubes(this.filter);
  }
}
