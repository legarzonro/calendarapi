import { Component, OnInit } from '@angular/core';

declare var gapi: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loginEnable: boolean;
  dataLoading: boolean;
  today: Date;
  timeMin: Date;
  timeMax: Date;
  events: any = [];

  /* form variables */
  newEvent: boolean;
  buttonDisabled: boolean;
  from: Date;
  until: Date;
  title: string;
  description: string;
  allday: boolean;



  constructor() {
    this.buttonDisabled = true;
    this.newEvent = false;
    this.loginEnable = true;
    gapi.load('client:auth2', this.initClient());
    this.today = new Date();
    /* current week */
    this.timeMin = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - this.today.getDay());
    this.timeMax = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - this.today.getDay() + 7);

  }

  ngOnInit() {
  }

  initClient() {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: 'AIzaSyBR_-LnMY6dZheAXBun_jQNT6VlFvGXND8',
        clientId: '894689899076-n3nao3nlru4b54105ml69fo1p2gda4oj.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar'
      });
      gapi.client.load('calendar', 'v3');
    });
  }

  async logIn() {
    const googleAuth = gapi.auth2.getAuthInstance()
    const googleUser = await googleAuth.signIn();
    this.loginEnable = false;
    this.getEvents();
  }

  async singOut() {
    const googleAuth = gapi.auth2.getAuthInstance()
    const googleUser = await googleAuth.signOut();
    this.loginEnable = true;
    this.newEvent = false;
  }

  async getEvents() {
    this.events = [];
    this.dataLoading = true;
    const events = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: this.timeMin.toISOString(),
      timeMax: this.timeMax.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime'
    });
    for (let i = 0; i < 7; i++) {
      this.events.push([]);
    }
    events.result.items.forEach(singleEvent => {
      let allDayEvent = (singleEvent.start.dateTime) ? false : true;
      let startDate = new Date((allDayEvent) ? singleEvent.start.date : singleEvent.start.dateTime);
      if (allDayEvent) {
        startDate = new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000);
      }
      let endDate = new Date(singleEvent.end.dateTime);
      let title = singleEvent.summary;
      this.events[startDate.getDay()].push({
        time: (allDayEvent) ? 'all day' : startDate.getHours() + '-' + endDate.getHours(),
        title: title
      });

    });
    this.dataLoading = false;

  }

  async insertEvent() {
    let event: any;
    if (!this.allday) {
      event = {
        'summary': this.title,
        'description': this.description,
        'start': {
          'dateTime': this.from.toISOString()
        },
        'end': {
          'dateTime': this.until.toISOString()
        }
      }
    } else {
      let year = this.from.getFullYear()
      let day = (this.from.getDate() < 10) ? '0' + this.from.getDate() : this.from.getDate();
      let month = ((this.from.getMonth() + 1) < 10) ? '0' + (this.from.getMonth() + 1) : (this.from.getMonth() + 1);
      event = {
        'summary': this.title,
        'description': this.description,
        'start': {
          'date': year + '-' + month + '-' + day
        },
        'end': {
          'date': year + '-' + month + '-' + day
        }
      }
    }
    var request = await gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    }).execute();


    this.events[this.from.getDay()].push({
      time: (this.allday) ? 'all day' : this.from.getHours() + '-' + this.until.getHours(),
      title: this.title
    });
    
    this.newEvent = false;
    this.from=null;
    this.until=null;
    this.title=null;
    this.description=null;
    this.allday=false;

  }

  formOnChange() {
    if (this.allday) {
      if (this.from == null || this.title == null) {
        this.buttonDisabled = true;
      } else {
        this.buttonDisabled = false;
        this.until = null;
      }
    } else {
      if (this.from == null || this.title == null || this.until == null) {
        this.buttonDisabled = true;
      } else {
        this.buttonDisabled = (this.from > this.until) ? true : false;
      }
    }
  }


}
