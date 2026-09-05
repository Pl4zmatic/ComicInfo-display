import { xmlContextController } from "./XmlContextController.js";

class XmlForm {
    formElements = {
        title: document.getElementById("xmlTitle"),
        series: document.getElementById("xmlSeries"),
        volume: document.getElementById("xmlVolume"),
        number: document.getElementById("xmlNumber"),
        count: document.getElementById("xmlCount"),
        summary: document.getElementById("xmlSummary"),
        writer: document.getElementById("xmlWriter"),
        publisher: document.getElementById("xmlPublisher"),
        date: document.getElementById("xmlDate"),
        genre: document.getElementById("xmlGenre"),
        tags: document.getElementById("xmlTags"),
        languageiso: document.getElementById("xmlLanguage"),
        manga: document.getElementById("xmlManga"),
    };

    constructor() {
        this.XmlForm = document.getElementById("xmlForm");
        xmlContextController.addObserver(this);

        for (const [key, value] of Object.entries(this.formElements)) {
            value.addEventListener("input", () => {
                xmlContextController.changeContext(
                    {
                        [key]: value.value,
                    },
                    this,
                );
            });
        }
    }

    update(xmlContext) {
        for (const [key, value] of Object.entries(xmlContext)) {
            if (this.formElements[key].value != value) {
                this.formElements[key].value = value;
            }
        }
    }
}

export const xmlForm = new XmlForm();
