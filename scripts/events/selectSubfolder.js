import { xmlContextController } from "../XmlContextController.js";

export function addEventsToPreviewImages() {
    xmlContextController.allXmlContexts.forEach((context, index) => {
        context.previewImage.addEventListener("click", (event) => {
            const preview = document.getElementById("preview");
            const fullImage = document.createElement("img");
            fullImage.src = context.previewImage.src;

            const previewImageContainer = document.getElementById(`previewImageContainer${index}`);
            if (!previewImageContainer.classList.contains("selected")) previewImageContainer.classList.toggle("selected");

            xmlContextController.allXmlContexts.forEach((context, index) => {
                const previewImageContainer = document.getElementById(`previewImageContainer${index}`);
                if (event.target !== context.previewImage) {
                    if (previewImageContainer.classList.contains("selected")) previewImageContainer.classList.toggle("selected");
                }
            });

            const subfolderNameH2 = document.createElement("h2");
            subfolderNameH2.textContent = context.previewImage.dataset.subfolder;

            preview.replaceChildren(subfolderNameH2, fullImage);

            xmlContextController.currentXmlContext = context;
            xmlContextController.changeContext();
        });
    });
}
