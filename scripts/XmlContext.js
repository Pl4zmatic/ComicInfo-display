export default class XmlContext {
    data = {
        title: "",
        series: "",
        volume: "",
        number: "",
        count: "",
        summary: "",
        writer: "",
        publisher: "",
        year: "",
        month: "",
        day: "",
        genre: "",
        tags: "",
        languageiso: "",
        manga: "",
    };

    constructor(folderData, previewImage) {
        this.folderData = folderData;
        this.previewImage = previewImage;
    }

    changeContext(newContext) {
        for (const [key, value] of Object.entries(newContext)) {
            if (this.data[key] != value) {
                this.data[key] = value;
            }
        }
    }

    getKeys() {
        return Object.keys(this.data);
    }

    getXml() {
        const [year = "", month = "", day = ""] = this.data.date.split("-");
        const value = (key) => this.#escapeXml(this.data[key]);

        return `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
    <Title>${value("title")}</Title>
    <Series>${value("series")}</Series>
    <Number>${value("number")}</Number>
    <Volume>${value("volume")}</Volume>
    <Count>${value("count")}</Count>

    <Summary>${value("summary")}</Summary>

    <Writer>${value("writer")}</Writer>
    <Publisher>${value("publisher")}</Publisher>

    <Year>${this.#escapeXml(year)}</Year>
    <Month>${this.#escapeXml(month)}</Month>
    <Day>${this.#escapeXml(day)}</Day>

    <Genre>${value("genre")}</Genre>
    <Tags>${value("tags")}</Tags>

    <LanguageISO>${value("languageiso")}</LanguageISO>
    <Manga>${value("manga")}</Manga>
</ComicInfo>`;
    }

    #escapeXml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&apos;");
    }
}
