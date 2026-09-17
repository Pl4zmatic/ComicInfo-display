class XmlTools {
    constructor() {}

    findKeyIndexRange(key, xmlContent) {
        const fromIndex = xmlContent.toLowerCase().indexOf(`<${key}>`) + key.length + 2;
        const toIndex = xmlContent.toLowerCase().indexOf(`</${key}>`);
        return [fromIndex, toIndex];
    }

    getKeyValue(key, xmlContent) {
        const [fromIndex, toIndex] = this.findKeyIndexRange(key, xmlContent);

        if (fromIndex === -1 || toIndex === -1) return "";

        return xmlContent.slice(fromIndex, toIndex);
    }

    getKeyXmlTag(key) {
        const openTag = `<${key}>`;
        const closeTag = `</${key}>`;
        return [openTag, closeTag];
    }

    getKeyFromEditorPosition(position, xmlContent, keys, ...otherKeys) {
        const trackedKeys = [...keys, ...otherKeys];

        for (const key of trackedKeys) {
            const [fromIndex, toIndex] = this.findKeyIndexRange(key, xmlContent);
            const [openTag, closeTag] = this.getKeyXmlTag(key);

            if (fromIndex === -1 || toIndex === -1) continue;

            const valueStart = fromIndex;
            const valueEnd = toIndex;

            if (position >= valueStart && position <= valueEnd) {
                return key;
            }
        }

        return null;
    }
}

export const xmlTools = new XmlTools();
