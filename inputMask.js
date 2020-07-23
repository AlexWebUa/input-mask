"use strict";

/**
 * Абстрактный класс маски инпута
 *
 * @property {String} id ID инпута
 */
class InputMask {
    /**
     * Задаёт общие поля для масок
     *
     * @param {object} properties
     * @throws {Error} Если не указан id поля
     */
    constructor(properties) {
        if (properties.id) {
            this.input = document.getElementById(properties.id);
            properties.format ? this.format = properties.format : null;

            this.currentValue = this.format;

            this.hangEvents();
        } else {
            throw new Error("Не указан id");
        }
    }

    /**
     * Вешает обработчики событий на объект
     */
    hangEvents() {
        this.input.onclick = () => {
            this.input.selectionStart = 0;
            this.input.selectionEnd = 0;
            this.input.onclick = null;
        };
        this.input.oninput = event => this.keyPress(event);
    }

    /**
     * Определяет нажатую клавишу, и вызывает соответствующий обработчик
     *
     * @param {Event} event
     */
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

    /**
     * Определяет поведение маски при вводе любого символа
     *
     * @param {String} char
     */
    insertText(char) {}

    /**
     * Определяет поведение маски при нажатии "Backspace"
     */
    delete() {
        //TODO: не работате удаление выделенной части
        let index = this.input.selectionStart;

        if(this.input.value === "") {
            this.currentValue = this.format;
            this.update(0);
        }
        if (index >= 0) {
            this.currentValue = this.currentValue.replaceAt(index, this.format[index]);
            this.update(index);
        }
        this.update(index);
    }

    /**
     * Валидирует дату
     *
     * @param {String} date
     * @return {boolean}
     */
    isValid(date) {}

    /**
     * Проверяет введено ли что-то в инпут
     *
     * @return {boolean}
     */
    isEmpty() {
        return this.input.value === this.format;
    }

    /**
     * Обновляет содержимое инпута
     *
     * @param {number} index Куда встанет курсор после обновления
     */
    update(index) {
        this.input.value = this.currentValue;
        this.input.selectionStart = index;
        this.input.selectionEnd = index;
    }

    /**
     * Возвращает дату в формате "ДД.ММ.ГГГГ"
     *
     * @return {String|boolean}
     */
    getDate() {}

    /**
     * Устанавливает значение инпута
     *
     * @param date Дата в формате "ДД.ММ.ГГГГ"
     */
    setDate(date) {}
}
