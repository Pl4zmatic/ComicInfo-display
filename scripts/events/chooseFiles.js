import { addEventsToPreviewImages } from "./selectSubfolder.js";
import XmlContext from "../xmlContext.js";
import { xmlContextController } from "../XmlContextController.js";
import { xmlTools } from "../xmlTools.js";
import ZipFile from "../files/ZipFile.js";
import Folder from "../files/Folder.js";

// Read Files
const contentEmpty = document.getElementById("contentEmpty");
const contentSelected = document.getElementById("contentSelected");
const inputFileFolder = document.getElementById("inputFileFolder");
const inputFileZip = document.getElementById("inputFileZip");
const previewList = document.getElementById("previewList");
const preview = document.getElementById("preview");
const spanFolderName = document.getElementById("spanFolderName");

if (inputFileFolder.files.length > 0) {
    inputFileFolderCallback(inputFileFolder);
}

if (inputFileZip.files.length > 0) {
    await inputFileZipCallback(inputFileZip);
}

async function parseExistingComicInfoToContext(comicInfoFile, xmlContext) {
    for (const key of xmlContext.getKeys()) {
        const fileContentString = await comicInfoFile.text();
        xmlContext.data[key] = xmlTools.getKeyValue(key, fileContentString);
    }
}

function filesChanged(folders) {
    xmlContextController.allXmlContexts.length = 0;
    previewList.innerHTML = ""; // Clear the previewList container before adding new items
    spanFolderName.innerHTML = folders[0].folder;

    //parsing
    folders.forEach((folder) => {
        const image = document.createElement("img");
        image.src = URL.createObjectURL(Array.from(folder.files).find((file) => file.jsFile.type.startsWith("image/")).jsFile);
        image.dataset.subfolder = folder.subfolder;
        const folderXmlContext = new XmlContext(folder, image);

        const comicInfoFromFolder = folder.files.find((file) => file.name == "ComicInfo.xml");
        if (comicInfoFromFolder) parseExistingComicInfoToContext(comicInfoFromFolder, folderXmlContext);

        xmlContextController.allXmlContexts.push(folderXmlContext);
    });

    //sorting
    xmlContextController.allXmlContexts.sort((prevContext, nextContext) => {
        if (prevContext.data.number && nextContext.data.number) return parseInt(prevContext.data.number) - parseInt(nextContext.data.number);
        if (prevContext.data.number) return -1;
        if (nextContext.data.number) return 1;
        return 0;
    });

    //displaying
    xmlContextController.allXmlContexts.forEach((context, index) => {
        const imageContainer = document.createElement("div");
        const span = document.createElement("span");

        span.innerHTML = index + 1;

        imageContainer.id = `previewImageContainer${index}`;
        imageContainer.tabIndex = "0";
        imageContainer.className = "previewListItem";
        imageContainer.appendChild(context.previewImage);
        imageContainer.appendChild(span);

        previewList.appendChild(imageContainer);
    });

    addEventsToPreviewImages();

    if (!contentEmpty.classList.contains("hidden")) {
        contentEmpty.classList.toggle("hidden");
        contentSelected.classList.toggle("hidden");
    }
}

function inputFileFolderCallback(target) {
    const folder = new Folder(target.files);
    folder.getInputFilesFromFiles();
    const selectedFiles = folder.sortFilesAsFolders();
    filesChanged(selectedFiles);
    const preview = document.getElementById("preview");
    preview.innerHTML = "Select an item above to display data.";
}

inputFileFolder.addEventListener("change", (event) => {
    inputFileFolderCallback(event.target);
});

async function inputFileZipCallback(target) {
    const zipFile = new ZipFile(target.files);
    await zipFile.getInputFilesFromFiles();
    const selectedFiles = zipFile.sortFilesAsFolders();
    filesChanged(selectedFiles);
    const preview = document.getElementById("preview");
    preview.innerHTML = "Select an item above to display data.";
}

inputFileZip.addEventListener("change", async (event) => {
    await inputFileZipCallback(event.target);
});

// Invoke fileInput field by button id: otherButton
const otherFolderButton = document.getElementById("otherFolderButton");
otherFolderButton.addEventListener("click", () => {
    inputFileFolder.click();
});

const otherZipButton = document.getElementById("otherZipButton");
otherZipButton.addEventListener("click", () => {
    inputFileZip.click();
});
