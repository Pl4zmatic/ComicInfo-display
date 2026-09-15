import { basicSetup, EditorView } from "https://esm.sh/codemirror";
import { xml } from "https://esm.sh/@codemirror/lang-xml";
import { xmlContextController } from "./XmlContextController.js";
import { EditorView as View } from "https://esm.sh/@codemirror/view";

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
        extensions: [basicSetup, xml(), View.updateListener.of(editorValueChanged)],
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

function getTagValue(doc, key) {
    const lowerDoc = doc.toLowerCase();
    const openTag = `<${key}>`;
    const closeTag = `</${key}>`;
    const openIndex = lowerDoc.indexOf(openTag);
    const closeIndex = lowerDoc.indexOf(closeTag, openIndex + openTag.length);

    if (openIndex === -1 || closeIndex === -1) return "";

    return doc.slice(openIndex + openTag.length, closeIndex);
}

function getKeyFromEditorPosition(doc, position) {
    const trackedKeys = [...xmlContextController.getKeys(), "year", "month", "day"];

    for (const key of trackedKeys) {
        const lowerDoc = doc.toLowerCase();
        const openTag = `<${key}>`;
        const closeTag = `</${key}>`;
        const openIndex = lowerDoc.indexOf(openTag);
        const closeIndex = lowerDoc.indexOf(closeTag, openIndex + openTag.length);

        if (openIndex === -1 || closeIndex === -1) continue;

        const valueStart = openIndex + openTag.length;
        const valueEnd = closeIndex;

        if (position >= valueStart && position <= valueEnd) {
            return key;
        }
    }

    return null;
}

function editorValueChanged(update) {
    if (!update.docChanged) return;

    const doc = update.state.doc.toString();
    const changedKeys = new Set();

    update.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
        const key = getKeyFromEditorPosition(doc, fromB || fromA);
        if (key) {
            changedKeys.add(key);
        }
    });

    for (const key of changedKeys) {
        if (["year", "month", "day"].includes(key)) {
            const date = [getTagValue(doc, "year"), getTagValue(doc, "month"), getTagValue(doc, "day")]
                .filter(Boolean)
                .join("-");

            if (date) {
                xmlContextController.changeContext({ date }, xmlEditor);
            }

            continue;
        }

        xmlContextController.changeContext({ [key]: getTagValue(doc, key) }, xmlEditor);
    }
}
