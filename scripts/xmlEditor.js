import { basicSetup, EditorView } from "https://esm.sh/codemirror";
import { xml } from "https://esm.sh/@codemirror/lang-xml";
import { xmlContextController } from "./XmlContextController.js";
import { EditorView as View } from "https://esm.sh/@codemirror/view";
import JSZip from "https://esm.sh/jszip";
import saveAs from "https://esm.sh/file-saver";

class XmlEditor {
    xmlEditorElement = new EditorView({
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
                    this.xmlEditorElement.dispatch({
                        changes: { from: fromIndex, to: toIndex, insert: dateValue },
                    });
                }
            } else {
                this.replaceOrRemoveFromEditor(fromIndex, toIndex, value);
            }
        }
    }

    findIndexRange(key) {
        const fromIndex = this.xmlEditorElement.state.doc.toString().toLowerCase().indexOf(`<${key}>`) + key.length + 2;
        const toIndex = this.xmlEditorElement.state.doc.toString().toLowerCase().indexOf(`</${key}>`);
        return [fromIndex, toIndex];
    }

    replaceOrRemoveFromEditor(fromIndex, toIndex, value) {
        this.xmlEditorElement.dispatch({
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
            const date = [getTagValue(doc, "year"), getTagValue(doc, "month"), getTagValue(doc, "day")].filter(Boolean).join("-");

            if (date) {
                xmlContextController.changeContext({ date }, xmlEditor);
            }

            continue;
        }

        xmlContextController.changeContext({ [key]: getTagValue(doc, key) }, xmlEditor);
    }
}

const buttonBatch = document.getElementById("buttonBatch");
const buttonSingle = document.getElementById("buttonSingle");
const selectExtension = document.getElementById("selectExtension");

buttonBatch.addEventListener("click", () => {
    const zip = new JSZip();

    const itemsWithTitle = xmlContextController.allXmlContexts.filter(function (context) {
        return context.data.title !== undefined && context.data.title != "";
    });

    if (itemsWithTitle.length == 0) {
        console.error("No title found from allContexts.");
        return;
    }

    xmlContextController.allXmlContexts.forEach(function (context, index) {
        const subfolderNumber = context.data.number <= 0 ? index + 1 : itemsWithTitle[0].data.number;
        const subfolderName = `${itemsWithTitle[0].data.title} ${subfolderNumber}`;
        zip.folder(subfolderName);

        zip.file(`${subfolderName}/ComicInfo.xml`, context.getXml());
        const files = context.folderData.files;
        for (const xmlContextfile of files) {
            zip.file(`${subfolderName}/${xmlContextfile.name}`, xmlContextfile);
        }
    });

    zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, `${itemsWithTitle[0].data.title}${selectExtension.value}`);
    });
});

buttonSingle.addEventListener("click", () => {
    const zip = new JSZip();

    const itemsWithTitle = xmlContextController.allXmlContexts.filter(function (context) {
        return context.data.title !== undefined && context.data.title != "";
    });

    if (itemsWithTitle.length == 0) {
        console.error("No title found from allContexts.");
        return;
    }

    const context = xmlContextController.currentXmlContext;

    const subfolderNumber = context.data.number <= 0 ? "" : itemsWithTitle[0].data.number;
    const subfolderName = `${itemsWithTitle[0].data.title}${subfolderNumber}`;

    zip.file(`ComicInfo.xml`, context.getXml());
    const files = context.folderData.files;
    for (const xmlContextfile of files) {
        zip.file(`${xmlContextfile.name}`, xmlContextfile);
    }

    zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, `${subfolderName}${selectExtension.value}`);
    });
});
