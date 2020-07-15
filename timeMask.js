"use strict";

class TimeMask {
    constructor(props) {
        this.init(props);
    }


    /* Обрабатывает переданные свойства, и настраивает свойства по-умолчанию */
    init(props) {
        if (props.inputId) {
            this.input = document.getElementById(props.inputId);

            props.nullChar ? this.nullChar = props.nullChar : this.nullChar = "_";
            props.splitter ? this.splitter = props.splitter : this.splitter = ":";
            props.allowSeconds ? this.allowSeconds = props.allowSeconds : this.allowSeconds = false;
            props.placeholder ? this.placeholder = props.placeholder : this.placeholder = "ЧЧ:ММ";
            props.errorBlock ? this.errorBlock = props.errorBlock : this.errorBlock = null;

            if (this.allowSeconds) {
                this.inputShadow = [null, null, this.splitter, null, null, this.splitter, null, null];
                this.placeholder = "ЧЧ:ММ:СС";
            } else {
                this.inputShadow = [null, null, this.splitter, null, null];
                this.placeholder = "ЧЧ:ММ";
            }

            this.isEmpty = true;

            if (window.simplified) {
                //do nothing
            } else {
                this.hangEvents();
                this.render();
            }
        } else {
            console.error("Неверный id тега");
        }

    }


    /* Цепляет обработчики событий на объект */
    hangEvents() {
        this.input.onclick = () => {
            this.input.selectionStart = 0;
            this.input.selectionEnd = 0;
            this.input.onclick = null;
        };
        if (!isMobile)
            this.input.onkeydown = key => this.keyPress(key);
        else
            this.input.oninput = event => this.keyPress(event);
    }


    /* Обрабатывает все нажатия кнопок в инпуте */
    keyPress(event) {
        let key;
        if (isMobile) {
            if (event.inputType === "deleteContentBackward") key = "Backspace";
            else if (event.inputType === "deleteContentForward") key = "Delete";
            else if (event.inputType === "insertText") key = event.data;
        } else
            key = event.key;

        if (this.isDecimal(key)) { // Если цифра
            isMobile ? document.execCommand("undo") : event.preventDefault();
            key = parseInt(key);
            this.typeDigit(key, this.input.selectionStart);
        } else if (key === 'Backspace') { // Если бекспейс
            isMobile ? document.execCommand("undo") : event.preventDefault();
            this.remove();
        } else if (!isMobile && key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Tab' && key !== 'F5') {
            event.preventDefault();
        } else if (isMobile) {
            document.execCommand("undo");
        }
    }


    /* Первичная проверка ввода */
    typeDigit(key, index) {
        this.isEmpty = false;

        if (this.inputShadow[index] !== this.splitter) {
            if (index === 0) {
                if (key <= 2) {
                    if (key !== 2 || key === 2 && this.inputShadow[1] < 4)
                        this.validate(key, index);
                    else
                        this.inputShadow[index] = null;
                } else
                    this.inputShadow[index] = null;
            }
            if (index === 1) {
                if (this.inputShadow[0] < 2)
                    this.validate(key, index);
                else if (key <= 3)
                    this.validate(key, index);
                else
                    this.inputShadow[index] = null;
            }
            if (index === 3) {
                if (key <= 5)
                    this.validate(key, index);
                else
                    this.inputShadow[index] = null;
            }
            if (index === 4) {
                this.validate(key, index);
            }
            if (this.allowSeconds) {
                if (index === 6) {
                    if (key <= 5)
                        this.validate(key, index);
                    else
                        this.inputShadow[index] = null;
                }
                if (index === 7) {
                    this.validate(key, index);
                }
            }
        } else {
            this.input.selectionStart = index + 1;
            this.input.selectionEnd = index + 1;
            this.typeDigit(key, this.input.selectionStart);
        }
    }


    /* Проверка по условиям */
    validate(key, index) {
        this.inputShadow[index] = key; // Меняем цифру в теневом представлении
        this.render(index + 1);
    }


    /* Обрабатывает бекспейс */
    remove() {
        let start = this.input.selectionStart;
        let end = this.input.selectionEnd;
        let index = start - 1;

        if (start === end && index >= 0) { // Удаление одного символа
            if (this.inputShadow[index] !== this.splitter) {
                this.inputShadow[index] = null;
            } else {
                this.input.selectionStart--;
                this.input.selectionEnd--;
                this.remove();
            }
            this.render(index);
        }

        if (start !== end) { // Если выделено несколько цифр
            for (let i = start; i <= end - 1; i++) {
                if (i < 0) i = 0;
                if (this.inputShadow[i] !== this.splitter) {
                    this.inputShadow[i] = null;
                }
            }
            this.render(start);
        }

        this.isEmpty = this.checkEmpty()
        if (this.isEmpty) this.render(0);
    }


    /* Отображает теневое представление в инпуте */
    render(index) {
        if (this.isEmpty) this.input.value = this.placeholder;

        else {
            this.input.value = null;
            /* Если нужно сделать маску вида ЧЧ:ММ:СС
            for (let i = 0; i < this.inputShadow.length; i++) {
                if (this.inputShadow[i] === null) {
                    this.input.value +=
                        (i === 0 || i === 1) ? "Ч" :
                            (i === 3 || i === 4) ? "М" :
                                (i === 6 || i === 7) ? "С" : ":";
                } else if (this.inputShadow[i] !== ":") {
                    this.input.value += this.inputShadow[i];
                } else this.input.value += ":";
            }*/
            this.inputShadow.map(char => char === null ? this.input.value += this.nullChar : this.input.value += char); // Проходится по массиву и выводит на экран
        }
        this.input.selectionStart = index;
        this.input.selectionEnd = index;
    }


    /* Проверяет пустой ли теневой массив */
    checkEmpty() {
        let etalon;
        this.allowSeconds ? etalon = [null, null, this.splitter, null, null, this.splitter, null, null] : etalon = [null, null, this.splitter, null, null];

        for (let i = 0; i < this.inputShadow.length; i++) {
            if (this.inputShadow[i] !== etalon[i]) return false;
        }
        return true;
    }


    /* Число ли это */
    isDecimal(element) {
        return new RegExp(/^\d+$/).test(element);
    }


    /* Уведомить об ошибке */
    displayError(message) {
        if (this.errorBlock === null) {
            let eb = document.createElement("span");
            let id = "error_" + this.input.id;
            eb.setAttribute("id", id);
            eb.innerHTML = message;
            eb.style.color = 'red';

            this.input.after(eb);
            this.errorBlock = document.getElementById(id);
        } else this.errorBlock.innerHTML = message;
    }


    /* Удалить сообщение об ошибке */
    clearError() {
        if (this.errorBlock !== null) this.errorBlock.innerHTML = '';
    }


    /* Переводит теневое представление в объект Date */
    getDate(format = true) {
        if (window.simplified) {
            this.clearError();
            let isValid = false;
            if (this.allowSeconds) isValid = new RegExp(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/).test(this.input.value);
            else isValid = new RegExp(/(?:[01]\d|2[0123]):(?:[012345]\d)/).test(this.input.value)
            if (isValid) {
                this.clearError();

                let hh = parseInt(this.input.value[0]) * 10 + parseInt(this.input.value[1]);
                let mm = parseInt(this.input.value[3]) * 10 + parseInt(this.input.value[4]);
                let ss = "00";
                if (this.allowSeconds) ss = parseInt(this.input.value[6]) * 10 + parseInt(this.input.value[7]);

                let date;

                if(format) {
                    if (hh < 10) hh = "0" + hh;
                    if (mm < 10) mm = "0" + mm;
                    if (ss < 10) ss = "0" + ss;

                    date = hh + this.splitter + mm;
                    if (this.allowSeconds) date += this.splitter + ss;
                } else {
                    date = new Date();
                    date.setHours(hh);
                    date.setMinutes(mm);
                    if (this.allowSeconds) date.setSeconds(parseInt(ss));
                }

                return date;
            } else this.displayError("Неверно введено время!");
        } else {
            if (this.inputShadow.indexOf(null) === -1) {
                let hh = parseInt(this.input.value[0]) * 10 + parseInt(this.input.value[1]);
                let mm = parseInt(this.input.value[3]) * 10 + parseInt(this.input.value[4]);
                let ss = "00";
                if (this.allowSeconds) ss = parseInt(this.input.value[6]) * 10 + parseInt(this.input.value[7]);

                let date;

                if(format) {
                    if (hh < 10) hh = "0" + hh;
                    if (mm < 10) mm = "0" + mm;
                    if (ss < 10) ss = "0" + ss;

                    date = hh + this.splitter + mm;
                    if (this.allowSeconds) date += this.splitter + ss;
                } else {
                    date = new Date();
                    date.setHours(hh);
                    date.setMinutes(mm);
                    if (this.allowSeconds) date.setSeconds(parseInt(ss));
                }

                return date;
            }
        }

        return false; // Можно выбросить исключение исключение, или подсветить ошибку.
    }

    setDate(date) {
        if (new RegExp(/(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/).test(date) ||
            new RegExp(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).test(date)
        ) {
            for (let i = 0; i < date.length; i ++) {
                if (this.isDecimal(date[i]))
                    this.inputShadow[i] = date[i];
            }
            this.isEmpty = false;
            this.render(0);
        } else {
            console.error('Неверная дата');
        }
        this.render(0);
    }
}

/* Ручные тесты 13/13
*
* Chrome 85.0.4183.16 pass 68.58%
* Firefox 78.0.2 pass 7.91%
* Edge 83.0.478.61 pass 6.85%
* Opera 69.0.3686.57 pass 1.27%
* UCBrowser 7.0.185.1002 pass 0.37%
* IE 11 pass 6.14%
*
* Mobile Chrome 83.0.4103.106 pass 63.85%
* Mobile Samsung Browser 3.20% pass
* Mobile Opera 58.2.2878.53403 pass 0.50%
* Mobile Edge pass 0.02%
* Mobile Android browser pass 0.69%
* Mobile UCBrowser 13.2.5.1300 pass 1.09%
* Mobile Firefox 68.10.1 pass 0.73%
*
* SAFARI? 3.72%
* Mobile SAFARI? 26.77%
*
* */
