"use strict";

class InputMask {
    constructor(properties) {
        if (properties.id) {
            this.input = document.getElementById(properties.inputId);
            properties.format ? this.format = properties.format : null;

            this.currentValue = this.format;

            this.hangEvents();
        } else {
            throw new Error("Не указан id");
        }
    }

    hangEvents() {
        this.input.onclick = () => {
            this.input.selectionStart = 0;
            this.input.selectionEnd = 0;
            this.input.onclick = null;
        };
        this.input.oninput = event => this.keyPress(event);
    }

    keyPress(event) {
        if (event.inputType === "deleteContentBackward") {
            this.delete();
        }
        else if (event.inputType === "insertText") {
            this.insertText(event.data);
        }
        else {
            this.update(this.input.selectionStart);
        }
    }

    insertText(char) {
        //stub
    }

    delete() {
        let start = this.input.selectionStart;
        let end = this.input.selectionEnd;
        let index = start - 1;

        if (start === end && index >= 0) { // Удаление одного символа
            this.currentValue[index] = this.format[index];
            this.update(index);
        }

        if (start !== end) { // Удаление выделения
            for (let i = start; i < end; i++) {
                this.currentValue[i] = this.format[i];
            }
            this.update(start);
        }
    }

    isValid(date) {
        //stub
    }

    isEmpty() {
        return this.input.value === this.format;
    }

    isNull(item) {
        return item === null;
    }

    isUndefined(item) {
        return item === undefined;
    }

    isDecimal(item) {
        return new RegExp(/^\d+$/).test(item);
    }

    update(index) {
        this.input.value = this.currentValue;
        this.input.selectionStart = index;
        this.input.selectionEnd = index;
    }

    getDate() {
        //stub
    }

    setDate(date) {
        //stub
    }
}
