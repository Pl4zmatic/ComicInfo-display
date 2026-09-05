import { previewListItems, addEventsToPreviewListItems } from "./selectSubfolder.js";

// Read Files
const contentEmpty = document.getElementById("contentEmpty");
const contentSelected = document.getElementById("contentSelected");
const files = document.getElementById("fileInput");
const previewList = document.getElementById("previewList");
const preview = document.getElementById("preview");

if (files.files.length > 0) {
    filesChanged(files);
}

function filesChanged(element) {
    const selectedFiles = getSelectedFilesSorted(element.files);

    previewListItems.length = 0; // Clear the previewListItems array before adding new items
    previewList.innerHTML = ""; // Clear the previewList container before adding new items
    preview.innerHTML = ""; // Clear the preview container before adding new items

    selectedFiles.forEach((selectedFile, index) => {
        const image = document.createElement("img");
        image.src = URL.createObjectURL(Array.from(selectedFile.files).find((file) => file.type.startsWith("image/")));
        image.id = `previewImage${index}`;
        image.dataset.subfolder = selectedFile.subfolder;

        previewListItems.push(image);
        previewList.appendChild(image);
    });
    addEventsToPreviewListItems();

    if (!contentEmpty.classList.contains("hidden")) {
        contentEmpty.classList.toggle("hidden");
        contentSelected.classList.toggle("hidden");
    }
}

files.addEventListener("change", (event) => {
    filesChanged(event.target);
});

function getSelectedFilesSorted(selectedFiles) {
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
