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
  };

  const render = (element, tmp) => {
    element.innerHTML = tmp;
  };

  const createTmp = (array) => {
    let tmp = '';

    array.forEach((elem) => {
      let date1 = new Date(parseInt(elem.startDate.substring(0, 11)));
      let date2 = new Date(parseInt(elem.endDate.substring(0, 11)));

      tmp += `
        <section id=${elem.id} class="event">
            <input value=${
              elem.eventName
            } class="event-field" type="text" aria-label="Event name" disabled />
            <input value=${
              date1.getFullYear() +
              '-' +
              String(
                date1.getMonth() < 10
                  ? '0' + date1.getMonth()
                  : date1.getMonth()
              ) +
              '-' +
              String(
                date1.getDay() < 10 ? '0' + date1.getDay() : date1.getDay()
              )
            } class="start-field" type="date" aria-label="Start date" disabled />
            <input value=${
              date2.getFullYear() +
              '-' +
              String(
                date2.getMonth() < 10
                  ? '0' + date2.getMonth()
                  : date2.getMonth()
              ) +
              '-' +
              String(
                date2.getDay() < 10 ? '0' + date2.getDay() : date2.getDay()
              )
            } class="end-field" type="date" aria-label="End date" disabled />
            <div id="edit-delete">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        </section>
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

  const clickedEdit = () => {
    console.log('u clicked edit!');
  };

  const getEvents = api.getEvents;
  const addEvent = api.addEvent;
  const deleteEvent = api.deleteEvent;
  const editEvent = api.editEvent;

  return {
    Event,
    State,
    clickedEdit,
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

  // incomplete
  const addEvent = () => {
    let eventListSize = model.getEvents().then(() => state.events.length);
    const newFields = document.createElement('section');
    newFields.id = 4; // not dyanmic
    newFields.innerHTML = `
        <section class="event">
            <input class="event-field" type="text" aria-label="Event name" />
            <input class="start-field" type="date" aria-label="Start date" />
            <input class="end-field" type="date" aria-label="End date" />
            <div id="edit-delete">
                <button class="save-btn">Save</button>
                <button class="close-btn">Close</button>
            </div>
        </section>
    `;

    let element = document.getElementById('event-list__container');

    const addNewBtn = document.querySelector(view.domStr.addNewBtn);
    addNewBtn.addEventListener('click', () => {
      element.appendChild(newFields);

      const saveBtn = document.querySelector(view.domStr.saveBtn);
      saveBtn.addEventListener('click', (e) => {
        // find out how to bring id of event that was clicked on here
        console.log(e.target.value);
      });

      const closeBtn = document.querySelector(view.domStr.closeBtn);
      closeBtn.addEventListener('click', () => {
        const toBeRemoved = document.getElementById(4);
        element.removeChild(toBeRemoved);
      });
    });
  };

  // incomplete
  const deleteEvent = () => {
    const deleteBtn = document.querySelector(view.domStr.deleteBtn);
    deleteBtn.addEventListener('click', (e) => {
      console.log('you clicked the delete button!');
    });
  };

  // incomplete
  const editEvent = (id) => {
    const editBtn = document.querySelector(view.domStr.editBtn);
    editBtn.addEventListener('click', (e) => {
      console.log('you clicked the edit button!');
    });
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
