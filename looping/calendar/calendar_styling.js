// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '985085889150-trcvdbbir91bffcn84j4b55l4qn3s69j.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/calendar"];

/* GLOBAL VARIABLES { @globals } */
var daysList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var currentWeek = null;
var userColor = '#71EEB8';
var nonUserColor = '#DBDBDB';

/****************************
 * AUTH FUNCTIONS { @auth } *
 ****************************/ 

/*
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/*
 * Handle response from authorization server.
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    loadCalendarApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
  }
}

/*
 * Initiate auth flow in response to user clicking authorize button.
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
} 

/*
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
  gapi.client.load('calendar', 'v3', initCalendar);
}

/************************
 * WEEK CLASS { @week } *
 ************************/ 

function Week(dateInit) {
  /* 
  dateInitSample = {'month': 10, // January == 0
                    'date': 15,
                    'year': 2015
                   }
  */
  this.dateInit = dateInit;
  this.week = this.getWeek();
  this.now = this.getNow();
  this.weekMin = null;
  this.weekMax = null;
  this.setBounds();
}

Week.prototype.getWeek = function() {
  // Instantiate new date for current time of given dateInit
  var now = new Date(this.dateInit.year, this.dateInit.month, this.dateInit.date);
  var dateNow = now.getDate();
  var monthNow = now.getMonth() + 1; // January == 0
  var yearNow = now.getFullYear(); 
  var hourNow = now.getHours();
  var minNow = now.getMinutes();
  var dayInt = now.getDay(); // (0-6), Sunday == 0
  // Get first day of the week of given dateInit
  var thisSun = dateNow - dayInt;
  var week = []; // Create list of day objects for week
  for (var day = 0; day < 7; day++) {
    var jsDate = new Date(yearNow, monthNow - 1, thisSun + day);
    var newDay = new Day(jsDate);
    week.push(newDay);
  }
  return week;
}

Week.prototype.setBounds = function() {
  var sunDateStr = this.week[0].dateFullStr; // dateFullStr of Sunday of the week
  var satDateStr = this.week[this.week.length-1].dateFullStr; // dateFullStr of Saturday of the week
  this.weekMin = sunDateStr + 'T00:00:00.000Z';
  this.weekMax = satDateStr + 'T23:59:59.999Z';
}

Week.prototype.getNow = function() {
  var now = new Date();
  // Get create strings to set min and max times for week
  var sunDateStr = this.week[0].dateFullStr; // dateFullStr of Sunday of the week
  var satDateStr = this.week[this.week.length-1].dateFullStr; // dateFullStr of Saturday of the week

  var nowObj = {// 'weekMin': sunDateStr + 'T00:00:00.000Z',
                // 'weekMax': satDateStr + 'T23:59:59.999Z',
                'date': now.getDate(),
                'month': now.getMonth(),
                'year': now.getYear(),
                'day': now.getDay(),
                'dayStr': daysList[now.getDay()]
               };
  return nowObj; 
}


/***********************
 * DAY CLASS { @week } *
 ***********************/ 

function Day(jsDate) {
  this.jsDate = jsDate;
  // Call createDay() to set other class variables
  this.day = null; 
  this.dayName = null;
  this.date = null;
  this.month = null;
  this.year = null;
  this.dateLabel = null;
  this.dateFullStr = null;
  this.createDay();
}

Day.prototype.createDay = function() {
  var month = this.jsDate.getMonth() + 1; // Fix month offset, Jan == 1
  // Leading 0's formatting for strings
  var monthStr = month.toString(); 
  if (month < 10) {
    monthStr = '0'+ monthStr;
  }
  var date = this.jsDate.getDate();
  var dateStr = date.toString();
  if (date < 10) {
    dateStr = '0' + dateStr;
  }
  var year = this.jsDate.getFullYear();
  var dateFullStr = year.toString() + '-' + monthStr + '-' + dateStr;

  // Set class variables
  this.day = this.jsDate.getDay(); 
  this.dayName = daysList[this.day];
  this.date = date;
  this.month = month; // Converted by +1, Jan == 1
  this.year = year;
  this.dateLabel = '(' + monthStr + '/' + dateStr + ')';
  this.dateFullStr = dateFullStr // e.g. 2015-11-15
  /* 
  var dayObj = {'dayName': daysList[day], // e.g. 'Sun'
                'day': day,
                'date': date, // e.g. 15
                'month': month, // e.g. 11
                'year': year, // e.g. 2015
                'dateLabel': '(' + monthNow.toString() + '/' + date.toString() + ')',
                'dateStr': dateFullStr
                };
  */
}


  /********************************
   * CALENDAR CLASS { @calendar } *
   ********************************/ 

  function Calendar(week) {
    // Constructor
    this.group = null;
    this.members = [];
    this.twelveHour = true;
    // TODO: Calculate current week in this format
    this.week = week;
    // console.error('WEEK:', this.week);
    // console.error(this.week.week);
    this.now = week.now; // TODO
    this.clearCalendar();
    // this.createCalendar();
  }

  /*
   * Create HTML code body for calendar object as a table
   * @return {Object} table element 
   */
  Calendar.prototype.createCalendar = function() {
    // Fill in day labels with dates
    for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
      var dayId = 'day' + dayIndex; 
      var dayTd = document.getElementById(dayId);
      var dayLabelText = this.week.week[dayIndex].dayName + ' ' + this.week.week[dayIndex].dateLabel;
      // console.log(this.week.week[dayIndex].dayName, this.week.week[dayIndex].dateLabel);
      var dayLabelTextNode = document.createTextNode(dayLabelText);
      dayTd.appendChild(dayLabelTextNode);
    }
    var table = document.getElementById('calEvents');
    for (var hour = 0; hour < 24; hour++) {
      // Create new row per hour
      var newRow = document.createElement('tr');
      table.appendChild(newRow);
      // Create first column for time markers
      var newHour = document.createElement('td');
      // TODO: Make this an option
      if (this.twelveHour) {
        var hourStr = this.twelveHourMarker(hour);
      } else {
        var hourStr = hour.toString(); 
      }
      var hourText = document.createTextNode(hourStr);
      newHour.appendChild(hourText);
      newHour.setAttribute('id', 'hour' + hour.toString); // td#hour0 range(0-23)
      newHour.setAttribute('class', 'hourMarker'); // td.hourMarker
      newRow.appendChild(newHour);
      for (var day = 0; day < 7; day++) {
        // Create an hour cell for each day of the week
        var newHour = document.createElement('td');
        var hourId = this.week.week[day].dateFullStr + "T" + hour.toString(); // yyyy-mm-ddThh (variable width for hour)
        // console.log('HOURID:', hourId);
        newHour.setAttribute('id', hourId); // td#2015-11-20T0
        newHour.setAttribute('class', 'hourSlot'); // td.hourSlot
        newRow.appendChild(newHour);
      }
    }
    // this.getEvents();
    return table;
  }

  /* 
  Calendar.prototype.getEvents = function() {
    var timeMin = this.week.weekMin; 
    var timeMax = this.week.weekMax;
    var request = gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': timeMin,
      'timeMax': timeMax,
      'showDeleted': false, 
      'singleEvents': true,
    });
    var eventsList = [];
    request.execute(function(resp) {
      var events = resp.items;
      // console.error(resp.items);
      if (events.length > 0) {
        for (var eventIndex = 0; eventIndex < events.length; eventIndex++) {
          var event = new Event(events[eventIndex]);
          event.color = userColor;
          eventsList.push(event.createEvent());
        }
      }
    });
    this.getOtherEvents();
  }
  */

  Calendar.prototype.getEvents = function() {
    var timeMin = this.week.weekMin; 
    var timeMax = this.week.weekMax;
    var requestsList = [];
    for (var memberIndex = 0; memberIndex < membersList.length; memberIndex++) {
      var member = membersList[memberIndex];
      var memberEmail = member['email'];

      var request = gapi.client.calendar.events.list({
        'calendarId': memberEmail,
        'alwaysIncludeEmail': true,
        'timeMin': timeMin,
        'timeMax': timeMax,
        'showDeleted': false, 
        'singleEvents': true,
        'customEmail': memberEmail, // Super hacky work around to pass email of 
                                    // calendar from which this was pulled
      });

      requestsList.push(request);
      var count = 0
      request.execute(function(resp) {
        var events = resp.items;
        // Batch request sends all calendar info at once 
        // Must get member email from response 
        /*
        var memberEmail = resp.summary;
        console.log(memberEmail);
        */
        if (events.length > 0) {
          var eventsList = []; 
          var requestFromList = requestsList[count];
          var memberEmail = requestFromList.po.po.params.customEmail;

          for (var eventIndex = 0; eventIndex < events.length; eventIndex++) {
            var event = new Event(events[eventIndex]);
            var member = getMemberWithEmail(event.calendar.email);
            eventsList.push(event.createEvent());
            /*
            if (memberEmail == user['email']) {
              // event.color = userColor;
              eventsList.push(event.createEvent());
            } else {
              // event.color = nonUserColor;
              eventsList.push(event.createOthersEvent());
            }
            */
            member['events'] = eventsList;
          }
        }
        count += 1;
      });
      console.log(membersList);
    }
  }

  Calendar.prototype.clearCalendar = function() { // Delete and create new table rows
    // Delete and create new day labels (calLabelsRow)
    var calLabelsTr = document.getElementById('calLabelsRow');
    for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
      var dayId = 'day' + dayIndex; // e.g. day0
      $('#' + dayId).remove();
      var dayTd = document.createElement('td');
      dayTd.setAttribute('id', dayId);
      // Set class labels for styling
      if ((dayIndex == 0) || (dayIndex == 6)) {
        var dayClass = 'weekendTitle';
      } else {
        var dayClass = 'weekdayTitle';
      }
      dayTd.setAttribute('class', dayClass);
      calLabelsTr.appendChild(dayTd);
    }

    // Delete and create new calendar table (calEvents)
    $('#calEvents').remove();
    var newCal = document.createElement('table');
    newCal.setAttribute('id', 'calEvents');
    var container = document.getElementById('calEventsContainer');
    container.appendChild(newCal);
    this.createCalendar();
  }

/*
 * Returns a string for an hour marker in 12-hour format 
 * @param {int} 24-hour integer (0-23)
 * @return {string} 12-hour marker string (e.g. 12p)
 */
Calendar.prototype.twelveHourMarker = function(twentyFourHour) {
  var twelveHour = (twentyFourHour % 12)
  if (twelveHour == 0) {
    twelveHour = 12;
  }
  // Convert to string and add am or pm 
  var hourMarkerStr = twelveHour.toString();
  if (twentyFourHour < 12) {
    hourMarkerStr += 'a';
  } else {
    hourMarkerStr += 'p';
  }
  return hourMarkerStr;
}  

/* 
Calendar.prototype.getEvents = function() {
  console.error('calendar.getEvents()');
  var request = gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': this.now.weekMin,
    // 'timeMin': '2015-11-15T03:00:00.000Z',
    'maxResults': 20,
    'showDeleted': false, 
    'singleEvents': true,
  });
  console.log('test');

  request.execute(function(resp) {
    var events = resp.items;
    console.error(resp.items);
    if (events.length > 0) {
      for (var eventIndex = 0; eventIndex < events.length; eventIndex++) {
        var event = new Event(events[eventIndex]);
        event.createEvent();
      }
    }
  });
}
*/


/**************************
 * EVENT CLASS { @event } *
 **************************/ 

function Event(gEvent) {
  this.calendar = gEvent.creator;
  this.name = gEvent.summary;
  this.start = this.interpDateTimeObj(gEvent.start);
  this.end = this.interpDateTimeObj(gEvent.end);
  // this.color = "#71EEB8" // TODO: Make this legit based on gEvent color
  if (this.calendar.email == user['email']) {
    this.className = 'event';
  } else {
    this.className = 'eventOther';
  }
  this.id = gEvent.id;
}

Event.prototype.interpDateTimeObj = function(dateTimeObj) {
  // console.error('event.interpDateTimeObj()');
  var dateTime = dateTimeObj.dateTime; // e.g. "2015-11-16T06:20:00-05:00"
  if (!dateTime) {
    return false; // TODO: Deal with this eventually (All day event)
  }
  var timeZone = dateTimeObj.timeZone; // e.g. "America/New_York"
  var year = parseInt(dateTime.substring(0, 4));
  var month = parseInt(dateTime.substring(5, 7));
  var date = parseInt(dateTime.substring(8, 10));
  var hour = parseInt(dateTime.substring(11, 13));
  var min = parseInt(dateTime.substring(14, 16));
  var dateHourId = dateTime.substring(0, 10) + 'T' + hour.toString(); 
  var time = {'dateHourId': dateHourId,
              'year': year,
              'month': month,
              'date': date,
              'hour': hour, 
              'min': min,
              'timeZone': timeZone 
             }
  return time;
}

// TODO: Make divs share space

Event.prototype.createEvent = function() {
  if (!this.start) {
    return false; // TODO: Deal with this eventually too
  }
  // Find starting unique dateHour cell
  var startTd = document.getElementById(this.start.dateHourId);
  var eventDiv = document.createElement('div');
  eventDiv.setAttribute('id', this.start.dateHourId);
  eventDiv.setAttribute('id', this.id);
  eventDiv.setAttribute('class', this.className);
  var hourElementHeight = $('.hourSlot').height() + 4;
  // Calculate event div height
  var startMinApprox = this.roundToNearest15(this.start.min);
  var endMinApprox = this.roundToNearest15(this.end.min);
  var startMinHeight = ((60-startMinApprox) / 60) * hourElementHeight; 
  var endMinHeight = (endMinApprox / 60) * hourElementHeight;
  var fullHourHeight = (this.end.hour - (this.start.hour + 1)) * hourElementHeight; 
  var eventDivHeight = startMinHeight + fullHourHeight + endMinHeight;
  var top = (startMinApprox / 60) * hourElementHeight;
  eventDiv.style.height = eventDivHeight.toString() + 'px';
  eventDiv.style.top = top.toString() + 'px';
  eventDiv.style.backgroundColor = this.color;

  // Pull and create event title 
  var eventName = document.createTextNode(this.name);
  var eventNameWrapper = document.createElement('div');
  eventNameWrapper.setAttribute('class', 'eventName');
  eventNameWrapper.appendChild(eventName);
  eventDiv.appendChild(eventNameWrapper);
  // Pull and create event start time
  var eventStart = document.createTextNode(this.twelveHourString(this.start));
  var eventStartWrapper = document.createElement('div');
  eventStartWrapper.setAttribute('class', 'eventStart');
  eventStartWrapper.appendChild(eventStart);
  eventDiv.appendChild(eventStartWrapper);

  // Add event listener to event div
  eventClickHandler(eventDiv);
  startTd.appendChild(eventDiv);
  return this
}

/*
Event.prototype.createOthersEvent = function() {
  if (!this.start) {
    return false; // TODO: Deal with this eventually too
  }
  // Find starting unique dateHour cell
  var startTd = document.getElementById(this.start.dateHourId);
  var eventDiv = document.createElement('div');
  eventDiv.setAttribute('id', this.start.dateHourId);
  eventDiv.setAttribute('id', this.id);
  eventDiv.setAttribute('class', 'eventOther');
  var hourElementHeight = $('.hourSlot').height();
  // Calculate event div height
  var startMinApprox = this.roundToNearest15(this.start.min);
  var endMinApprox = this.roundToNearest15(this.end.min);
  var startMinHeight = ((60-startMinApprox) / 60) * hourElementHeight; 
  var endMinHeight = (endMinApprox / 60) * hourElementHeight;
  var fullHourHeight = (this.end.hour - (this.start.hour + 1)) * hourElementHeight; 
  var eventDivHeight = startMinHeight + fullHourHeight + endMinHeight;
  var top = (startMinApprox / 60) * hourElementHeight;
  eventDiv.style.height = eventDivHeight.toString() + 'px';
  eventDiv.style.top = top.toString() + 'px';
  eventDiv.style.backgroundColor = this.color;

  // Pull and create event title 
  var eventName = document.createTextNode(this.name);
  var eventNameWrapper = document.createElement('div');
  eventNameWrapper.setAttribute('class', 'eventName');
  eventNameWrapper.appendChild(eventName);
  eventDiv.appendChild(eventNameWrapper);
  // Pull and create event start time
  var eventStart = document.createTextNode(this.twelveHourString(this.start));
  var eventStartWrapper = document.createElement('div');
  eventStartWrapper.setAttribute('class', 'eventStart');
  eventStartWrapper.appendChild(eventStart);
  eventDiv.appendChild(eventStartWrapper);

  // Add event listener to event div
  eventClickHandler(eventDiv);
  startTd.appendChild(eventDiv);
  return this
}   
*/

Event.prototype.roundToNearest15 = function(min) {
  if (min <= 12) {
    return 0;
  } else if (min <= 17) {
    return 15;
  } else if (min <= 42) {
    return 30;
  } else if (min <= 57) {
    return 45;
  } else {
    return 60;
  }
}

/*
 * Returns a string for an hour marker in 12-hour format 
 * @param {int} 24-hour integer (0-23)
 * @return {string} 12-hour marker string (e.g. 12p)
 */
Event.prototype.twelveHourString = function(timeObj) {
  var twelveHour = (timeObj.hour % 12)
  if (twelveHour == 0) {
    twelveHour = 12;
  }
  // Convert to string and add am or pm 
  var timeStr = twelveHour.toString() + ':' + timeObj.min.toString();
  if (timeObj.hour < 12) {
    timeStr += 'a';
  } else {
    timeStr += 'p';
  }
  return timeStr;
}  


/*******************************
 * GROUP EVENT { @groupEvent } *
 *******************************/ 

function GroupEvent() {
  // this.calendar = gEvent.creator;
  this.name = null;
  this.start = null;
  this.end = null;
  this.id = null;
  this.participants = [user]; // Include user as default
                              // Array of member objects
}

GroupEvent.prototype.planGroupEvent = function() {
  // console.log('planGroupEvent');
  var panel = document.createElement('div');
  panel.setAttribute('id', 'planGroupEventPanel');
  var calendarContainer = document.getElementById('calendarContainer');
  // Fix width of calendar container to what it was originally before appending 
  // panel to the container
  var calContWidth = calendarContainer.offsetWidth;
  calendarContainer.style.width = calContWidth + 'px';
  // Calculate width of panel to be a portion of calendar container
  var panelWidth = parseInt(calContWidth) * 0.30; 
  panel.style.width = panelWidth.toString() + 'px';
  calendarContainer.appendChild(panel);

  // Create layout for inputs
  var header = document.createElement('div');
  header.setAttribute('id', 'groupEventHeader');
  panel.appendChild(header);
  var headerText = document.createTextNode('Schedule a group event');
  header.appendChild(headerText);

  // Input field for event title
  var inputTitleContainer = document.createElement('div');
  panel.appendChild(inputTitleContainer);
  inputTitleContainer.setAttribute('id', 'groupEventInputTitleCont');
  inputTitleContainer.setAttribute('class', 'groupEventInput');
  var inputTitle = document.createElement('input');
  inputTitleContainer.appendChild(inputTitle);
  inputTitle.setAttribute('type', 'text');
  inputTitle.setAttribute('placeholder', 'Group event title');
  inputTitle.setAttribute('class', 'groupEventInput');
  inputTitle.setAttribute('id', 'groupEventInputTitle');

  // Input field for participating members
  var participantsTitle = document.createElement('div');
  panel.appendChild(participantsTitle);
  var participantsText = document.createTextNode('Participating members:');
  participantsTitle.appendChild(participantsText);
  participantsTitle.setAttribute('id', 'participantsTitle');
  var inputParticipantsContainer = document.createElement('div');
  panel.appendChild(inputParticipantsContainer);
  inputParticipantsContainer.setAttribute('class', 'groupEventInput');
  for (var memberIndex = 0; memberIndex < membersList.length; memberIndex++) {
    var member = membersList[memberIndex];
    var memberValue = member['fname'] + member['lname'];
    var memberName = member['fname'] + ' ' + member['lname'];
    var inputParticipantDiv = document.createElement('div');
    inputParticipantsContainer.appendChild(inputParticipantDiv);
    var inputParticipant = document.createElement('input');
    inputParticipantDiv.appendChild(inputParticipant);
    inputParticipant.setAttribute('id', member['email']);
    inputParticipant.setAttribute('type', 'checkbox');
    inputParticipant.setAttribute('value', memberValue);
    if (member == user) { // Automatically include user as participant
      inputParticipant.setAttribute('checked', 'checked'); // TODO
      // inputParticipant.checked = true;
    }
    var memberText = document.createTextNode(memberName);
    inputParticipantDiv.appendChild(memberText);
  }

  // Input field for duration 
  var inputDurationContainer = document.createElement('div');
  panel.appendChild(inputDurationContainer);
  inputDurationContainer.setAttribute('class', 'groupEventInput');
  var inputDurationTitle = document.createElement('div');
  inputDurationContainer.appendChild(inputDurationTitle);
  var inputDurationText = document.createTextNode('Minimum duration:');
  inputDurationTitle.appendChild(inputDurationText);
  var inputDuration = document.createElement('input');
  inputDurationContainer.appendChild(inputDuration);
  inputDuration.setAttribute('type', 'text');
  inputDuration.setAttribute('value', .25);
  inputDuration.setAttribute('placeholder', 'hours');

  // Input field for time window
  var inputTimeWindowContainer = document.createElement('div');
  panel.appendChild(inputTimeWindowContainer);
  inputTimeWindowContainer.setAttribute('class', 'groupEventInput');
  var inputTimeWindowTitle = document.createElement('div');
  inputTimeWindowContainer.appendChild(inputTimeWindowTitle);
  var inputTimeWindowText = document.createTextNode('Sometime between:');
  inputTimeWindowTitle.appendChild(inputTimeWindowText);
  var inputTimeWindowMin = document.createElement('input');
  inputTimeWindowContainer.appendChild(inputTimeWindowMin);
  inputTimeWindowMin.setAttribute('type', 'date');
  var inputTimeWindowMax = document.createElement('input');
  inputTimeWindowContainer.appendChild(inputTimeWindowMax);
  inputTimeWindowMax.setAttribute('type', 'date');

  // Input field apply button 
  var inputApplyContainer = document.createElement('div');
  panel.appendChild(inputTimeWindowContainer);
  inputTimeWindowContainer.setAttribute('class', 'groupEventInput');
  var inputApply = document.createElement('button');
  inputTimeWindowContainer.appendChild(inputApply);
  inputApply.setAttribute('type', 'button');

  // Get all current values
  var self = this;
  inputApply.addEventListener('click', function() {
    // console.log('Participants');
    var participants = [];
    for (var memberIndex = 0; memberIndex < membersList.length; memberIndex++) {
      var member = membersList[memberIndex];
      var title = document.getElementById('groupEventInputTitle').value;
      var participating = document.getElementById(member.email).checked;
      console.log('participating:', participating);
      if (participating) {
        participants.push(member);
      }
    }
    var duration = inputDuration.value; // Min duration value
    var timeWindowMin = inputTimeWindowMin.value; // Min time window value
    var timeWindowMax = inputTimeWindowMax.value; // Max time window value
    var datesList = self.getDates(timeWindowMin, timeWindowMax); 
    console.log(datesList);
    var params = { 'title': title,
                   'participants': participants,
                   'duration': duration,
                   'timeWindowMin': timeWindowMin,
                   'timeWindowMax': timeWindowMax,
                   'datesList': datesList,
                 };
    // temp(durationMin, durationMax, timeWindowMin, timeWindowMax, participants);
    self.createGhostEvents(params);
  });
  var inputApplyText = document.createTextNode('Apply');
  inputApply.appendChild(inputApplyText);
}

GroupEvent.prototype.getDates = function(timeWindowMin, timeWindowMax) {
  var minDate = parseInt(timeWindowMin.substring(8,10));
  var maxDate = parseInt(timeWindowMax.substring(8,10));
  console.log('min and max dates:', minDate, '-', maxDate);
  var minYear = parseInt(timeWindowMin.substring(0,4));
  var maxYear = parseInt(timeWindowMax.substring(0,4));
  var minMonth = parseInt(timeWindowMin.substring(5,7))-1;
  var maxMonth = parseInt(timeWindowMax.substring(5,7))-1;
  console.log('min and max months:', minMonth, '-', maxMonth);
  var min = new Date(minYear, minMonth, minDate);
  var max = new Date(maxYear, maxMonth, maxDate);
  console.log('min and max objects:', min, '-', max);
  var datesList = [];
  while (min <= max) {
    console.log('while loop');
    var dateYear = min.getFullYear();
    var dateMonth = min.getMonth() + 1;
    var dateDate = min.getDate();
    // Format fixed width digits
    if (dateMonth < 10) {
      var dateMonthStr = '0' + dateMonth.toString(); 
    } else {
      var dateMonthStr = dateMonth.toString();
    }
    if (dateDate < 10) {
      var dateDateStr = '0' + dateDate.toString();
    } else {
      var dateDateStr = dateDate.toString();
    }
    var dateString = dateYear.toString() + '-' + dateMonthStr + '-' + dateDateStr;
    var date = { 'dateString': dateString, 
                 'date': dateDate, 
                 'month': dateMonth, 
                 'year': dateYear, 
               }
    datesList.push(date);
    minDate += 1; 
    min = new Date(minYear, minMonth, minDate);
  }
  console.log('datesList:', datesList);
  return datesList;
}

GroupEvent.prototype.getParticipantEvents = function(participants) {
  var events = [];
  for (var partIndex = 0; partIndex < participants.length; partIndex++) {
    var participant = participants[partIndex];
    for (var eventIndex = 0; eventIndex < participant.events.length; eventIndex++) {
      var event = participant.events[eventIndex];
      console.log('event in participant obj:', event);
      events.push(event);
    }
  }
  return events;
}

GroupEvent.prototype.sortParticipantEvents = function(events) {
  var eventsOrdered = [];
  while (events.length > 0) { // Find earliest event still in the list
    var earliest = events[0];
    // Skip deleted events
    if (earliest.start == undefined) { 
      var earliestIndex = events.indexOf(earliest)
      events.splice(earliestIndex, 1);
      continue; 
    }
    for (var eventIndex = 1; eventIndex < events.length; eventIndex++) {
      var event = events[eventIndex];
      // Skip deleted events
      if (event.start == undefined) { 
        continue; 
      }
      /*
      console.log('earliest | month:', earliest.start.month, 'date:', earliest.start.date);
      console.log('month:', event.start.month, 'date:', event.start.date);
      console.log('earliest | hour:', earliest.start.hour, 'min:', earliest.start.min);
      console.log('hour:', event.start.hour, 'min:', event.start.min);
      */
      if (event.start.year < earliest.start.year) {
        earliest = event; 
        continue; 
      } 

      if (event.start.month < earliest.start.month) {
        // console.log('month');
        earliest = event; 
        // console.error(earliest);
        continue;
      } else if (event.start.month > earliest.start.month) {
        continue;
      }
      if (event.start.date < earliest.start.date) {
        // console.log('date');
        earliest = event;
        // console.error(earliest);
        continue;
      } else if (event.start.date > earliest.start.date) {
        continue;
      }
      if (event.start.hour < earliest.start.hour) {
        // console.log('hour');
        earliest = event;
        // console.error(earliest);
        continue;
      } else if (event.start.hour > earliest.start.hour) {
        continue;
      }
      if (event.start.minute < earliest.start.minute) {
        // console.log('min');
        earliest = event;
        // console.error(earliest);
        continue;
      } else if (event.start.minute > earliest.start.minute) {
        continue;
      }

      // console.log('~~~~~~~~~~~~~~~~~~');
    }
    var earliestIndex = events.indexOf(earliest)
    events.splice(earliestIndex, 1);
    eventsOrdered.push(earliest);
  }
  return eventsOrdered;
}

GroupEvent.prototype.mergeEvents = function(events) {
  // Make a deep copy to avoid circular object references
  var eventsCopy = [];
  for (var eventIndex = 0; eventIndex < events.length; eventIndex++) {
    var event = events[eventIndex];
    var eventCopy = {};
    for (var attr in event) {
      eventCopy[attr] = event[attr];
    }
    eventsCopy.push(eventCopy);
  }
  var mergedEvents = [];
  var eventIndex = 0;
  while (eventIndex < eventsCopy.length-1) {
    var event = eventsCopy[eventIndex];
    var eventEnd = new Date(event.end.year, event.end.month-1, event.end.date, 
                            event.end.hour, event.end.min);
    var nextEvent = eventsCopy[eventIndex+1];
    var nextEventStart = new Date(nextEvent.start.year, nextEvent.start.month-1, nextEvent.start.date,
                                nextEvent.start.hour, nextEvent.start.min);
    while ((eventIndex < eventsCopy.length-1) && (nextEventStart <= eventEnd)) {
      event.name += (' / ' + nextEvent.name);
      event.end = nextEvent.end; 
      var eventEnd = new Date(event.end.year, event.end.month-1, event.end.date, 
                              event.end.hour, event.end.min);
      eventIndex += 1; 
      var nextEvent = eventsCopy[eventIndex+1]; 
      var nextEventStart = new Date(nextEvent.start.year, nextEvent.start.month-1, nextEvent.start.date,
                                    nextEvent.start.hour, nextEvent.start.min);
    }
    mergedEvents.push(event);
    eventIndex += 1;
  }
  return mergedEvents;
}

GroupEvent.prototype.createGhostEvents = function(params) {
  var dates = params.datesList;
  console.log(params.datesList);
  var participants = params.participants;
  // Get all existing events from all participant calendars
  var eventsUnsorted = this.getParticipantEvents(participants);

  // Make a deep copy to avoid circular object references
  var eventsUnsortedCopy = [];
  for (var eventIndex = 0; eventIndex < eventsUnsorted.length; eventIndex++) {
    var event = eventsUnsorted[eventIndex];
    var eventCopy = {};
    for (var attr in event) {
      eventCopy[attr] = event[attr];
    }
    eventsUnsortedCopy.push(eventCopy);
  }

  var eventsSorted = this.sortParticipantEvents(eventsUnsortedCopy);
  console.log('events(sorted):', eventsSorted);
  var events = this.mergeEvents(eventsSorted);
  console.log('events(merged):', events);

  var eventIndex = 0;
  // By date columns
  for (var dateIndex = 0; dateIndex < dates.length; dateIndex++) {
    var date = dates[dateIndex];
    var start = { 'dateHourId': date.dateString + 'T0',
                  'min': 0, 
                  'hour': 0,
                  'date': date.date,
                  'month': date.month,
                  'year': date.year,
                }
    var end = { 'dateHourId': date.dateString + 'T23',
                'min': 59, 
                'hour': 23,
                'date': date.date, 
                'month': date.month,
                'year': date.year,
              }

    // Within each date, create ghost events between participant events
    var event = events[eventIndex];

    // while ((event.date == date.date) && (event.month == date.month) && (event.year == date.year)) {
    while ((start.date == date.date) && (start.month == date.month) && (start.year == date.year)) {
      // Get next event and set ghost event end to event start 
      var event = events[eventIndex];
      console.error('EVENT', event);

      // Check if the start of the next event is the next day
      if ((event.start.date != date.date) || (event.start.month != date.month) 
          || (event.start.year != date.year)) {
        end.dateHourId = date.dateString + 'T23';
        end.min = 59; 
        end.hour = 23;
      } else {
        end = event.start;
      }
      console.log('event', event);
      console.log('date', date);

      // Calculate length of ghost event 
      console.log('hour', start.hour, 'min', start.min);
      var startHour = start.hour + (start.min / 60); 
      var endHour = end.hour + (end.min / 60);
      var lengthHour = endHour - startHour; 
      console.log('endHour', endHour, 'startHour', startHour);
      console.log('lengthHour', lengthHour);
      if (lengthHour < params.duration) {
        console.log('> does not meet duration min');
        start = event.end;
        eventIndex += 1;
        continue;
      }

      // Get date hour id
      var startTd = document.getElementById(date.dateString + 'T' + start.hour);
      var eventDiv = document.createElement('div');
      eventDiv.setAttribute('class', 'ghostEvent');
      var hourElementHeight = $('.hourSlot').height() + 4;

      // Calculate event div height 
      console.log('~~~~~~~~~~~~~~~');
      var startMinApprox = roundToNearest15(start.min);
      console.error('startMinApprox', startMinApprox);
      var endMinApprox = roundToNearest15(end.min);
      console.error('endMinApprox', endMinApprox);
      var startMinHeight = ((60-startMinApprox) / 60) * hourElementHeight;
      console.error(60-startMinApprox);
      var endMinHeight = (endMinApprox / 60) * hourElementHeight;
      var fullHourHeight = (end.hour - (start.hour + 1)) * hourElementHeight;
      var eventDivHeight = startMinHeight + fullHourHeight + endMinHeight; 
      var top = (startMinApprox / 60) * hourElementHeight; 
      // Apply div height and styles
      eventDiv.style.height = eventDivHeight.toString() + 'px';
      eventDiv.style.top = top.toString() + 'px';

      // Pull and create event title 
      var eventTitle = document.createTextNode(params.title);
      var eventTitleWrapper = document.createElement('div');
      eventTitleWrapper.setAttribute('class', 'eventName');
      eventTitleWrapper.appendChild(eventTitle);
      eventDiv.appendChild(eventTitleWrapper);

      // Pull and create event start time
      // TODO
      var eventStart = document.createTextNode(twelveHourString(start));
      var eventEnd = document.createTextNode(twelveHourString(end));
      var eventStartWrapper = document.createElement('div');
      eventStartWrapper.setAttribute('class', 'eventStart');
      eventStartWrapper.appendChild(eventStart);
      eventStartWrapper.appendChild(eventEnd);
      eventDiv.appendChild(eventStartWrapper);

      // Set event end time to new start time of next ghost event
      start = event.end;
      eventIndex += 1;

      startTd.appendChild(eventDiv);
    }
    console.log('MOVE TO NEXT DATE');
  }
}    


/****************************************
 * INPUT HANDLERS { @inputHandlers } *
 ****************************************/ 

function addEventHandler() {  
  var window = document.createElement('div');
  window.setAttribute('id', 'addEventWindow');
  // Create form for input elements
  var createEventForm = document.createElement('form');
  createEventForm.setAttribute('id', 'createEventForm');
  // createEventForm.setAttribute('action', 'inputRetrieval.py');

  // Create and format input field for Title 
  var inputTitle = document.createElement('input');
  inputTitle.setAttribute('type', 'text');
  inputTitle.setAttribute('placeholder', 'Event title');
  inputTitle.setAttribute('class', 'eventInputField');
  inputTitle.setAttribute('id', 'eventInputTitle');

  // Create and format input field for StartDate
  var inputStartDate = document.createElement('input');
  inputStartDate.setAttribute('type', 'date');
  inputStartDate.setAttribute('class', 'eventInputField');
  inputStartDate.setAttribute('id', 'eventInputStartDate');
  var today = new Date(); 
  inputStartDate.setAttribute('value', today);

  // Create and format input field for StartTime
  var inputStartTime = document.createElement('input');
  inputStartTime.setAttribute('type', 'time');
  inputStartTime.setAttribute('placeholder', 'Start time');
  inputStartTime.setAttribute('class', 'eventInputField');
  inputStartTime.setAttribute('id', 'eventInputStartTime');

  // Create and format input field for EndDate
  var inputEndDate = document.createElement('input');
  inputEndDate.setAttribute('type', 'date');
  inputEndDate.setAttribute('class', 'eventInputField');
  inputEndDate.setAttribute('id', 'eventInputEndDate');

  // Create and format input field for EndTime
  var inputEndTime = document.createElement('input');
  inputEndTime.setAttribute('type', 'time');
  inputEndTime.setAttribute('placeholder', 'End time');
  inputEndTime.setAttribute('class', 'eventInputField');
  inputEndTime.setAttribute('id', 'eventInputEndTime');

  // Create and format input selector for Calendars
  var inputCals = document.createElement('select');
  var optionTest = document.createElement('option');
  var testText = document.createTextNode('test@gmail.com');
  optionTest.appendChild(testText);
  inputCals.appendChild(optionTest);
  var inputCalsContainer = document.createElement('div');
  inputCalsContainer.appendChild(inputCals);
  inputCals.setAttribute('id', 'eventInputCals');
  inputCalsContainer.setAttribute('id', 'eventInputCalsCont');

  // Create and format create button
  /*
  var createEventButton = document.createElement('input');
  createEventButton.setAttribute('type', 'submit');
  createEventButton.setAttribute('value', 'Create event');
  */
  var createEventButton = document.createElement('button');
  createEventButton.setAttribute('onclick', 'testSerialize()');
  createEventButton.setAttribute('type', 'button'); // To prevent auto submission
  var createTextNode = document.createTextNode('Create event');
  createEventButton.appendChild(createTextNode);

  // Append all input elements to window
  // TODO: FIX THIS SHIT
  var temp = createEventForm; 
  temp.appendChild(inputTitle);
  temp.appendChild(inputStartDate);
  temp.appendChild(inputStartTime);
  temp.appendChild(inputEndDate);
  temp.appendChild(inputEndTime);
  temp.appendChild(inputCalsContainer);
  temp.appendChild(createEventButton);
  window.appendChild(createEventForm);
  var calContainerElement = document.getElementById('calendarContainer');
  calContainerElement.appendChild(window);
}

function eventClickHandler(eventElement) {
  eventElement.addEventListener('click', function() {
    eventClickAction(this);
  }); 
}

function eventClickAction(elementClicked) {
  /*
  elementClicked.style.backgroundColor = '#19235D';
  elementClicked.style.color = 'white';
  */
  elementClicked.removeAttribute('class');
  elementClicked.setAttribute('class', 'eventSelected');
  console.log('class should be only eventSelected:', elementClicked);

  // Popup window
  var eventEditWindow = document.createElement('div');
  eventEditWindow.setAttribute('class', 'eventEditWindow');
  var childrenClass = 'eventEditChild'; // Designate class string for all child 
                                        // elements of event edit window
  var eventNameElement = elementClicked.getElementsByClassName('eventName')[0];
  var eventStartElement = elementClicked.getElementsByClassName('eventStart')[0];
  // Set event title
  var eventTitleString = eventNameElement.innerHTML;
  var eventStartString = eventStartElement.innerHTML;
  var eventTitle = document.createTextNode(eventTitleString);
  var eventTitleDiv = document.createElement('div');
  eventTitleDiv.appendChild(eventTitle);
  var eventStart = document.createTextNode(eventStartString);
  var eventStartDiv = document.createElement('div');
  eventStartDiv.appendChild(eventStart);
  eventEditWindow.appendChild(eventTitleDiv);
  eventEditWindow.appendChild(eventStartDiv);

  // Buttons wrapper
  var eventButtonsWrapper = document.createElement('div');
  eventButtonsWrapper.setAttribute('class', childrenClass);
  eventEditWindow.appendChild(eventButtonsWrapper);

  // Create and set cancel button 
  var eventCancelButton = document.createElement('button');
  eventCancelButton.style.float = 'left';
  eventCancelButton.setAttribute('type', 'button');
  eventCancelButton.addEventListener('click', function(event) {
    removeEditEventWindow(elementClicked);
    event.preventDefault();
  });
  var cancelText = document.createTextNode('Cancel');
  eventCancelButton.appendChild(cancelText);
  eventButtonsWrapper.appendChild(eventCancelButton);

  // Create and set delete button 
  var eventDeleteButton = document.createElement('button');
  eventDeleteButton.style.float = 'right';
  eventDeleteButton.setAttribute('type', 'button');
  eventDeleteButton.addEventListener('click', function(event) {
    deleteEvent(elementClicked);
    event.preventDefault();
  });
  var deleteText = document.createTextNode('Delete');
  eventDeleteButton.appendChild(deleteText);
  eventButtonsWrapper.appendChild(eventDeleteButton);

  // Append the whole window to calendar container

  var calContainerElement = document.getElementById('calendarContainer');
  calContainerElement.appendChild(eventEditWindow);

  /*
  console.log('eventClickAction()');
  var element = document.createElement('div');
  var textNode = document.createTextNode('TEST');
  element.appendChild(textNode);
  document.body.appendChild(element);
  */
}

function removeEditEventWindow(selectedElement) {
  $('.eventEditWindow').remove(); // Remove edit popup window 
  selectedElement.setAttribute('class', 'event'); // Unhighlight selected
                                                            // element
  // ^ That should be an id but whatever. 
}

function deleteEvent(selectedElement) {
  var request = gapi.client.calendar.events.delete({
    'calendarId': 'primary',
    'eventId': selectedElement.id,
  });
  request.execute(function(resp) {
    console.log(resp);
    $('#' + selectedElement.id).remove();
  })
  removeEditEventWindow(selectedElement);
}

function groupEventHandler() {
  var groupEvent = new GroupEvent(); 
  groupEvent.planGroupEvent();
}


/****************************************
 * OTHER GENERAL FUNCTIONS { @general } *
 ****************************************/ 

function initCalendar() {
  var today = new Date();
  var todayObj = {'year': today.getFullYear(),
                  'date': today.getDate(),
                  'month': today.getMonth()
                 }
  var thisWeek = new Week(todayObj); 
  currentWeek = thisWeek;
  var cal = new Calendar(thisWeek);
  cal.getEvents();
}

function roundToNearest15(min) {
  if (min <= 12) {
    return 0;
  } else if (min <= 17) {
    return 15;
  } else if (min <= 42) {
    return 30;
  } else if (min <= 57) {
    return 45;
  } else {
    return 60;
  }
}

/*
 * Returns a string for an hour marker in 12-hour format 
 * @param {int} 24-hour integer (0-23)
 * @return {string} 12-hour marker string (e.g. 12p)
 */
function twelveHourString(timeObj) {
  var twelveHour = (timeObj.hour % 12)
  if (twelveHour == 0) {
    twelveHour = 12;
  }
  // Convert to string and add am or pm 
  var timeStr = twelveHour.toString() + ':' + timeObj.min.toString();
  if (timeObj.hour < 12) {
    timeStr += 'a';
  } else {
    timeStr += 'p';
  }
  return timeStr;
}  

function handlePrevNav() {
  /*
  var now = new Date(); 
  var prevWeekNow = {'year': now.getFullYear(),
                     'month': now.getMonth(),
                     'date': now.getDate() - 7,
                    };
  */
  // var prevWeek = getPrevWeek(currentWeek);
  var prevWeekParam = {'year': currentWeek.week[0].year,
                       'month': currentWeek.week[0].month-1,
                       'date': currentWeek.week[0].date - 7,
                      };
  var prevWeek = new Week(prevWeekParam);
  currentWeek = prevWeek;
  var prevWeekCal = new Calendar(prevWeek);
  prevWeekCal.getEvents();
}

function handleNextNav() { // TODO: Set current view week
  /* 
  var now = new Date(); 
  var nextWeekNow = {'year': now.getFullYear(),
                     'month': now.getMonth(),
                     'date': now.getDate() + 7
                    };
  */
  var nextWeekParam = {'year': currentWeek.week[0].year,
                       'month': currentWeek.week[0].month-1,
                       'date': currentWeek.week[0].date +7,
                      };
  var nextWeek = new Week(nextWeekParam);
  currentWeek = nextWeek;
  var nextWeekCal = new Calendar(nextWeek);
  nextWeekCal.getEvents();
}

function getPrevWeek(week) {
  var prevWeek = [];
  for (var dayIndex = 0; dayIndex < this.week.length; dayIndex++) {
    var day = this.week[dayIndex];
    var newJsDate = new Date(day.year, day.month-1, day.date-7);
    var newDay = new Day(newJsDate);
    prevWeek.push(newDay);
  }
  return prevWeek;
}

function getNextWeek(week) {
  var nextWeek = [];
  for (var dayIndex = 0; dayIndex < this.week.length; dayIndex++) {
    var day = this.week[dayIndex];
    var newJsDate = new Date(day.year, day.month-1, day.date+7);
    var newDay = new Day(newJsDate);
    nextWeek.push(newDay);
  }
  return nextWeek;
}

function getMemberWithEmail(email) {
  for (var memberIndex = 0; memberIndex < membersList.length; memberIndex++) {
    var member = membersList[memberIndex];
    var memberEmail = member['email'];
    /* 
    console.log('GET MEMBER WITH EMAIL');
    console.log('memberEmail', memberEmail);
    console.log('email', email);
    */
    if (memberEmail == email) {
      // console.log(member);
      return member;
    }
  }
  // console.log('undefined');
  return undefined;
}

function addSampleEvent() {
  var attendees = [];
  for (var memberIndex = 0; memberIndex < membersList.length; memberIndex++) {
    var member = membersList[memberIndex];
    var attendeeObj = {};
    attendeeObj['email'] = member['email'];
    attendees.push(attendeeObj);
  }
  var event = {
    'summary': 'Google I/O 2015',
    // 'id': '12346', 
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
      'dateTime': '2015-12-02T09:00:00',
      'timeZone': 'America/Los_Angeles'
    },
    'end': {
      'dateTime': '2015-12-02T17:00:00',
      'timeZone': 'America/Los_Angeles'
    },
    'recurrence': [
      'RRULE:FREQ=DAILY;COUNT=1'
    ],
    'attendees': attendees,
      /*
      [
      {'email': 'frw@andrew.cmu.edu'},
      {'email': 'gail.de.wilson@gmail.com'}
    ], 
      */
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10}
      ]
    }
  };

  var request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });

  request.execute(function(resp) {
    console.log(resp);
    // var sampleEventId = resp.id;
    var eventCustom = new Event(resp);
    eventCustom.createEvent();
  });

}

function deleteSampleEvent() {
  var request = gapi.client.calendar.events.delete({
    'calendarId': 'primary',
    'eventId': '12346',
  });
  request.execute(function(resp) {
    // console.log(resp);
  })
}

window.onload = function() {
  // createCalTimes();

  /* 
  // Set calEvents div to 6am marker as scroll top
  console.log($('#hour6'));
  var sixAmPos = $('#hour6').position();
  console.error(sixAmPos);
  $('#calEventsContainer').scrollTop(sixAmPos.top);
  */
}