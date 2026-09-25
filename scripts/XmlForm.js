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

    persistenceFlags = {
        title: false,
        series: false,
        volume: false,
        number: false,
        count: false,
        summary: false,
        writer: false,
        publisher: false,
        date: false,
        genre: false,
        tags: false,
        languageiso: false,
        manga: false,
    };

    constructor() {
        this.xmlFormContainer = document.getElementById("xmlForm");
        this.buttonFormat = document.getElementById("buttonFormat");
        this.checkboxPascal = document.getElementById("checkboxPascal");
        this.buttonPinAll = document.getElementById("pinAll");
        this.#addEventsToElements();
        this.#addFormatEvents();
        this.#addEventsToPinButtons();
        this.#addEventToPinAllButton();
    }

    #addEventsToElements() {
        xmlContextController.addObserver(this);

        for (const [key, value] of Object.entries(this.formElements)) {
            if (key == "date") {
                value.addEventListener("input", (event) => {
                    let changeContextFunction = this.persistenceFlags[key] ? xmlContextController.changeAllContexts : xmlContextController.changeContext;
                    changeContextFunction = changeContextFunction.bind(xmlContextController);

                    const date = new Date(event.target.value);
                    changeContextFunction(
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
                let changeContextFunction = this.persistenceFlags[key] ? xmlContextController.changeAllContexts : xmlContextController.changeContext;
                changeContextFunction = changeContextFunction.bind(xmlContextController);
                changeContextFunction(
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

    #addFormatEvents() {
        this.buttonFormat.addEventListener("click", () => {
            this.formatSeperatedValues([this.formElements.genre, this.formElements.tags]);
        });
    }

    formatSeperatedValues(textAreas) {
        for (const textArea of textAreas) {
            const seperator = this.findSeperator(textArea);

            if (this.checkboxPascal.checked) {
                this.PascalCaseFormat(textArea);
            }

            let formattedValues;
            if (seperator) formattedValues = textArea.value.replaceAll(seperator, ",");
            formattedValues = textArea.value
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

    findSeperator(textArea) {
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
        } catch {
            console.log(`No seperator found`);
        }

        return seperator;
    }

    PascalCaseFormat(textArea) {
        const caseTransitions = new Set(textArea.value.matchAll(/\w[A-Z]/g));
        let newText = textArea.value;
        caseTransitions.forEach(([value], index) => {
            let replacementText = value.split("");
            replacementText = replacementText.join(",");
            newText = newText.replaceAll(value, replacementText);
        });
        textArea.value = newText;
    }

    #addEventToPinAllButton() {
        this.buttonPinAll.addEventListener("click", (event) => {
            const buttonElement = event.currentTarget;
            const currentState = this.buttonPinAll.classList.contains("checked");

            const pinAll = () => {
                const labels = this.xmlFormContainer.querySelectorAll("label[class=formLabel]");
                for (const label of labels) {
                    const pinButton = label.getElementsByTagName("button")[0];
                    if (!currentState && !pinButton.classList.contains("checked")) pinButton.click();
                    if (currentState && pinButton.classList.contains("checked")) pinButton.click();
                }
            };

            buttonElement.classList.toggle("checked");
            pinAll();
        });
    }

    #addEventsToPinButtons() {
        const labels = this.xmlFormContainer.querySelectorAll("label[class=formLabel]");
        for (const label of labels) {
            const pinButton = label.getElementsByTagName("button")[0];
            pinButton.addEventListener("click", (event) => {
                const currentPinButtonState = pinButton.classList.contains("checked");
                const currentPinAllState = this.buttonPinAll.classList.contains("checked");

                if (currentPinAllState && currentPinButtonState) this.buttonPinAll.classList.toggle("checked");

                const buttonElement = event.currentTarget;
                buttonElement.classList.toggle("checked");

                const formElementId = label.htmlFor;
                const [formElementKey, formElement] = Object.entries(this.formElements).find(([key, value]) => value.id == formElementId);
                this.persistenceFlags[formElementKey] = !currentPinButtonState;

                if (formElement.tagName == "TEXTAREA") {
                    const textareaParent = formElement.closest("div.textareaField");
                    textareaParent.classList.toggle("checked");
                } else formElement.classList.toggle("checked");
            });
        }
    }
}

export const xmlForm = new XmlForm();
