import { xmlContextController } from "../XmlContextController.js";

export function addEventsToPreviewImages() {
    for (const context of xmlContextController.allXmlContexts) {
        context.previewImage.addEventListener("click", () => {
            const preview = document.getElementById("preview");
            const fullImage = document.createElement("img");
            fullImage.src = context.previewImage.src;

            const subfolderNameH2 = document.createElement("h2");
            subfolderNameH2.textContent = context.previewImage.dataset.subfolder;

            if (preview.children.length > 0) {
                preview.replaceChild(subfolderNameH2, preview.firstChild);
                preview.replaceChild(fullImage, preview.lastChild);
            } else {
                preview.appendChild(subfolderNameH2);
                preview.appendChild(fullImage);
            }

            xmlContextController.currentXmlContext = context;
            xmlContextController.changeContext();
        });
    }
}
