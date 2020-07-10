"use strict";

class Mask {
    constructor(props) {
        this.init(props);
    }


    /* Обрабатывает переданные свойства, и настраивает свойства по-умолчанию */
    init(props) {
        if (props.inputId) {
            this.input = document.getElementById(props.inputId);

            props.nullChar ? this.nullChar = props.nullChar : this.nullChar = "_";
            props.splitter ? this.splitter = props.splitter : this.splitter = ".";
            props.oldFormat ? this.oldFormat = props.oldFormat : this.oldFormat = false;
            props.minYear ? this.minYear = props.minYear : this.minYear = -4000;
            props.maxYear ? this.maxYear = props.maxYear : this.maxYear = 3000;
            props.placeholder ? this.placeholder = props.placeholder : this.placeholder = "ДД.ММ.ГГГГ";

            if (this.oldFormat)
                this.inputShadow = [null, null, this.splitter, null, null, this.splitter, null, null, null, null];
            else
                this.inputShadow = [null, null, this.splitter, null, null, this.splitter, " ", null, null, null, null];
            this.monthRules = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            this.isBC = false;
            this.isEmpty = true;

            this.hangEvents();
            this.render();
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
        this.input.oninput = event => this.keyPress(event);
    }


    /* Обрабатывает все нажатия кнопок в инпуте */
    keyPress(event) {
        let key;
        if (event.inputType === "deleteContentBackward") key = "Backspace";
        else if (event.inputType === "deleteContentForward") key = "Delete";
        else if (event.inputType === "insertText") key = event.data;

        if (this.isDecimal(key)) {
            document.execCommand("undo"); // oninput не поддерживает event.preventDefault();
            key = parseInt(key);
            this.typeDigit(key, this.input.selectionStart);
        } else if (key === 'Backspace') {
            document.execCommand("undo");
            this.remove();
        } else if (!this.oldFormat && (key === ' ' || key === '-')) {

            if (this.input.selectionStart === 7 || this.input.selectionStart === 6) { // Должно быть 5 и 6, а не 6 и 7 !?
                console.log("here");
                document.execCommand("undo");
                if (this.minYear && this.minYear >= 0) this.inputShadow[6] = " ";
                else this.inputShadow[6] = key;
                this.render(7);
            } else document.execCommand("undo");
        } else {
            document.execCommand("undo");
        }
    }


    /* Первичная проверка ввода */
    typeDigit(key, index) {
        this.isEmpty = false;

        if (this.inputShadow[index] !== this.splitter) {
            if (index === 0 && key < 4) {
                if(key === 0 && this.inputShadow[index+1] === 0)
                    this.inputShadow[index] = null;
                else
                    this.validate(key, index);
            }

            if (index === 1) {
                if (this.inputShadow[0] < 3) {
                    if(key === 0 && this.inputShadow[index-1] === 0)
                        this.inputShadow[index] = null;
                    else
                        this.validate(key, index);
                } else if (this.inputShadow[0] === 3 && key < 2) {
                    this.validate(key, index);
                }
            }

            if (index === 3 && key < 2) {
                if(key === 0 && this.inputShadow[index+1] === 0)
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


    /* Проверка по условиям */
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
                    console.log('nulllll')
                    this.inputShadow[index] = null;
                } else {
                    this.render(index + 1);
                }
            } else {
                this.render(index + 1);
            }
        } else if (currentBlock === 'month') {
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
        } else if (currentBlock === 'year') {
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


    /* Обрабатывает бекспейс */
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
        if(this.isEmpty) this.render(0);
    }


    /* Отображает теневое представление в инпуте */
    render(index) {
        if (this.isEmpty) this.input.value = this.placeholder;
        else {
            this.input.value = null;
            this.inputShadow.map(char => char === null ? this.input.value += this.nullChar : this.input.value += char); // Проходится по массиву и выводит на экран
        }
        this.input.selectionStart = index;
        this.input.selectionEnd = index;
    }


    /* Проверяет пустой ли теневой массив */
    checkEmpty() {
        let etalon;
        this.oldFormat ? etalon = [null, null, this.splitter, null, null, this.splitter, null, null, null, null] : etalon = [null, null, this.splitter, null, null, this.splitter, " ", null, null, null, null];

        for (let i = 0; i < this.inputShadow.length; i++) {
            if (this.inputShadow[i] !== etalon[i]) return false;
        }
        return true;
    }


    /* Старый переключатель даты до н.э. */
    changeBC(value) {
        if (this.oldFormat) {
            this.isBC = value;
        }
    }


    /* В каком разделе инпута курсос */
    getCurrentBlock(index) {
        if (index === 0 || index === 1) {
            return 'day';
        } else if (index === 3 || index === 4) {
            return 'month';
        } else if (index >= 6) {
            return 'year';
        }
    }


    /* Число ли это */
    isDecimal(element) {
        return new RegExp(/^\d+$/).test(element);
    }


    /* Переводит теневое представление в объект Date */
    getDate() {
        if (!this.inputShadow.includes(null)) {
            let dd = parseInt(this.inputShadow[0] * 10 + this.inputShadow[1]);
            let mm = parseInt(this.inputShadow[3] * 10 + this.inputShadow[4]) - 1;
            let yyyy;

            if (this.oldFormat) {
                yyyy = parseInt(this.inputShadow.slice(6, 10).join(''));
                if (this.isBC) yyyy *= -1;
            } else {
                yyyy = parseInt(this.inputShadow.slice(6, 11).join(''));
            }

            let date = new Date(yyyy, mm, dd);
            if (yyyy < 100) date.setFullYear(yyyy);
            return date;
        }

        return false; // Можно выбросить исключение исключение, или подсветить ошибку.
    }
}