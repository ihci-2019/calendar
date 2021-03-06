import React, { Component } from 'react';
import styles from './Calendar.css';
import CalendarView from './pages/CalendarView/CalendarView';
import CalendarBarView from './pages/CalendarBarView/CalendarBarView';
import configUrl from '../../config/config';
import { requestApi } from '../../util/apiCaller';
import messages from '../../config/glossary';

export class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowYearMonth: '',
      calendars: [],
      ifLogin: false,
    };
    this.requestLoginCalendar = this.requestLoginCalendar.bind(this);
    this.requestTeamMates = this.requestTeamMates.bind(this);
  }

  componentDidMount() {
    let ticket = '';
    let teamId = '';
    if (process.env.NODE_ENV === 'development') {
      if (ticket === '' && teamId === '') {
        ticket = 'ThisIsTestTicket';
        teamId = 'ThisIsTestTeamId';
      }
      this.requestLoginCalendar(ticket, teamId);
    } else {
      window.addEventListener('message', (e) => {
        const height = document.body.scrollHeight;
        top.postMessage(height, e.origin);
            // if (!e.data) {
            // TODO: 修改alert为弹出框
            // alert(messages.loginFailed);
            // }
        ticket = e.data.userId;
        teamId = e.data.teamId;
        if (ticket && teamId) {
          sessionStorage.setItem('calendarTeamId', teamId);
          sessionStorage.setItem('calendarTicket', ticket);
          sessionStorage.setItem('calendarNewLogin', 'true');
          this.requestLoginCalendar(ticket, teamId);
        }
      }, false);
      const calendarNewLogin = sessionStorage.getItem('calendarNewLogin');
      if (calendarNewLogin !== null && calendarNewLogin === 'false') {
        teamId = sessionStorage.getItem('calendarTeamId');
        ticket = sessionStorage.getItem('calendarTicket');
        sessionStorage.setItem('calendarNewLogin', 'true');
        this.requestLoginCalendar(ticket, teamId);
      }

      // Use fake info for presentation temporarily
      // ticket = 'ThisIsTestTicket';
      // teamId = 'ThisIsTestTeamId';
      // this.requestLoginCalendar(ticket, teamId);
      // console.log('WARNING: uncomment window.addEventListener in client/modules/Calendar/Calendar.js to use in production');
    }
  }

  setNowYearMonth = (time) => {
    this.setState({
      nowYearMonth: time,
    });
  };

  setCalendars = (calendars) => {
    this.setState({
      calendars,
    });
  };

  requestLoginCalendar(ticket, teamId) {
    const requestUrl = configUrl.calendarLogin;
    const data = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket,
        teamId,
      }),
    };
    requestApi(requestUrl, data, this.requestTeamMates);
  }

  requestTeamMates(result) {
    if (result.status === 200) {
      this.setState({
        ifLogin: true,
      });
      const requestUrl = configUrl.teammates;
      const data = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        }),
      };
      requestApi(requestUrl, data, this.printResult);
    } else {
      // eslint-disable-next-line no-alert
      alert(messages.loginFailed);
    }
  }

  printResult(result) {
    if (result.status === 200) {
      const teammates = result.teammates;
      let teammatesFormat = '';
      for (let i = 0; i < teammates.length; i++) {
        teammatesFormat = `${teammatesFormat + JSON.stringify(teammates[i])}-`;
      }
      localStorage.setItem('teammates', teammatesFormat);
    } else {
      // eslint-disable-next-line no-alert
      alert(messages.MemberLoadFailed);
    }
  }
  render() {
    return (
      <div className={styles.CalendarBorder} id="calendarMain">
        <CalendarView ifLogin={this.state.ifLogin} setNowYearMonth={(time) => { this.setNowYearMonth(time); }} calendars={this.state.calendars} />
        <CalendarBarView ifLogin={this.state.ifLogin} setCalendars={(calendars) => { this.setCalendars(calendars); }} nowDate={this.state.nowYearMonth} />
      </div>
    );
  }
}

export default Calendar;
