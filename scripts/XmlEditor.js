import { basicSetup, EditorView } from "https://esm.sh/codemirror";
import { xml } from "https://esm.sh/@codemirror/lang-xml";
import { HighlightStyle, syntaxHighlighting } from "https://esm.sh/@codemirror/language";
import { tags as t } from "https://esm.sh/@lezer/highlight";
import { EditorView as View } from "https://esm.sh/@codemirror/view";
import JSZip from "https://esm.sh/jszip";
import saveAs from "https://esm.sh/file-saver";
import { createTheme } from "https://esm.sh/thememirror";
import { xmlContextController } from "./XmlContextController.js";
import { xmlTools } from "./xmlTools.js";
import LoadingBar from "./LoadingBar.js";

const editorTheme = createTheme({
    variant: "dark",
    settings: {
        background: "var(--panel)",
        foreground: "var(--text)",
        caret: "var(--highlight)",
        selectionBackground: "color-mix(in srgb, var(--highlight) 35%, transparent)",
        gutterBackground: "var(--panel-2)",
        gutterForeground: "var(--muted)",
        lineHighlight: "color-mix(in srgb, var(--highlight) 12%, transparent)",
    },
    styles: [],
});

const xmlSyntaxHighlight = HighlightStyle.define([
    { tag: t.tagName, color: "var(--highlight)" },
    { tag: t.attributeName, color: "var(--muted)" },
    { tag: t.attributeValue, color: "var(--text)" },
    { tag: t.content, color: "var(--text)" },
    { tag: t.string, color: "var(--muted)" },
    { tag: t.comment, color: "var(--more-muted)" },
    { tag: t.processingInstruction, color: "var(--highlight-muted)" },
    { tag: t.punctuation, color: "var(--more-muted)" },
    { tag: t.angleBracket, color: "var(--more-muted)" },
]);

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
        extensions: [basicSetup, xml(), syntaxHighlighting(xmlSyntaxHighlight), View.updateListener.of(this.#editorValueChanged.bind(this)), editorTheme],
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
const dialogExport = document.getElementById("dialogExport");
const dialogContent = document.querySelector(".dialogContent");
const loadingContainer = document.getElementById("loadingContainer");
const loadingTitle = document.getElementById("loadingTitle");
const loadingCounter = document.getElementById("loadingCounter");

buttonBatch.addEventListener("click", async () => {
    //find a serie name or title for the name of the root zip file
    const itemsWithSerieOrTitle = xmlContextController.allXmlContexts.filter(function (context) {
        const hasSeriesName = !!context.data.series;
        return hasSeriesName || !!context.data.title;
    });

    if (itemsWithSerieOrTitle.length == 0) {
        console.error("No serie name or title found from allContexts.");
        return;
    }

    const serieOrTitle = itemsWithSerieOrTitle[0].data.series || itemsWithSerieOrTitle[0].data.title;

    //setup loadingBar
    dialogExport.closedBy = "none";
    const loadingBar = new LoadingBar(loadingContainer, loadingTitle, loadingCounter, undefined, dialogContent);
    //count total amount of files to load
    xmlContextController.allXmlContexts.forEach((context) => {
        loadingBar.totalItems += context.folderData.files.length;
    });
    loadingBar.totalItems += xmlContextController.allXmlContexts.length;

    zipContextList(xmlContextController.allXmlContexts, serieOrTitle, loadingBar);
});

buttonSingle.addEventListener("click", () => {
    const context = xmlContextController.currentXmlContext;

    const serieOrTitle = context.data.series || context.data.title;

    dialogExport.closedBy = "none";
    const loadingBar = new LoadingBar(loadingContainer, loadingTitle, loadingCounter, undefined, dialogContent);
    loadingBar.totalItems += context.folderData.files.length + 1;

    zipContextList([context], serieOrTitle, loadingBar);
});

async function zipContextList(contextList, zipName, loadingBar) {
    const zipChildren = new Promise(async (resolve, reject) => {
        const zip = new JSZip();

        for (let index = 0; index < contextList.length; index++) {
            const context = contextList[index];

            const childZip = new JSZip();

            //zip comicinfo and files
            childZip.file(`ComicInfo.xml`, context.getXml());
            const files = context.folderData.files;
            for (const xmlContextfile of files) {
                if (xmlContextfile.name != "ComicInfo.xml") childZip.file(xmlContextfile.name, xmlContextfile.jsFile);
            }

            //generate zip and live update loadingBar
            const prevItemCounter = Number(loadingBar.itemCounter);
            const content = await childZip.generateAsync({ type: "blob" }, function (metadata) {
                loadingBar.itemTitle = metadata.currentFile;
                loadingBar.displayItemTitle();
                loadingBar.itemCounter = Number((metadata.percent / 100) * files.length + prevItemCounter).toFixed(0);
                loadingBar.displayItemCounterWithNumerator();
            });

            const subfolderNumber = !context.data.number || Number(context.data.number) <= 0 ? index + 1 : context.data.number;
            const subfolderName = `${zipName} ${subfolderNumber}`;
            const duplicateChildren = Object.keys(zip.files).filter(function (value) {
                return value.includes(subfolderName);
            });

            let childZipName = `${subfolderName}${selectExtension.value}`;
            if (duplicateChildren.length) {
                childZipName = `${subfolderName}(${duplicateChildren.length})${selectExtension.value}`;
            }

            zip.file(childZipName, content);
        }

        resolve(zip);
    });

    zipChildren
        .then(function (zip) {
            return zip.generateAsync({ type: "blob" }, function (metadata) {
                loadingBar.itemTitle = metadata.currentFile;
                loadingBar.displayItemTitle();
                loadingBar.itemCounter =
                    Math.round((metadata.percent / 100) * xmlContextController.allXmlContexts.length) +
                    loadingBar.totalItems -
                    xmlContextController.allXmlContexts.length;
                loadingBar.displayItemCounterWithNumerator();
            });
        })
        .then(function (zip) {
            saveAs(zip, `${zipName}.zip`);
            dialogExport.closedBy = "any";
            dialogExport.close();
            loadingBar.toggle();
        });
}
