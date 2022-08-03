class EventElement {
  constructor(subEventName, isAsync, funct) {
    this.subEventName = subEventName;
    this.isAsync = isAsync;
    this.funct = funct;
  }
}

/**
 * Singular event.
 */
class Event {
  constructor(parent) {
    this.partent = parent;
    this.elementsMap = new Map();
    this.elements = new Array();
  }

  getParent() {
    return this.parent;
  }

  condition(...args) {
    let result = true;

    // Run
    this.elements.some(element => {
      if (!element.funct(...args)) {
        result = false;
        return false;
      }
    });

    return result;
  }

  call(...args) {
    this.elements.some(element => {
      element.funct(...args);
    });
  }

  has(subEventName) {
    return this.elementsMap.has(subEventName);
  }

  remove(subEventName) {
    if (!this.has(subEventName)) return false;

    this.elementsMap.delete(subEventName);
    this.elements.splice(this._getIndex(subEventName), 1);

    return true;
  }

  delete(subEventName) {
    this.remove(subEventName);
  }

  clear() {
    this.elementsMap.clear();
    this.elements.length = 0;
  }

  replace(subEventName, funct) {
    if (!this.has(subEventName)) return false;

    this.elementsMap.get(subEventName).funct = funct;
    this.elements[this._getIndex(subEventName)].funct = funct;

    return true;
  }
  prepend(subEventName, funct, isAsyncOpt) {
    let obj = new EventElement(subEventName, isAsyncOpt, funct);
    this.elementsMap.set(subEventName, obj);
    this.elements.unshift(obj);
  }

  append(subEventName, funct, isAsyncOpt) {
    let obj = new EventElement(subEventName, isAsyncOpt, funct);
    this.elementsMap.set(subEventName, obj);
    this.elements.push(obj);
  }

  insertBefore(subEventNameSeek, subEventName, funct, isAsyncOpt) {
    //throw new Error(format("Error, Event: Insert seek key not found '{0}'.", subEventNameSeek));
    let index = this._getIndex(subEventNameSeek);

    let obj = new EventElement(subEventName, isAsyncOpt, funct);
    this.elementsMap.set(subEventName, obj);
    this.elements.splice(index, 0, obj);
  }

  insertAfter(subEventNameSeek, subEventName, funct, isAsyncOpt) {
    let index = this._getIndex(subEventNameSeek);

    let obj = new EventElement(subEventName, isAsyncOpt, funct);
    this.elementsMap.set(subEventName, obj);
    this.elements.splice(index + 1, 0, obj);
  }

  _getIndex(subEventNameSeek) {
    return this.elements.findIndex(element => element.subEventName == subEventNameSeek);
  }
}

/**
 * Event handler.
 */
class Events {
  constructor() {
    this.elementsMap = new Map();
  }

  condition(eventName, ...args) {
    return new Promise((resolve, reject) => {
      let element = this.elementsMap.get(eventName);
      
      if (element)
        resolve(element.condition());

      resolve(true); // Do not block if no conditions
    });
  }
  
  emit(...args) {
    this.call(...args);
  }

  call(eventName, ...args) {
    return new Promise((resolve, reject) => {
      let element;
      
      element = this.elementsMap.get('pre_' + eventName);
      if (element)
        element.call(...args);

      element = this.elementsMap.get(eventName);
      if (element)
        element.call(...args);

      element = this.elementsMap.get('post_' + eventName);
      if (element)
        element.call(...args);

      resolve(); // No fancy async currently
    });

    //  throw new Error(format("Error, Events: Failed to call '{0}'.", eventName));
  }

  has(eventName, subEventName) {
    if (!this.elementsMap.has(eventName)) return false;

    if (!subEventName) return true;

    return this.elementsMap.get(eventName).has(subEventName);
  }

  remove(eventName, subEventName) {
    if (!this.has(eventName)) return false;

    if (!subEventName) {
      this.elementsMap.delete(eventName);
      return true;
    }

    return this.elementsMap.get(eventName).remove(subEventName);
  }

  delete(eventName, subEventName) {
    this.remove(eventName, subEventName);
  }

  clear(eventName) {
    if (!eventName) {
      this.elementsMap.clear();
      return;
    }

    this.elementsMap.get(eventName).clear();
  }

  prepend(eventName, subEventName, funct, isAsyncOpt) {
    this._attainEvent(eventName).prepend(subEventName, funct, isAsyncOpt);
  }
  
  on(...args) {
    this.append(...args);
  }

  append(eventName, subEventName, funct, isAsyncOpt) {
    if (typeof subEventName === "function") {
      let values = Object.values(arguments);
      values.splice(1, 0, '_');
      this.append(...values);
      return;
    }
    
    this._attainEvent(eventName).append(subEventName, funct, isAsyncOpt);
  }

  insertBefore(eventName, subEventName, subEventNameSeek, funct, isAsyncOpt) {
    if (typeof subEventNameSeek === "function") {
      let values = Object.values(arguments);
      values.splice(1, 0, '_');
      this.insertBefore(...values);
      return;
    }
    
    this._attainEvent(eventName).insertBefore(subEventName, subEventNameSeek, funct, isAsyncOpt);
  }

  insertAfter(eventName, subEventName, subEventNameSeek, funct, isAsyncOpt) {
    if (typeof subEventNameSeek === "function") {
      let values = Object.values(arguments);
      values.splice(1, 0, '_');
      this.insertAfter(...values);
      return;
    }
    
    this._attainEvent(eventName).insertAfter(subEventName, subEventNameSeek, funct, isAsyncOpt);
  }

  _attainEvent(eventName) {
    if (!this.elementsMap.has(eventName)) this.elementsMap.set(eventName, new Event(this));

    return this.elementsMap.get(eventName);
  }
}

class Keyboard {
	constructor() {
		this.keyStates = new Map();
    this.events = new Events();
	}
  
  clear() {
    this.keyStates.clear();
  }
  
  update() {
    this.keyStates.forEach((value, keyCode) => {
      const event = this.keyStates.get(keyCode);

      event.alreadyPressed = true;
      
      if (event.wasReleased) {
        this.keyStates.delete(keyCode);
      }

      keyboard.events.call('down', keyCode, event);
      keyboard.events.call('down_' + keyCode, keyCode, event);
    });
  }
  
  isKeyDown(...args) {
    let result = false;
    for(let keyCode of args) {
      const event = this.keyStates.get(keyCode);
      if (event && !event.wasReleased)
        result = true;
    }
    
    return result;
  }
  
  isKeyUp(...args) {
    return !this.isKeyDown(args);
  }
  
  isKeyPressed(...args) {
    let result = false;
    
    if (args.length == 0)
      return false;
    
    for(let keyCode of args) {
      const event = this.keyStates.get(keyCode);
      if (event && !event.wasReleased && !event.alreadyPressed)
        result = true;
    }

    return result;
  }
  
  isKeyReleased(...args) {
    let result = false;
    
    if (args.length == 0)
      return false;
    
    for(let keyCode of args) {
      const event = this.keyStates.get(keyCode);
      if (event && event.wasReleased)
        result = true;
    }

    return result;
  }
}

const keyboard = new Keyboard();

window.addEventListener(
  "keydown", (event) => {
    if (!keyboard.keyStates.get(event.code)) {
      keyboard.keyStates.set(event.code, event);
      keyboard.events.call('pressed', event.code, event);
      keyboard.events.call('pressed_' + event.code, event.code, event);
    }
  }, false
);

window.addEventListener(
  "keyup", (event) => {
    event = keyboard.keyStates.get(event.code);
    if (event) {
      //keyboard.keyStates.set(event.code, event);
      event.wasReleased = true;
      keyboard.events.call('released', event.code, event);
      keyboard.events.call('released_' + event.code, event.code, event);
    }
  }, false
);

/*keyboard.events.on('pressed', null, (keyCode, event) => {
  console.log('dd', keyCode);
});*/
/*
setInterval(() => {
  console.log(keyboard.isKeyReleased('KeyA'));
  keyboard.update();
}, 0);*/