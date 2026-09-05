import { basicSetup, EditorView } from "https://esm.sh/codemirror";
import { EditorState } from "https://esm.sh/@codemirror/state";
import { xml } from "https://esm.sh/@codemirror/lang-xml";
import { xmlContextController } from "./XmlContextController.js";

class XmlEditor {
    #xmlEditorElement = new EditorView({
        doc: `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
    <Title></Title>
    <Series></Series>
    <Number></Number>
    <Volume></Volume>
    <Count></Count>

    <Summary></Summary>

    <Writer></Writer>
    <Publisher></Publisher>

    <Year></Year>
    <Month></Month>
    <Day></Day>

    <Genre></Genre>
    <Tags></Tags>

    <LanguageISO></LanguageISO>
    <Manga></Manga>
</ComicInfo>`,
        extensions: [basicSetup, xml()],
        parent: document.querySelector("#xmlOutput"),
    });

    constructor() {
        xmlContextController.addObserver(this);
    }

    update(xmlContext) {
        for (const [key, value] of Object.entries(xmlContext)) {
            const [fromIndex, toIndex] = this.findIndexRange(key);

            if (key === "date") {
                const [year, month, day] = value.split("-");
                const dateObject = { year, month, day };

                for (const [dateKey, dateValue] of Object.entries(dateObject)) {
                    const [fromIndex, toIndex] = this.findIndexRange(dateKey);
                    this.#xmlEditorElement.dispatch({
                        changes: { from: fromIndex, to: toIndex, insert: dateValue },
                    });
                }
            } else {
                this.replaceOrRemoveFromEditor(fromIndex, toIndex, value);
            }
        }
    }

    findIndexRange(key) {
        const fromIndex = this.#xmlEditorElement.state.doc.toString().toLowerCase().indexOf(`<${key}>`) + key.length + 2;
        const toIndex = this.#xmlEditorElement.state.doc.toString().toLowerCase().indexOf(`</${key}>`);
        return [fromIndex, toIndex];
    }

    replaceOrRemoveFromEditor(fromIndex, toIndex, value) {
        this.#xmlEditorElement.dispatch({
            changes: { from: fromIndex, to: toIndex, insert: value },
        });
    }
}

export const xmlEditor = new XmlEditor();
