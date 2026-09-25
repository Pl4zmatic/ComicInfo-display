class XmlContextController {
    currentXmlContext;
    allXmlContexts = [];

    constructor() {
        this.observers = [];
    }

    changeContext(newContext = undefined, source = undefined) {
        if (source !== undefined) this.currentXmlContext.changeContext(newContext);
        for (const observer of this.observers) {
            if (source === undefined || observer !== source) {
                observer.update({ ...this.currentXmlContext.data });
            }
        }
    }

    changeAllContexts(newContext = undefined, source = undefined) {
        if (source !== undefined)
            this.allXmlContexts.forEach((context) => {
                context.changeContext(newContext);
            });
        for (const observer of this.observers) {
            if (source === undefined || observer !== source) {
                observer.update({ ...this.currentXmlContext.data });
            }
        }
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    getKeys() {
        return this.currentXmlContext.getKeys();
    }
}

export const xmlContextController = new XmlContextController();
