export class Building {
    element: HTMLDivElement;
    height: number;
    constructor(height: number) {
        this.height = height;
        this.element = document.createElement("div");
        this.element.classList.add("building");
        for(var i = 0; i < (height/10); i++) {
            const buildingHeightChunk = document.createElement("div");
            this.element.appendChild(buildingHeightChunk);
        }
    }
}