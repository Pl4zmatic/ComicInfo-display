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
                console.log(file.name);
                const fileNameIndex = splitFilePath.findIndex((pathPart) => pathPart == file.name);
                console.log(fileNameIndex);
                return splitFilePath.slice(0, fileNameIndex).join("/");
            }),
        );

        for (const folderName of folderNames) {
            const folderFiles = this.files.filter((file) => file.webkitRelativePath.startsWith(folderName));

            sortedFiles.push({
                folder: folderName.split("/")[0],
                subfolder: folderName.split("/")[1],
                files: folderFiles,
            });
        }
        console.log(`Selected Files: ${JSON.stringify(sortedFiles, null, 2)}`);
        this.files = sortedFiles;
        return sortedFiles;
    }
}
