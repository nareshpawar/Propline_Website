import { Component, OnInit } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-our-agents',
  templateUrl: './our-agents.component.html',
  styleUrls: ['./our-agents.component.scss']
})
export class OurAgentsComponent implements OnInit {
  public agents;
  public config: SwiperConfigInterface = {};
  constructor(public appService: AppService) { }

  ngOnInit() {
    // this.agents = this.appService.getAgents();
    this.agentListApi()
  }



  agentListApi() {
    this.appService.getAgentsList().subscribe(
      res => {
        this.agents = res['data'].map(ele =>
        { 
          return  {
            id: ele.agent_id,
            fullName: ele.agent_name,
            desc: ele.agent_desc,
            organization: ele.organisation,
            email: ele.email,
            phone: ele.contact,
            social: {
              facebook: '',
              twitter: '',
              linkedin: '',
              instagram: '',
              website: 'https://michael.blair.com'
            },
            ratingsCount: 6,
            ratingsValue: 480,
            image: ele.profile,
          }
        }
        )
      });
  }

  ngAfterViewInit() {
    this.config = {
      observer: true,
      slidesPerView: 4,
      spaceBetween: 16,
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,
      loop: false,
      preloadImages: false,
      lazy: true,
      breakpoints: {
        320: {
          slidesPerView: 1
        },
        600: {
          slidesPerView: 2
        },
        960: {
          slidesPerView: 3
        },
        1280: {
          slidesPerView: 4
        }
      }
    }
  }

}
