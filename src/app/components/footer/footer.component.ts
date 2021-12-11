import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})

/***
 * Footer Component
 */
export class FooterComponent implements OnInit {

  @Input() footerVariant: string;
  @Input() hideFooter: boolean;

  // Get Year
  year = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
  }

  scrollToAbout() {
    const element = document.getElementById('about');

    if (element) {
        element.scrollIntoView(); // scroll to a particular element
      }
     }
}
