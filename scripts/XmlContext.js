class XmlContext {
    constructor() {
        this.title = "";
        this.series = "";
        this.volume = 0;
        this.number = 0;
        this.count = 0;
        this.summary = "";
        this.writer = "";
        this.publisher = "";
        this.date = "";
        this.genre = "";
        this.tags = "";
        this.languageiso = "";
        this.manga = "";
    }

    changeContext(newContext) {
        for (const [key, value] of Object.entries(newContext)) {
            if (this[key] != newContext[key]) {
                this[key] = newContext[key];
            }
        }
    }
}

export const xmlContext = new XmlContext();
