import { xmlContextController } from "../XmlContextController.js";

export let previewListItems = [];

export function addEventsToPreviewListItems() {
    for (const { image, xmlContext } of previewListItems) {
        image.addEventListener("click", () => {
            const preview = document.getElementById("preview");
            const fullImage = document.createElement("img");
            fullImage.src = image.src;

            const subfolderNameH2 = document.createElement("h2");
            subfolderNameH2.textContent = image.dataset.subfolder;

            if (preview.children.length > 0) {
                preview.replaceChild(subfolderNameH2, preview.firstChild);
                preview.replaceChild(fullImage, preview.lastChild);
            } else {
                preview.appendChild(subfolderNameH2);
                preview.appendChild(fullImage);
            }

            xmlContextController.currentContext = xmlContext;
            xmlContextController.changeContext();
        });
    }
}
