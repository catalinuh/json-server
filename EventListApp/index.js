const wikiApi = (() => {
  const baseURL = 'http://localhost:3000';
  const path = 'events';

  const getEvents = () =>
    fetch([baseURL, path].join('/')).then((response) => response.json());

  const addEvent = (event) =>
    fetch([baseURL, path].join('/'), {
      method: 'POST',
      body: JSON.stringify(event),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((response) => response.json());

  const deleteEvent = (id) =>
    fetch([baseURL, path, id].join('/'), {
      method: 'DELETE',
    });

  const editEvent = (id) =>
    fetch([baseURL, path, id].join('/'), {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
      .then((response) => response.json())
      .then((data) => (element.innerHTML = data.updatedAt));

  return {
    getEvents,
    addEvent,
    deleteEvent,
    editEvent,
  };
})();

// View
const view = (() => {
  const domStr = {
    addNewBtn: '#add-new-btn',
    eventList: '#event-list__container',
    event: '.event',
    eventField: '.event-field',
    startField: '.start-field',
    endField: '.end-field',
    editBtn: '.edit-btn',
    deleteBtn: '.delete-btn',
    saveBtn: '.save-btn',
    closeBtn: '.close-btn',
    addEvent: '#add-event',
    addStartField: '#add-start-field',
    addEndField: '#add-end-field',
  };

  const render = (element, tmp) => {
    element.innerHTML = tmp;
  };

  const createTmp = (array) => {
    let tmp = '';

    array.forEach((elem) => {
      let d1 = new Date(parseInt(elem.startDate));
      let d2 = new Date(parseInt(elem.endDate));

      let year1 = d1.getFullYear();
      let month1 =
        d1.getMonth() + 1 < 10 ? '0' + (d1.getMonth() + 1) : d1.getMonth() + 1;
      let day1 = d1.getDate() < 10 ? '0' + d1.getDate() : d1.getDate();
      let startDate = [year1, month1, day1].join('-');

      let year2 = d2.getFullYear();
      let month2 =
        d2.getMonth() + 1 < 10 ? '0' + (d2.getMonth() + 1) : d2.getMonth() + 1;
      let day2 = d2.getDate() < 10 ? '0' + d2.getDate() : d2.getDate();
      let endDate = [year2, month2, day2].join('-');
      tmp += `
        <div class="event">
            <input value=${elem.eventName} class="event-field" type="text" aria-label="Event name" disabled />
            <input value=${startDate} class="start-field" type="date" aria-label="Start date" disabled />
            <input value=${endDate} class="end-field" type="date" aria-label="End date" disabled />
            <div id="edit-delete">
                <button class="edit-btn">Edit</button>
                <button id=${elem.id} class="delete-btn">Delete</button>
            </div>
        </div>
          `;
    });

    return tmp;
  };

  return {
    domStr,
    render,
    createTmp,
  };
})();

// Model
const model = ((api, view) => {
  class Event {
    constructor(eventName, startDate, endDate, id) {
      this.eventName = eventName;
      this.startDate = startDate;
      this.endDate = endDate;
      this.id = id;
    }
  }

  class State {
    #events = [];

    get events() {
      return this.#events;
    }

    set events(newData) {
      this.#events = newData;

      const elem = document.querySelector(view.domStr.eventList);
      const tmp = view.createTmp(this.#events);
      view.render(elem, tmp);
    }
  }

  const getEvents = api.getEvents;
  const addEvent = api.addEvent;
  const deleteEvent = api.deleteEvent;
  const editEvent = api.editEvent;

  return {
    Event,
    State,
    getEvents,
    addEvent,
    deleteEvent,
    editEvent,
  };
})(wikiApi, view);

// Controller

const controller = ((model, view) => {
  const state = new model.State();

  const init = () => {
    model.getEvents().then((data) => {
      state.events = data;
    });
  };

  const addEvent = () => {
    const newFields = document.createElement('div');
    newFields.classList.add('event');
    newFields.innerHTML = `
            <input id="add-event" class="event-field" type="text" aria-label="Event name" required />
            <input id="add-start-field" class="start-field" type="date" aria-label="Start date" required />
            <input id="add-end-field" class="end-field" type="date" aria-label="End date" required />
            <div id="edit-delete">
                <button class="save-btn" type="submit">Save</button>
                <button class="close-btn">Close</button>
            </div>
    `;

    let element = document.getElementById('event-list__container');

    const addNewBtn = document.querySelector(view.domStr.addNewBtn);
    addNewBtn.addEventListener('click', () => {
      element.appendChild(newFields);

      const saveBtn = document.querySelector(view.domStr.saveBtn);
      saveBtn.addEventListener('click', () => {
        let eventName = document.querySelector(view.domStr.addEvent).value;

        let startDate =
          '' +
          new Date(
            document.querySelector(view.domStr.addStartField).value
          ).getTime();

        let endDate =
          '' +
          new Date(
            document.querySelector(view.domStr.addEndField).value
          ).getTime();

        model
          .addEvent({
            eventName: eventName,
            startDate: startDate,
            endDate: endDate,
          })
          .then((newEvent) => {
            state.events = [...state.events, newEvent];
          });
      });

      const closeBtn = document.querySelector(view.domStr.closeBtn);
      closeBtn.addEventListener('click', () => {
        let eventArr = document.getElementsByClassName('event');
        element.removeChild(eventArr[eventArr.length - 1]);
      });
    });
  };

  const deleteEvent = () => {
    let element = document.getElementById('event-list__container');
    element.addEventListener('click', (e) => {
      // id of delete button is a number, id's of new input fields are not, so
      // if the parsed int of the id being clicked is not NaN, so is a number, then
      // delete the event
      if (!isNaN(parseInt(e.target.id))) {
        state.events = state.events.filter((event) => {
          return +event.id !== +e.target.id;
        });
        model.deleteEvent(e.target.id);
      }
    });
  };

  const editEvent = () => {
    const editBtn = document.querySelector(view.domStr.editBtn);
    editBtn.addEventListener('click', () => {});
  };

  const bootstrap = () => {
    init();
    addEvent();
    deleteEvent();
    editEvent();
  };

  return { bootstrap };
})(model, view);

controller.bootstrap();
