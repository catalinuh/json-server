const wikiApi = (() => {
  const baseURL = 'http://localhost:3000';
  const path = 'events';

  const getEvents = () =>
    fetch([baseURL, path].join('/')).then((response) => response.json());

  return {
    getEvents,
  };
})();

// View
const view = (() => {
  const domStr = {
    eventList: '#event-list__container',
    event: '.event',
    eventField: '.event-field',
    startField: '.start-field',
    endField: '.end-field',
    editBtn: '.edit-btn',
    deleteBtn: '.delete-btn',
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
    constructor(eventName) {
      this.eventName = eventName;
      this.startDate = startDate;
      this.endDate = endDate;
      this.id = 0;
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

  return {
    Event,
    State,
    getEvents,
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

  const bootstrap = () => {
    init();
  };

  return { bootstrap };
})(model, view);

controller.bootstrap();
