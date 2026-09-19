export default class LoadingBar {
    itemCounter = 0;
    itemTitle = "";
    parentElement;
    titleElement;
    counterElement;
    barElement;
    replaceElement;

    constructor(parentElement, titleElement, counterElement, barElement, replaceElement = undefined) {
        this.replaceElement = replaceElement;
        this.parentElement = parentElement;
        this.titleElement = titleElement;
        this.counterElement = counterElement;
        this.barElement = barElement;

        this.toggle();

        this.setItemCounter();
    }

    setTitle(itemTitle) {
        if (itemTitle) this.itemTitle = itemTitle;
        this.titleElement.innerHTML = this.itemTitle;
    }

    setItemCounter(itemCounter) {
        if (itemCounter) this.itemCounter = itemCounter;
        this.counterElement.innerHTML = this.itemCounter;
    }

    toggle() {
        if (this.replaceElement && !this.replaceElement.classList.contains("hidden")) {
            this.replaceElement.classList.toggle("hidden");
        }

        this.parentElement.classList.toggle("hidden");
    }
}
