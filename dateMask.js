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
                        this.update(this.input.selectionStart - 1);
                    }
                }
                else if (currentChar === this.format[2]) {
                    this.update(this.input.selectionStart + 1);
                    this.insertText(char);
                }
                else {
                    this.update(index);
                }
            }

            else if (char === this.format[2] && currentChar === this.format[2]) {
                this.update(this.input.selectionStart);
            }

            else if (char === "-" && (index === 5 || index === 6)) {
                this.controlMinus();
            }

            else {
                this.update(index);
            }
        } else {
            this.update(index);
        }
    }

    /**
     * Контролирует корректный ввод дней
     *
     * @param {number} digit
     * @param {number} index
     * @return {boolean}
     */
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
                this.update(this.input.selectionStart + 1);
                return false;
            }
            else if (dd === "29" && mm === "02" && (yyyy && yyyy%4 !== 0)) return false;
            else if ((dd !== "29" && mm !== "02") && dd > this.monthRules[mm - 1]) {
                let ddMax = "" + this.monthRules[mm - 1];
                this.currentValue = this.currentValue.replaceAt(0, ddMax[0]);
                this.currentValue = this.currentValue.replaceAt(1, ddMax[1]);
                this.update(this.input.selectionStart + 1);
                return false;
            }
            else if (dd > 31) {
                let ddMax = "31";
                this.currentValue = this.currentValue.replaceAt(0, ddMax[0]);
                this.currentValue = this.currentValue.replaceAt(1, ddMax[1]);
                this.update(this.input.selectionStart + 1);
                return false;
            }
        }

        return true;
    }

    /**
     * Контролирует корректный ввод месяца
     *
     * @param {number} digit
     * @param {number} index
     * @return {boolean}
     */
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
                this.update(this.input.selectionStart + 1);
                return false;
            }
            else if (dd === "29" && mm === "02" && (yyyy && yyyy%4 !== 0)) {
                console.log(dd, mm, yyyy);
                let ddMax = "28";
                this.currentValue = this.currentValue.replaceAt(0, ddMax[0]);
                this.currentValue = this.currentValue.replaceAt(1, ddMax[1]);
                this.update(this.input.selectionStart + 1);
                return false;
            }
            else if ((dd !== "29" && mm !== "02") && dd > this.monthRules[mm - 1]) {
                let ddMax = "" + this.monthRules[mm-1];
                this.currentValue = this.currentValue.replaceAt(0, ddMax[0]);
                this.currentValue = this.currentValue.replaceAt(1, ddMax[1]);
            }
            else if (mm > 12) {
                let mmMax = "12";
                this.currentValue = this.currentValue.replaceAt(3, mmMax[0]);
                this.currentValue = this.currentValue.replaceAt(4, mmMax[1]);
                this.update(this.input.selectionStart + 1);
                return false;
            }
        }

        return true;
    }

    /**
     * Контролирует корректный ввод года
     *
     * @param {number} digit
     * @param {number} index
     * @return {boolean}
     */
    controlYears(digit, index) {
        let dd = this.getDays();
        let mm = this.getMonths();
        let yyyy;
        let yearStart = this.format.indexOf("-") === -1 ? 6 : this.format.indexOf("-") + 1;

        if (index === yearStart) {
            yyyy = digit + this.currentValue[yearStart + 1] + this.currentValue[yearStart + 2] + this.currentValue[yearStart + 3];
            yyyy = isDecimal(yyyy) ? yyyy : false;
        }
        else if (index === yearStart + 1) {
            yyyy = this.currentValue[yearStart] + digit + this.currentValue[yearStart + 2] + this.currentValue[yearStart + 3];
            yyyy = isDecimal(yyyy) ? yyyy : false;
        }
        else if (index === yearStart + 2) {
            yyyy = this.currentValue[yearStart] + this.currentValue[yearStart + 1] + digit + this.currentValue[yearStart + 3];
            yyyy = isDecimal(yyyy) ? yyyy : false;
        }
        else if (index === yearStart + 3) {
            yyyy = this.currentValue[yearStart] + this.currentValue[yearStart + 1] + this.currentValue[yearStart + 2] + digit;
            yyyy = isDecimal(yyyy) ? yyyy : false;
        }

        if (yearStart > 6) {
            yyyy = "-" + yyyy;
        }

        if (dd === "29" && mm === "02" && (yyyy%4 !== 0)) {
            let ddMax = "28";
            this.currentValue = this.currentValue.replaceAt(0, ddMax[0]);
            this.currentValue = this.currentValue.replaceAt(1, ddMax[1]);
        }
        if (yyyy < this.minYear) {
            let yyyyMin = "" + this.minYear;
            console.log(yyyyMin.length);
            for (let i = 0; i < yyyyMin.length; i++) {
                this.currentValue = this.currentValue.replaceAt(yearStart - 1 + i, yyyyMin[i]);
            }
            return false;
        }
        else if (yyyy > this.maxYear) {
            let yyyyMax = "" + this.maxYear;
            for (let i = 0; i < yyyyMax.length; i++) {
                this.currentValue = this.currentValue.replaceAt(yearStart + i, yyyyMax[i]);
            }
            return false;
        }

        return true;
    }

    /**
     * Добавляет поддержку отрицательных годов (до н.э.)
     */
    controlMinus() {
        if (this.format.indexOf("-") === -1) {
            this.format = this.format.insertAt(-4, "-");
            this.currentValue = this.currentValue.insertAt(-4, "-");
            this.update(7);
        }
        else {
            this.update(this.input.selectionStart);
        }
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

    /**
     * @return {string|boolean}
     */
    getDays() {
        let d1 = this.currentValue[0];
        let d2 = this.currentValue[1];
        if (isDecimal(d1) && isDecimal(d2)) return d1 + "" + d2;
        return false;
    }

    /**
     * @return {string|boolean}
     */
    getMonths() {
        let m1 = this.currentValue[3];
        let m2 = this.currentValue[4];
        if (isDecimal(m1) && isDecimal(m2)) return m1 + "" + m2;
        return false;
    }

    /**
     * @return {string|boolean}
     */
    getYears() {
        let yearStart = this.format.indexOf("-") === -1 ? 6 : this.format.indexOf("-") + 1;

        let y1 = this.currentValue[yearStart];
        let y2 = this.currentValue[yearStart+1];
        let y3 = this.currentValue[yearStart+2];
        let y4 = this.currentValue[yearStart+3];
        if (isDecimal(y1) && isDecimal(y2) && isDecimal(y3) && isDecimal(y4)) {
            let years = "" + y1 + y2 + y3 + y4;
            if (yearStart > 6) years = "-" + years;
            return years;
        }
        return false;
    }

    /**
     * Устанавливает дату
     *
     * @param {String} date Дата в формате "ДД.ММ.[-]ГГГГ"
     * @return {boolean}
     * @throws {Error} Если дата передана в неправильном формате или некорректна
     */
    setDate(date) {
        if( this.isValid(date) ) {
            this.currentValue = date;
            if (date.indexOf("-") !== -1) this.format = this.format.insertAt(-4, "-");
            this.update(0);
            return true;
        }
        else throw new Error("Введена неверная дата");
    }
}

//TODO: make it work for UCBrowser
