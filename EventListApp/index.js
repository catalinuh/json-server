const wikiApi = (() => {
  const baseURL = 'http://localhost:3000';
  const path = 'events';

  const getEvents = () =>
    fetch([baseURL, path].join('/')).then((response) => response.json());

  const deleteEvent = (id) => {
    fetch([baseURL, path, id].join('/')),
      {
        method: 'DELETE',
      };
  };

  return {
    getEvents,
    deleteEvent,
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
      tmp += `
        <section class="event">
            <input value=${elem.eventName} class="event-field" type="text" aria-label="Event name" disabled />
            <input value=${elem.startDate} class="start-field" type="text" aria-label="Start date" disabled />
            <input value=${elem.endDate} class="end-field" type="text" aria-label="End date" disabled />
            <div id="edit-delete">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn" id=${elem.id}>Delete</button>
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

  const getEvents = api.getEvents;
  const addEvent = api.addEvent;
  const deleteEvent = api.deleteEvent;

  return {
    Event,
    State,
    getEvents,
    addEvent,
    deleteEvent,
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
    const newFields = document.createElement('section');
    newFields.id = 4; // not dyanmic
    newFields.innerHTML = `
        <section class="event">
            <input class="event-field" type="text" aria-label="Event name" />
            <input class="start-field" type="text" aria-label="Start date" />
            <input class="end-field" type="text" aria-label="End date" />
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
      saveBtn.addEventListener('click', () => {
        console.log('you clicked save!');
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
    const elem = document.querySelector(view.domStr.deleteBtn);

    elem.addEventListener('click', (e) => {
      state.eventList = state.eventList.filter((event) => {
        return +event.id !== +e.target.id;
      });
      model.deleteEvent(e.target.id);
    });
  };

  const bootstrap = () => {
    init();
    addEvent();
  };

  return { bootstrap };
})(model, view);

controller.bootstrap();
