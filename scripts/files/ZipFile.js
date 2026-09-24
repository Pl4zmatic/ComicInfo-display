import Folder from "./Folder.js";
import JSZip from "https://esm.sh/jszip";
import InputFile from "./InputFile.js";

export default class ZipFile extends Folder {
    constructor(files) {
        super(files);
    }

    async getInputFilesFromFiles() {
        this.files = await this.#extractZipFiles(this.files);
    }

    async #extractZipFiles(fileList) {
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
                    type: fileBlob.type || this.#inferTypeFromName(relativePath),
                });
                const extractedInputFile = new InputFile(extractedFile, syntheticPath);
                extractedFiles.push(extractedInputFile);
            }
        }

        return extractedFiles;
    }

    #inferTypeFromName(name) {
        const lower = name.toLowerCase();

        if (lower.endsWith(".json")) return "application/json";
        if (lower.endsWith(".txt")) return "text/plain";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".xml")) return "application/xml";
        return "application/octet-stream";
    }
}
