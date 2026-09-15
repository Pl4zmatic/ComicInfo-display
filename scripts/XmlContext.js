export default class XmlContext {
    data = {
        title: "",
        series: "",
        volume: 0,
        number: 0,
        count: 0,
        summary: "",
        writer: "",
        publisher: "",
        date: "",
        genre: "",
        tags: "",
        languageiso: "",
        manga: "",
    };

    constructor(folderData) {
        this.folderData = folderData;
    }

    changeContext(newContext) {
        for (const [key, value] of Object.entries(newContext)) {
            if (this.data[key] != value) {
                this.data[key] = value;
            }
        }
    }

    getKeys() {
        return Object.keys(this.data);
    }
}
