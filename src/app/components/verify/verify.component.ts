import { Component, OnInit } from '@angular/core';
import { Horrocube } from 'src/app/models/Horrocube';
import { Horrocard } from 'src/app/models/Horrocard';
import { ApiService }        from '../../api.service';
import { Router }            from '@angular/router';

@Component({
  selector: 'verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})

/***
 * Verify Component
 */
export class VerifyComponent implements OnInit {

  filter = '';
  cube: Horrocube;
  card: Horrocard;
  isLoading = false;
  verificationFailed = false;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit(): void {
  }

  searchPolicy(policy: string)
  {
    const filtered = policy.replace(/[^a-z0-9]/gi, '');

    if (filtered === null || filtered === undefined || filtered === '') {
      return;
    }

    this.filter = filtered;
    this.isLoading = true;
  }

  onSuccess(res)
  {
    console.log(res);
    this.isLoading = false;
    if (res.result === false)
    {
      this.verificationFailed = true;
      return;
    }
    this.verificationFailed = false;
    this.cube = res.horrocube;
    this.card = res.card;
  }

  goToDetail(cube)
  {
    this.api.setCurrentCube(cube);
    this.router.navigate(['/cube-details']);
  }

  goToCardDetail(card)
  {
    this.api.setCurrentCard(card);
    this.router.navigate(['/card-details']);
  }

  parseAssetName(name: string)
  {
    return name.substr(name.length - 5, name.length);
  }

  cleanCardName(name: string)
  {
    name = name.replace('Horrocard - ', '');
    name = name.split(' #')[0];
    return name;
  }
}
