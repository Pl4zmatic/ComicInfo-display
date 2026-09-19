import { basicSetup, EditorView } from "https://esm.sh/codemirror";
import { xml } from "https://esm.sh/@codemirror/lang-xml";
import { xmlContextController } from "./XmlContextController.js";
import { EditorView as View } from "https://esm.sh/@codemirror/view";
import JSZip from "https://esm.sh/jszip";
import saveAs from "https://esm.sh/file-saver";
import { xmlTools } from "./xmlTools.js";
import LoadingBar from "./LoadingBar.js";

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
        extensions: [basicSetup, xml(), View.updateListener.of(this.#editorValueChanged.bind(this))],
        parent: document.querySelector("#xmlOutput"),
    });

    #isSyncing = false;

    constructor() {
        xmlContextController.addObserver(this);
    }

    update(xmlContext) {
        for (const [key, value] of Object.entries(xmlContext)) {
            const [fromIndex, toIndex] = xmlTools.findKeyIndexRange(key, this.xmlEditorElement.state.doc.toString());
            this.replaceOrRemoveFromEditor(fromIndex, toIndex, value);
        }
    }

    replaceOrRemoveFromEditor(fromIndex, toIndex, value) {
        this.#isSyncing = true;
        this.xmlEditorElement.dispatch({
            changes: { from: fromIndex, to: toIndex, insert: String(value) },
        });
        this.#isSyncing = false;
    }

    #editorValueChanged(update) {
        if (!update.docChanged || this.#isSyncing) return;

        const xmlContent = update.state.doc.toString();
        const changedKeys = new Set();

        update.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
            const key = xmlTools.getKeyFromEditorPosition(fromB || fromA, xmlContent, xmlContextController.getKeys());
            if (key) {
                changedKeys.add(key);
            }
        });

        for (const key of changedKeys) {
            xmlContextController.changeContext({ [key]: xmlTools.getKeyValue(key, xmlContent) }, this);
        }
    }
}

export const xmlEditor = new XmlEditor();

const buttonBatch = document.getElementById("buttonBatch");
const buttonSingle = document.getElementById("buttonSingle");
const selectExtension = document.getElementById("selectExtension");
const dialogContent = document.querySelector(".dialogContent");
const loadingContainer = document.getElementById("loadingContainer");
const loadingTitle = document.getElementById("loadingTitle");
const loadingCounter = document.getElementById("loadingCounter");

buttonBatch.addEventListener("click", () => {
    const zip = new JSZip();

    const itemsWithSerieOrTitle = xmlContextController.allXmlContexts.filter(function (context) {
        const hasSeriesName = !!context.data.series;
        return hasSeriesName || !!context.data.title;
    });

    if (itemsWithSerieOrTitle.length == 0) {
        console.error("No serie name or title found from allContexts.");
        return;
    }

    const serieOrTitle = itemsWithSerieOrTitle[0].data.series || itemsWithSerieOrTitle[0].data.title;

    const loadingBar = new LoadingBar(loadingContainer, loadingTitle, loadingCounter, undefined, dialogContent);

    xmlContextController.allXmlContexts.forEach(function (context, index) {
        const subfolderNumber = context.data.number <= 0 ? index + 1 : context.data.number;
        const subfolderName = `${serieOrTitle} ${subfolderNumber}`;
        zip.folder(subfolderName);

        zip.file(`${subfolderName}/ComicInfo.xml`, context.getXml());
        const files = context.folderData.files;
        for (const xmlContextfile of files) {
            zip.file(`${subfolderName}/${xmlContextfile.name}`, xmlContextfile);
        }
    });

    zip.generateAsync({ type: "blob" }, function (metadata) {
        loadingBar.setTitle(metadata.currentFile);
        loadingBar.setItemCounter(Number(metadata.percent).toFixed(0));
    }).then(function (content) {
        saveAs(content, `${serieOrTitle}${selectExtension.value}`);
    });
});

buttonSingle.addEventListener("click", () => {
    const zip = new JSZip();

    const itemsWithSerieOrTitle = xmlContextController.allXmlContexts.filter(function (context) {
        const hasSeriesName = !!context.data.series;
        return !!context.data.title || hasSeriesName;
    });

    if (itemsWithSerieOrTitle.length == 0) {
        console.error("No title or serie name found from allContexts.");
        return;
    }

    const context = xmlContextController.currentXmlContext;

    const subfolderNumber = context.data.number <= 0 ? "" : ` ${context.data.number}`;
    const subfolderName = `${itemsWithSerieOrTitle[0].data.title || itemsWithSerieOrTitle[0].data.series}${subfolderNumber}`;

    zip.file(`ComicInfo.xml`, context.getXml());
    const files = context.folderData.files;
    for (const xmlContextfile of files) {
        zip.file(`${xmlContextfile.name}`, xmlContextfile);
    }

    zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, `${subfolderName}${selectExtension.value}`);
    });
});
