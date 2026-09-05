import { xmlContext } from "./xmlContext.js";

class XmlContextController {
    constructor() {
        this.observers = [];
    }

    changeContext(newContext, source) {
        xmlContext.changeContext(newContext);
        for (const observer of this.observers) {
            if (observer !== source) {
                observer.update({ ...xmlContext });
            }
        }
    }

    addObserver(observer) {
        this.observers.push(observer);
    }
}

export const xmlContextController = new XmlContextController();
