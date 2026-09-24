/**
 * @class
 * @param {File} file
 * @param {String} [webkitRelativePath]
 */
export default class InputFile {
    constructor(file, webkitRelativePath = undefined) {
        this.name = file.name;
        this.jsFile = file;
        if (file.webkitRelativePath) this.webkitRelativePath = file.webkitRelativePath;
        if (webkitRelativePath) this.webkitRelativePath = webkitRelativePath;
    }
}
