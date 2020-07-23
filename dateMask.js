"use strict";

/**
 * Маска даты
 *
 * @extends InputMask
 * @property {number} minYear Минимально допустимый год
 * @property {number} maxYear Максимально допустимый год
 * @property {boolean} oldFormat
 * @property {String} format Формат и плейсхолдер маски
 * @property {String} currentValue Текущее валидное значение поля
 *
 */
class DateMask extends InputMask {
    constructor(properties) {
        super(properties);

        properties.minYear ? this.minYear = properties.minYear : this.minYear = -4000;
        properties.maxYear ? this.maxYear = properties.maxYear : this.maxYear = 3000;
        properties.oldFormat ? this.oldFormat = properties.oldFormat : this.oldFormat = false;
        properties.format ? this.format = properties.format : this.format = "ДД.ММ.ГГГГ";

        this.currentValue = this.format;
        this.monthRules = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.update(0);
    }

    hangEvents() {
        super.hangEvents();
    }

    keyPress(event) {
        super.keyPress(event);
    }

    insertText(char) {
        let index = this.input.selectionStart - 1;
        if (index >= 0 && index < this.format.length) {
            let currentChar = this.format[index].toLowerCase();
            if (isDecimal(char)) {
                if (currentChar === 'д' || currentChar === 'м' || currentChar === 'г') {
                    let correct = true;
                    switch (currentChar) {
                        case "д": correct = this.controlDays(parseInt(char), index); break;
                        case "м": correct = this.controlMonths(parseInt(char), index); break;
                        case "г": correct = this.controlYears(parseInt(char), index); break;
                    }

                    if(correct) {
                        this.currentValue = this.currentValue.replaceAt(index, char);
                        this.update(index+1);
                    }
                    else {
                        this.update(index);
                    }
                }
                if (currentChar === this.format[2]) {
                    this.update(this.input.selectionStart + 1);
                    this.insertText(char);
                }
            }

            else if (char === this.format[2] && currentChar === this.format[2]) {
                this.update(this.input.selectionStart);
            }

            else {
                this.update(index);
            }
        } else {
            this.update(index);
        }
    }

    controlDays(digit, index) {
        let dd;
        let mm = this.getMonths();
        let yyyy = this.getYears();


        if (index === 0) {
            if (digit > 3) return false;
            dd = isDecimal(digit + this.currentValue[1]) ? digit + this.currentValue[1] : false;
        }
        else if (index === 1) {
            dd = isDecimal(this.currentValue[0] + digit) ? this.currentValue[0] + digit : false;
        }

        if (dd) {
            if (dd === "00") {
                let ddMax = "01";
                this.currentValue = this.currentValue.replaceAt(0, ddMax[0]);
                this.currentValue = this.currentValue.replaceAt(1, ddMax[1]);
                return false;
            }
            else if (dd === "29" && mm === "02" && (yyyy && yyyy%4 !== 0)) return false;
            else if (mm && dd > this.monthRules[mm - 1]) {
                let ddMax = "" + this.monthRules[mm - 1];
                this.currentValue = this.currentValue.replaceAt(0, ddMax[0]);
                this.currentValue = this.currentValue.replaceAt(1, ddMax[1]);
                return false;
            }
            else if (dd > 31) {
                let ddMax = "31";
                this.currentValue = this.currentValue.replaceAt(0, ddMax[0]);
                this.currentValue = this.currentValue.replaceAt(1, ddMax[1]);
                return false;
            }
        }

        return true;
    }

    controlMonths(digit, index) {
        let dd = this.getDays();
        let mm;
        let yyyy = this.getYears();

        if (index === 3) {
            if (digit > 1) return false;
            mm = isDecimal(digit + this.currentValue[4]) ? digit + this.currentValue[4] : false;
        }
        else if (index === 4) {
            mm = isDecimal(this.currentValue[3] + digit) ? this.currentValue[3] + digit : false;
        }

        if(mm) {
            if (mm === "00") {
                let mmMax = "01";
                this.currentValue = this.currentValue.replaceAt(3, mmMax[0]);
                this.currentValue = this.currentValue.replaceAt(4, mmMax[1]);
                return false;
            }
            else if (dd && dd === "29" && mm === "02" && (yyyy && yyyy%4 !== 0)) {
                let ddMax = "28";
                this.currentValue = this.currentValue.replaceAt(0, ddMax[0]);
                this.currentValue = this.currentValue.replaceAt(1, ddMax[1]);
                return false;
            }
            else if (dd && dd > this.monthRules[mm - 1]) {
                let ddMax = "" + this.monthRules[mm-1];
                this.currentValue = this.currentValue.replaceAt(0, ddMax[0]);
                this.currentValue = this.currentValue.replaceAt(1, ddMax[1]);
            }
            else if (mm > 12) {
                let mmMax = "12";
                this.currentValue = this.currentValue.replaceAt(3, mmMax[0]);
                this.currentValue = this.currentValue.replaceAt(4, mmMax[1]);
                return false;
            }
        }

        return true;
    }

    controlYears(digit, index) {
        //TODO: double-check this function
        let yyyy;

        if (index === 6) {
            yyyy = digit + this.currentValue[7] + this.currentValue[8] + this.currentValue[9];
            yyyy = isDecimal(yyyy) ? yyyy : false;
        }
        else if (index === 7) {
            yyyy = this.currentValue[6] + digit + this.currentValue[8] + this.currentValue[9];
            yyyy = isDecimal(yyyy) ? yyyy : false;
        }
        else if (index === 8) {
            yyyy = this.currentValue[6] + this.currentValue[7] + digit + this.currentValue[9];
            yyyy = isDecimal(yyyy) ? yyyy : false;
        }
        else if (index === 9) {
            yyyy = this.currentValue[6] + this.currentValue[7] + this.currentValue[8] + digit;
            yyyy = isDecimal(yyyy) ? yyyy : false;
        }
        if (yyyy < this.minYear) {
            //TODO: add minus support here
        }
        else if (yyyy > this.maxYear) {
            let yyyyMax = "" + this.maxYear;
            this.currentValue = this.currentValue.replaceAt(6, yyyyMax[0]);
            this.currentValue = this.currentValue.replaceAt(7, yyyyMax[1]);
            this.currentValue = this.currentValue.replaceAt(8, yyyyMax[2]);
            this.currentValue = this.currentValue.replaceAt(9, yyyyMax[3]);
            return false;
        }

        return true;
    }

    delete() {
        super.delete();
    }

    isValid(date) {
        if (new RegExp(/^(0?[1-9]|[12][0-9]|3[01])[./\-\\](0?[1-9]|1[012])[./\-\\][ -]?\d{4}$/).test(date)) {
            let dd = parseInt(date.substring(0,2));
            let mm = parseInt(date.substring(3,5));
            let yyyy = parseInt(date.substring(6));

            if (dd > 31) return false;
            if (mm > 12) return false
            if (this.minYear > yyyy || this.maxYear < yyyy) return false;
            if (dd === 29 && mm === 2) {
                if (yyyy%4 !== 0) return false; // 29 февраля в невысокосный год
            }
            else if (dd > this.monthRules[mm - 1]) return false;

            return true;
        }
        else return false;
    }

    isEmpty() {
        return super.isEmpty();
    }

    update(index) {
        super.update(index);
    }

    getDate() {
        let date = this.currentValue;
        if ( this.isValid(date) ) {
            let dd = date.substring(0,2);
            let mm = date.substring(3,5);
            let yyyy = date.substring(6);

            return dd + "." + mm + "." + yyyy;
        }
        else return false;
    }

    getDays() {
        let d1 = this.currentValue[0];
        let d2 = this.currentValue[1];
        if (isDecimal(d1) && isDecimal(d2)) return d1 + "" + d2;
        return false;
    }

    getMonths() {
        let m1 = this.currentValue[3];
        let m2 = this.currentValue[4];
        if (isDecimal(m1) && isDecimal(m2)) return m1 + "" + m2;
        return false;
    }

    getYears() {
        let y1 = this.currentValue[6];
        let y2 = this.currentValue[7];
        let y3 = this.currentValue[8];
        let y4 = this.currentValue[9];
        if (isDecimal(y1) && isDecimal(y2) && isDecimal(y3) && isDecimal(y4))
            return "" + y1 + y2 + y4 + y4;
        return false;
    }

    setDate(date) {
        if( this.isValid(date) ) {
            this.currentValue = date;
            this.update(0);
            return true;
        }
        else throw new Error("Введена неверная дата");
    }
}

//TODO: add minus dates support

/*
"use strict";

class DateMask {
    constructor(props) {
        this.init(props);
    }


    /!* Обрабатывает переданные свойства, и настраивает свойства по-умолчанию *!/
    init(props) {
        if (props.inputId) {
            this.input = document.getElementById(props.inputId);

            props.nullChar ? this.nullChar = props.nullChar : this.nullChar = "_";
            props.splitter ? this.splitter = props.splitter : this.splitter = ".";
            props.oldFormat ? this.oldFormat = props.oldFormat : this.oldFormat = false;
            props.minYear ? this.minYear = props.minYear : this.minYear = -4000;
            props.maxYear ? this.maxYear = props.maxYear : this.maxYear = 3000;
            props.placeholder ? this.placeholder = props.placeholder : this.placeholder = "ДД.ММ.ГГГГ";
            props.errorBlock ? this.errorBlock = props.errorBlock : this.errorBlock = null;

            if (this.oldFormat)
                this.inputShadow = [null, null, this.splitter, null, null, this.splitter, null, null, null, null];
            else
                this.inputShadow = [null, null, this.splitter, null, null, this.splitter, " ", null, null, null, null];
            this.monthRules = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            this.isBC = false;
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


    /!* Цепляет обработчики событий на объект *!/
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


    /!* Обрабатывает все нажатия кнопок в инпуте *!/
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
        } else if (!this.oldFormat && (key === ' ' || key === '-')) { // Если пробел или минус
            if (
                (!isMobile && (this.input.selectionStart === 5 || this.input.selectionStart === 6)) ||
                (isMobile && (this.input.selectionStart === 6 || this.input.selectionStart === 7))
            ) {
                if (this.minYear && this.minYear >= 0) this.inputShadow[6] = " ";
                else this.inputShadow[6] = key;
                isMobile ? document.execCommand("undo") : event.preventDefault();
                this.render(7);
            } else isMobile ? document.execCommand("undo") : event.preventDefault();
        } else if (!isMobile && key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Tab' && key !== 'F5') {
            event.preventDefault();
        } else if (isMobile) {
            document.execCommand("undo");
        }
    }


    /!* Первичная проверка ввода *!/
    typeDigit(key, index) {
        this.isEmpty = false;

        if (this.inputShadow[index] !== this.splitter) {
            if (index === 0 && key < 4) {
                if (key === 0 && this.inputShadow[index + 1] === 0)
                    this.inputShadow[index] = null;
                else
                    this.validate(key, index);
            }

            if (index === 1) {
                if (this.inputShadow[0] < 3) {
                    if (key === 0 && this.inputShadow[index - 1] === 0)
                        this.inputShadow[index] = null;
                    else
                        this.validate(key, index);
                } else if (this.inputShadow[0] === 3 && key < 2) {
                    this.validate(key, index);
                }
            }

            if (index === 3 && key < 2) {
                if (key === 0 && this.inputShadow[index + 1] === 0)
                    this.inputShadow[index] = null;
                else
                    this.validate(key, index);
            }

            if (index === 4) {
                if (this.inputShadow[3] > 0 && key < 3) {
                    this.validate(key, index);
                } else if (this.inputShadow[3] === 0) {
                    this.validate(key, index);
                }
            }

            if (this.oldFormat && index >= 6 && index <= 9) {
                this.validate(key, index);
            }

            if (!this.oldFormat) {
                if (index === 5 || index === 6) {
                    this.typeDigit(key, 7);
                }
                if (index >= 7 && index <= 10) {
                    this.validate(key, index);
                }
            }

        } else {
            this.input.selectionStart = index + 1;
            this.input.selectionEnd = index + 1;
            this.typeDigit(key, this.input.selectionStart);
        }
    }


    /!* Проверка по условиям *!/
    validate(key, index) {
        this.inputShadow[index] = key; // Меняем цифру в теневом представлении
        let currentBlock = this.getCurrentBlock(index);
        let dd;
        let mm;
        let yyyy;
        if (this.inputShadow[0] !== null && this.inputShadow[1] !== null) {
            dd = this.inputShadow[0] * 10 + this.inputShadow[1];
        }
        if (this.inputShadow[3] !== null && this.inputShadow[4] !== null) {
            mm = this.inputShadow[3] * 10 + this.inputShadow[4];
        }
        if (this.oldFormat) {
            if (this.inputShadow[6] !== null && this.inputShadow[7] !== null && this.inputShadow[8] !== null && this.inputShadow[9] !== null) {
                yyyy = parseInt(this.inputShadow.slice(6, 10).join(''));
            }
        } else {
            if (this.inputShadow[7] !== null && this.inputShadow[8] !== null && this.inputShadow[9] !== null && this.inputShadow[10] !== null) {
                yyyy = parseInt(this.inputShadow.slice(7, 11).join(''));
            }
        }




        // Проверяем только что добавленную цифру
        if (currentBlock === 'day') {
            if (dd) {
                if (dd === 29 && mm === 2) { // Проверка на 29 февраля в НЕвысокосный год
                    if (yyyy && yyyy % 4 === 0) {
                        this.render(index + 1);
                    } else if (!yyyy) {
                        this.render(index + 1);
                    } else {
                        this.inputShadow[index] = null;
                    }
                } else if (mm && dd <= this.monthRules[mm - 1]) { // Если подходящее количество дней в месяце
                    this.render(index + 1);
                } else if (mm && dd > this.monthRules[mm - 1]) {
                    this.inputShadow[index] = null;
                } else if (!mm && dd > 31 || dd === "00") {
                    this.inputShadow[index] = null;
                } else {
                    this.render(index + 1);
                }
            } else {
                this.render(index + 1);
            }
        }


        else if (currentBlock === 'month') {
            if (mm) {
                if (dd === 29 && mm === 2) {
                    if (yyyy && yyyy % 4 === 0) { // Проверка на 29 февраля в НЕвысокосный год
                        this.render(index + 1);
                    } else if (!yyyy) {
                        this.render(index + 1);
                    } else {
                        this.inputShadow[index] = null;
                    }
                } else if (dd && dd <= this.monthRules[mm - 1]) {
                    this.render(index + 1);
                } else if (dd && dd > this.monthRules[mm - 1]) {
                    this.inputShadow[index] = null;
                } else if (mm > 12) {
                    this.inputShadow[index] = null;
                } else {
                    this.render(index + 1);
                }
            } else {
                this.render(index + 1);
            }
        }


        else if (currentBlock === 'year') {
            if (yyyy) {
                if (dd === 29 && mm === 2 && yyyy % 4 === 0) { // Проверка на 29 февраля в НЕвысокосный год
                    this.render(index + 1);
                } else if (dd === 29 && mm === 2 && yyyy % 4 !== 0) {
                    this.inputShadow[index] = null;
                } else if (this.minYear && this.maxYear) { // Указаны ограничения годов
                    let checkMin;
                    let checkMax;
                    if (this.oldFormat) {
                        checkMin = parseInt(this.inputShadow.slice(6, 10).map(value => {
                            if (value === null) return 9; else return value
                        }).join(''));
                        checkMax = parseInt(this.inputShadow.slice(6, 10).map(value => {
                            if (value === null) return 0; else return value
                        }).join(''));
                    } else {
                        checkMin = parseInt(this.inputShadow.slice(6, 11).map(value => {
                            if (value === null) return 0; else return value
                        }).join(''));
                        checkMax = checkMin;
                    }
                    let min = this.minYear;
                    let max = this.maxYear;

                    if (this.oldFormat) {
                        if (this.minYear < 0 && this.isBC) {
                            min = 0;
                            max = Math.abs(this.minYear);
                        } else if (this.minYear < 0 && !this.isBC) {
                            min = 0;
                        }
                    }

                    if (checkMin >= min && checkMax <= max) {
                        this.render(index + 1);
                    }
                } else {
                    this.render(index + 1);
                }
            } else if (this.minYear && this.maxYear) { // Указаны ограничения годов
                let checkMin;
                let checkMax;
                if (this.oldFormat) {
                    checkMin = parseInt(this.inputShadow.slice(6, 10).map(value => {
                        if (value === null) return 9; else return value
                    }).join(''));
                    checkMax = parseInt(this.inputShadow.slice(6, 10).map(value => {
                        if (value === null) return 0; else return value
                    }).join(''));
                } else {
                    checkMin = parseInt(this.inputShadow.slice(6, 11).map(value => {
                        if (value === null) return 0; else return value
                    }).join(''));
                    checkMax = checkMin;
                }
                let min = this.minYear;
                let max = this.maxYear;

                if (this.oldFormat) {
                    if (this.minYear < 0 && this.isBC) {
                        min = 0;
                        max = Math.abs(this.minYear);
                    } else if (this.minYear < 0 && !this.isBC) {
                        min = 0;
                    }
                }

                if (checkMin >= min && checkMax <= max) {
                    this.render(index + 1);
                }
            } else {
                this.render(index + 1);
            }
        }




    }


    /!* Обрабатывает бекспейс *!/
    remove() {
        let start = this.input.selectionStart;
        let end = this.input.selectionEnd;
        let index = start - 1;

        if (start === end && index >= 0) { // Удаление одного символа
            if (this.inputShadow[index] !== this.splitter && this.inputShadow[index] !== " " && this.inputShadow[index] !== "-") {
                this.inputShadow[index] = null;
            } else if (this.inputShadow[index] === " " || this.inputShadow[index] === "-") {
                this.inputShadow[index] = " ";
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
                if (this.inputShadow[i] !== this.splitter && this.inputShadow[i] !== " " && this.inputShadow[i] !== "-") {
                    this.inputShadow[i] = null;
                } else if (this.inputShadow[i] === " " || this.inputShadow[i] === "-") {
                    this.inputShadow[i] = " ";
                }
            }
            this.render(start);
        }

        this.isEmpty = this.checkEmpty()
        if (this.isEmpty) this.render(0);
    }


    /!* Отображает теневое представление в инпуте *!/
    render(index) {
        if (this.isEmpty) this.input.value = this.placeholder;
        else {
            this.input.value = null;
            this.inputShadow.map(char => char === null ? this.input.value += this.nullChar : this.input.value += char); // Проходится по массиву и выводит на экран
        }
        this.input.selectionStart = index;
        this.input.selectionEnd = index;
    }


    /!* Проверяет пустой ли теневой массив *!/
    checkEmpty() {
        let etalon;
        this.oldFormat ? etalon = [null, null, this.splitter, null, null, this.splitter, null, null, null, null] : etalon = [null, null, this.splitter, null, null, this.splitter, " ", null, null, null, null];

        for (let i = 0; i < this.inputShadow.length; i++) {
            if (this.inputShadow[i] !== etalon[i]) return false;
        }
        return true;
    }


    /!* Старый переключатель даты до н.э. *!/
    changeBC(value) {
        if (this.oldFormat) {
            this.isBC = value;
        }
    }


    /!* В каком разделе инпута курсос *!/
    getCurrentBlock(index) {
        if (index === 0 || index === 1) {
            return 'day';
        } else if (index === 3 || index === 4) {
            return 'month';
        } else if (index >= 6) {
            return 'year';
        }
    }


    /!* Число ли это *!/
    isDecimal(element) {
        return new RegExp(/^\d+$/).test(element);
    }


    /!* Уведомить об ошибке *!/
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


    /!* Удалить сообщение об ошибке *!/
    clearError() {
        if (this.errorBlock !== null) this.errorBlock.innerHTML = '';
    }


    /!* Переводит теневое представление в объект Date *!/
    getDate(format = true) {
        if (window.simplified) {
            let userInput = moment(this.input.value, 'DD.MM.Y', true);
            this.clearError();
            try {
                if (userInput.isValid()) {
                    this.clearError();
                    let year = userInput.year();
                    if (this.minYear <= year && year <= this.maxYear) {
                        return format ? userInput : userInput.toDate();
                    } else this.displayError("Неверный год");
                } else throw new SyntaxError()
            } catch (e) {
                let invalidAt = userInput.invalidAt();
                switch (invalidAt) {
                    case 0:
                        this.displayError("Неверный год");
                        break;
                    case 1:
                        this.displayError("Неверный месяц");
                        break;
                    case 2:
                        this.displayError("Неверный день");
                        break;
                    default:
                        this.displayError("Неверная дата");
                        break;
                }
            }
        } else {
            if (this.inputShadow.indexOf(null) === -1) {
                let dd = parseInt(this.inputShadow[0]) * 10 + parseInt(this.inputShadow[1]);
                let mm = parseInt(this.inputShadow[3]) * 10 + parseInt(this.inputShadow[4]);
                let yyyy;

                if (this.oldFormat) {
                    yyyy = this.inputShadow.slice(6, 10).join('');
                    if (this.isBC) yyyy = "-" + yyyy;
                } else {
                    yyyy = this.inputShadow.slice(6, 11).join('');
                }

                let date;

                if (format) {
                    if (dd < 10) dd = "0" + dd;
                    if (mm < 10) mm = "0" + mm;
                    date = dd + "." + mm + "." + yyyy;
                } else {
                    dd = parseInt(dd);
                    mm = parseInt(mm) - 1;
                    yyyy = parseInt(yyyy);
                    date = new Date(yyyy, mm, dd);
                    if (yyyy < 100) date.setFullYear(yyyy);
                }

                return date;
            }
        }

        return false; // Можно выбросить исключение исключение, или подсветить ошибку.
    }

    setDate(date) {
        if (new RegExp(/^(0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[012])\.[ -]?\d{4}$/).test(date)) {
            for (let i = 0; i < date.length; i ++) {
                if (this.isDecimal(date[i])) {
                    this.inputShadow[i] = parseInt(date[i]);
                } else if (date[i] === ' ' || date[i] === '-') {
                    this.inputShadow[i] = date[i];
                }
            }
            this.isEmpty = false;
            this.render(0);
        } else {
            console.error('Неверная дата');
        }
        this.render(0);
    }
}

/!* Ручные тесты 13/13
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
* *!/
*/
