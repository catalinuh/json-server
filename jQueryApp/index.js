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

  const editEvent = (id, newData) =>
    fetch([baseURL, path, id].join('/'), {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(newData),
    }).then((response) => response.json());

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
    cancelBtn: 'cancel-btn',
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
        <div id=${elem.id} class="event">
            <input value=${elem.eventName} class="event-field" type="text" aria-label="Event name" disabled />
            <input value=${startDate} class="start-field" type="date" aria-label="Start date" disabled />
            <input value=${endDate} class="end-field" type="date" aria-label="End date" disabled />
            <div id="edit-delete">
                <button id=${elem.id} class="edit-btn">Edit</button>
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
    $(newFields).addClass('event');
    // newFields.classList.add('event');
    $(newFields).html(`
      <input id="add-event" class="event-field" type="text" aria-label="Event name" />
      <input id="add-start-field" class="start-field" type="date" aria-label="Start date" />
      <input id="add-end-field" class="end-field" type="date" aria-label="End date" />
      <div id="edit-delete">
          <button class="save-btn" type="submit">Save</button>
          <button class="close-btn">Close</button>
      </div>
    `);

    $('#add-new-btn').click(function () {
      $('#event-list__container').append(newFields);
      $('.save-btn').click(function () {
        let eventArr = $('.event');
        let event = eventArr[eventArr.length - 1];
        let inputs = $(event).find('input');
        let eventName = inputs[0].value;
        let startDate = '' + new Date(inputs[1].value).getTime();
        let endDate = '' + new Date(inputs[2].value).getTime();

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

      $('.close-btn').click(function () {
        let eventArr = $('.event');
        $(eventArr[eventArr.length - 1]).remove();
      });
    });
  };

  const deleteEvent = () => {
    // $('.delete-btn').click(function () {
    //   state.events = state.events.filter((event) => {
    //     return +event.id !== +e.target.id;
    //   });
    //   model.deleteEvent(e.target.id);
    // });
    document.addEventListener('click', (e) => {
      if (e.target.className === 'delete-btn') {
        state.events = state.events.filter((event) => {
          return +event.id !== +e.target.id;
        });
        model.deleteEvent(e.target.id);
      }
    });
  };

  const editEvent = () => {
    document.addEventListener('click', (e) => {
      if (e.target.className === 'edit-btn') {
        let event = $(`#${e.target.id}`);
        let inputs = $(event).find('input');
        let buttons = $(event).find('button');

        // for (let i = 0; i < inputs.length; i++) {
        //   inputs[i].removeAttribute('disabled');
        // }
        inputs.removeAttr('disabled');

        buttons[0].className = 'save-btn';
        buttons[0].innerHTML = 'Save';
        buttons[1].className = 'cancel-btn';
        buttons[1].innerHTML = 'Cancel';

        document.addEventListener('click', (e) => {
          if (e.target.className === 'cancel-btn') {
            inputs.attr('disabled', '');

            $(buttons[0]).attr('class', 'edit-btn');
            $(buttons[0]).html('Edit');
            $(buttons[1]).attr('class', 'delete-btn');
            $(buttons[1]).html('Delete');
          }
        });

        document.addEventListener('click', (e) => {
          if (e.target.className === 'save-btn') {
            let event = $(`#${e.target.id}`);
            let inputs = $(event).find('input');

            let eventName = inputs[0].value;
            let startDate = '' + new Date(inputs[1].value).getTime();
            let endDate = '' + new Date(inputs[2].value).getTime();

            model
              .editEvent(e.target.id, {
                eventName: eventName,
                startDate: startDate,
                endDate: endDate,
              })
              .then((newEvent) => {
                state.events[e.target.id - 1] = newEvent;
              });

            inputs.attr('disabled', '');

            $(buttons[0]).attr('class', 'edit-btn');
            $(buttons[0]).html('Edit');
            $(buttons[1]).attr('class', 'delete-btn');
            $(buttons[1]).html('Delete');
          }
        });
      }
    });
  };

  const bootstrap = () => {
    init();
    deleteEvent();
    editEvent();
    addEvent();
  };

  return { bootstrap };
})(model, view);

controller.bootstrap();
