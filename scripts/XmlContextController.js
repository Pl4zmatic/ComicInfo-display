class XmlContextController {
    currentContext;

    constructor() {
        this.observers = [];
    }

    changeContext(newContext = undefined, source = undefined) {
        if (source !== undefined) this.currentContext.changeContext(newContext);
        for (const observer of this.observers) {
            if (source === undefined || observer !== source) {
                observer.update({ ...this.currentContext.data });
            }
        }
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    getKeys() {
        return this.currentContext.getKeys();
    }
}

export const xmlContextController = new XmlContextController();
