import InputFile from "./InputFile.js";

export default class Folder {
    constructor(files) {
        this.files = files;
    }

    getInputFilesFromFiles() {
        this.files = Array.from(this.files).map((file) => {
            return new InputFile(file);
        });
    }

    sortFilesAsFolders() {
        const sortedFiles = [];

        const folderNames = new Set(
            this.files.map((file) => {
                const splitFilePath = file.webkitRelativePath.split("/");
                const fileNameIndex = splitFilePath.findIndex((pathPart) => pathPart == file.name);
                return splitFilePath.slice(0, fileNameIndex).join("/");
            }),
        );

        const commonName = Array.from(folderNames).reduce((prevName, nextName) => {
            return nextName.split(prevName)[0];
        });

        folderNames.forEach((folderName, index) => {
            const splitFolderName = folderName.split("/");
            const folderFiles = this.files.filter((file) => {
                const splitFilePath = file.webkitRelativePath.split("/");
                return splitFilePath.includes(splitFolderName[splitFolderName.length - 1]);
            });

            const folder = splitFolderName.length > 1 ? splitFolderName[0] : commonName;
            const subfolder = splitFolderName.length > 1 ? splitFolderName[1] : `${commonName} ${index}`;
            sortedFiles.push({
                folder,
                subfolder,
                files: folderFiles,
            });
        });
        console.log(`Selected Files: ${JSON.stringify(sortedFiles, null, 2)}`);
        this.files = sortedFiles;
        return sortedFiles;
    }
}
