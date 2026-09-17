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
            if (key == "date") {
                value.addEventListener("input", (event) => {
                    const date = new Date(event.target.value);
                    xmlContextController.changeContext(
                        {
                            year: date.getFullYear(),
                            month: date.getMonth() + 1,
                            day: date.getDate(),
                        },
                        this,
                    );
                });

                continue;
            }

            value.addEventListener("input", (event) => {
                xmlContextController.changeContext(
                    {
                        [key]: event.target.value,
                    },
                    this,
                );
            });
        }
    }

    update(xmlContext) {
        const tempDate = new Date();
        for (const [key, value] of Object.entries(xmlContext)) {
            if (["year", "month", "day"].includes(key)) {
                const dateConstructor = {
                    year: (value, dateObject) => dateObject.setFullYear(value),
                    month: (value, dateObject) => dateObject.setMonth(value - 1),
                    day: (value, dateObject) => dateObject.setDate(value),
                };
                dateConstructor[key](value, tempDate);

                if (key == "day") this.formElements["date"].valueAsDate = tempDate;
                continue;
            }

            if (this.formElements[key].value != value) {
                this.formElements[key].value = value;
            }
        }
    }
}

export const xmlForm = new XmlForm();

const buttonFormat = document.getElementById("buttonFormat");

buttonFormat.addEventListener("click", () => {
    formatSeperatedValues([xmlForm.formElements.genre, xmlForm.formElements.tags]);
});

function formatSeperatedValues(textAreas) {
    for (const textArea of textAreas) {
        let seperator = undefined;
        try {
            seperator = Object.entries(
                textArea.value
                    .matchAll(/[^a-z\n\s]/g)
                    .toArray()
                    .reduce((specialCharsCount, char) => {
                        if (specialCharsCount[char] === undefined) specialCharsCount[char] = 0;
                        specialCharsCount[char] += 1;
                        return specialCharsCount;
                    }, {}),
            ).sort(([key1, value1], [key2, value2]) => value2 - value1)[0][0];
        } finally {
            if (seperator !== undefined) console.log(seperator);
        }

        let formattedValues = textArea.value
            .replaceAll(seperator, ",")
            .replaceAll("\n", ",")
            .split(",")
            .map((element) => element.trim());
        textArea.value = formattedValues.join(",");

        xmlContextController.changeContext(
            {
                [textArea.name]: textArea.value,
            },
            textArea,
        );
    }
}
