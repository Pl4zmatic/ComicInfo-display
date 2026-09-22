export default class LoadingBar {
    totalItems = 0;
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
    }

    displayItemTitle() {
        if (this.itemTitle) this.titleElement.innerHTML = this.itemTitle;
        else this.titleElement.innerHTML = "No File name found.";
    }

    displayItemCounter() {
        if (this.itemCounter || this.itemCounter == 0) this.counterElement.innerHTML = this.itemCounter;
    }

    displayItemCounterWithNumerator() {
        let itemCounterString = `${this.itemCounter}`;
        if (this.totalItems) itemCounterString = itemCounterString.concat(` / ${this.totalItems}`);

        this.counterElement.innerHTML = itemCounterString;
    }

    toggle() {
        if (this.replaceElement) {
            this.replaceElement.classList.toggle("hidden");
        }

        this.parentElement.classList.toggle("hidden");
    }
}
