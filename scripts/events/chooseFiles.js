import { addEventsToPreviewImages } from "./selectSubfolder.js";
import XmlContext from "../xmlContext.js";
import { xmlContextController } from "../XmlContextController.js";
import { xmlTools } from "../xmlTools.js";
import JSZip from "https://esm.sh/jszip";

// Read Files
const contentEmpty = document.getElementById("contentEmpty");
const contentSelected = document.getElementById("contentSelected");
const files = document.getElementById("fileInput");
const previewList = document.getElementById("previewList");
const preview = document.getElementById("preview");
const spanFolderName = document.getElementById("spanFolderName");

if (files.files.length > 0) {
    filesChanged(files);
}

async function extractZipFiles(fileList) {
    const extractedFiles = [];

    for (const file of fileList) {
        const fileName = file.name.toLowerCase();
        const isArchive = fileName.endsWith(".zip") || fileName.endsWith(".cbz");

        if (!isArchive) {
            extractedFiles.push(file);
            continue;
        }

        const archiveRootName = file.name.replace(/\.(zip|cbz)$/i, "");
        const zip = await JSZip.loadAsync(file);

        for (const zipEntry of Object.values(zip.files)) {
            if (zipEntry.dir) continue;

            const fileBlob = await zipEntry.async("blob");
            const relativePath = zipEntry.name.replace(/^\/+/, "");
            const fileNameFromArchive = relativePath.split("/").pop();
            const syntheticPath = `${archiveRootName}/${relativePath}`;

            const extractedFile = new File([fileBlob], fileNameFromArchive, {
                type: fileBlob.type || "application/octet-stream",
            });
            extractedFile.webkitRelativePath = syntheticPath;
            extractedFiles.push(extractedFile);
        }
    }

    return extractedFiles;
}

async function filesChanged(element) {
    const normalizedFiles = await extractZipFiles(element.files);
    const folders = getSelectedFilesSortedAsFolders(normalizedFiles);

    xmlContextController.allXmlContexts.length = 0;
    previewList.innerHTML = ""; // Clear the previewList container before adding new items
    spanFolderName.innerHTML = folders[0].folder;

    //parsing
    folders.forEach((folder) => {
        const image = document.createElement("img");
        image.src = URL.createObjectURL(Array.from(folder.files).find((file) => file.type.startsWith("image/")));
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

files.addEventListener("change", async (event) => {
    await filesChanged(event.target);
    const preview = document.getElementById("preview");
    preview.innerHTML = "Select an item above to display data.";
});

function getSelectedFilesSortedAsFolders(selectedFiles) {
    const sortedFiles = [];
    const folderNames = new Set(Array.from(selectedFiles).map((file) => file.webkitRelativePath.split("/").slice(0, 2).join("/")));
    for (const folderName of folderNames) {
        const folderFiles = Array.from(selectedFiles).filter((file) => file.webkitRelativePath.startsWith(folderName));

        sortedFiles.push({
            folder: folderName.split("/")[0],
            subfolder: folderName.split("/")[1],
            files: folderFiles,
        });
    }
    console.log(`Selected Files: ${JSON.stringify(sortedFiles, null, 2)}`);
    return sortedFiles;
}

// Invoke fileInput field by button id: otherButton
const otherButton = document.getElementById("otherButton");
otherButton.addEventListener("click", () => {
    files.click();
});

async function parseExistingComicInfoToContext(comicInfoFile, xmlContext) {
    for (const key of xmlContext.getKeys()) {
        const fileContentString = await comicInfoFile.text();
        xmlContext.data[key] = xmlTools.getKeyValue(key, fileContentString);
    }
}
