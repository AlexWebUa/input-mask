"use strict";

class TimeMask extends InputMask {
    constructor(properties) {
        super(properties);

        properties.allowSeconds ? this.allowSeconds = properties.allowSeconds : this.allowSeconds = false;
        properties.format ? this.format = properties.format : this.format = "ЧЧ:ММ";

        this.currentValue = properties.currentValue ? properties.currentValue : this.format;
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
                if (currentChar === 'ч' || currentChar === 'м' || currentChar === 'с' ||
                    currentChar === 'h' || currentChar === 'm' || currentChar === 's') {
                    let correct = true;
                    switch (currentChar) {
                        case "ч": case "h":
                            correct = this.controlHours(parseInt(char), index); break;
                        case "м": case "m":
                            correct = this.controlMinutes(parseInt(char), index); break;
                        case "с": case "s":
                            correct = this.controlSeconds(parseInt(char), index); break;
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

            else {
                this.update(index);
            }
        }
        else {
            this.update(index);
        }
    }

    /**
     * Контролирует корректный ввод часов
     *
     * @param {number} digit
     * @param {number} index
     * @return {boolean}
     */
    controlHours(digit, index) {
        let hh;

        if (index === 0) {
            if (digit > 2) return false;
            hh = isDecimal(digit + this.currentValue[1]) ? digit + this.currentValue[1] : false;
        }
        else if (index === 1) {
            hh = isDecimal(this.currentValue[0] + digit) ? this.currentValue[0] + digit : false;
        }

        if (hh) {
           if (hh === "00") {
               let hhMax = "01";
               this.currentValue = this.currentValue.replaceAt(0, hhMax[0]);
               this.currentValue = this.currentValue.replaceAt(1, hhMax[1]);
               this.update(this.input.selectionStart + 1);
               return false;
           }
           else if (hh > 24) {
               let hhMax = "23";
               this.currentValue = this.currentValue.replaceAt(0, hhMax[0]);
               this.currentValue = this.currentValue.replaceAt(1, hhMax[1]);
               this.update(this.input.selectionStart + 1);
               return false;
           }
        }

        return true;
    }

    /**
     * Контролирует корректный ввод минут
     *
     * @param {number} digit
     * @param {number} index
     * @return {boolean}
     */
    controlMinutes(digit, index) {
        let mm;

        if (index === 3) {
            if (digit > 5) return false;
            mm = isDecimal(digit + this.currentValue[4]) ? digit + this.currentValue[4] : false;
        }
        else if (index === 4) {
            mm = isDecimal(this.currentValue[3] + digit) ? this.currentValue[3] + digit : false;
        }

        if (mm) {
            if (mm === "00") {
                let mmMax = "01";
                this.currentValue = this.currentValue.replaceAt(3, mmMax[0]);
                this.currentValue = this.currentValue.replaceAt(4, mmMax[1]);
                this.update(this.input.selectionStart + 1);
                return false;
            }
            else if (mm > 60) {
                let mmMax = "59";
                this.currentValue = this.currentValue.replaceAt(3, mmMax[0]);
                this.currentValue = this.currentValue.replaceAt(4, mmMax[1]);
                return false;
            }
        }

        return true;
    }

    /**
     * Контролирует корректный ввод секунд
     *
     * @param {number} digit
     * @param {number} index
     * @return {boolean}
     */
    controlSeconds(digit, index) {
        let ss;

        if (index === 6) {
            if (digit > 5) return false;
            ss = isDecimal(digit + this.currentValue[7]) ? digit + this.currentValue[7] : false;
        }
        else if (index === 7) {
            ss = isDecimal(this.currentValue[6] + digit) ? this.currentValue[6] + digit : false;
        }

        if (ss) {
            if (ss === "00") {
                let ssMax = "01";
                this.currentValue = this.currentValue.replaceAt(6, ssMax[0]);
                this.currentValue = this.currentValue.replaceAt(7, ssMax[1]);
                this.update(this.input.selectionStart + 1);
                return false;
            }
            else if (ss > 60) {
                let ssMax = "59";
                this.currentValue = this.currentValue.replaceAt(6, ssMax[0]);
                this.currentValue = this.currentValue.replaceAt(7, ssMax[1]);
                return false;
            }
        }

        return true;
    }

    delete() {
        super.delete();
    }

    isValid(date) {
        return new RegExp(/(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/).test(date) || new RegExp(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).test(date);
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
            let hh = date.substring(0,2);
            let mm = date.substring(3,5);
            let ss = date.substring(6);
            let final = hh + ":" + mm;
            final += ss === "" ? "" : ":" + ss;

            return final;
        }
        else return false;
    }

    /**
     * Устанавливает время
     *
     * @param {String} date Время в формате "ЧЧ:ММ[:СС]"
     * @return {boolean}
     * @throws {Error} Если дата передана в неправильном формате или некорректна
     */
    setDate(date) {
        if( this.isValid(date) && date.length === this.format.length ) {
            this.currentValue = date;
            this.update(0);
            return true;
        }
        else throw new Error("Введена неверная дата");
    }
}
