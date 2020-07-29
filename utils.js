/**
 * Заменяет подстроку replacement в строке начиная с символа index
 *
 * @param {number} index
 * @param {String} replacement
 * @return {String} Полученная строка
 */
String.prototype.replaceAt = function(index, replacement) {
    return this.slice(0, index) + replacement + this.slice(index + replacement.length);
}

/**
 * Вставляет подстроку insertion в строку на место index
 *
 * @param {number} index
 * @param {String} insertion
 * @return {string} Полученная строка
 */
String.prototype.insertAt = function(index, insertion) {
    return this.slice(0, index) + insertion + this.slice(index);
}

/**
 * Удаляет символ в указанном месте строки
 *
 * @param index
 * @return {string} Полученная строка
 */
String.prototype.deleteAt = function(index) {
    return this.slice(0, index - 1) + this.slice(index);
}


/**
 * Сравнивает даную переменную с null
 *
 * @param item
 * @return {boolean}
 */
function isNull(item) {
    return item === null;
}


/**
 * Сравнивает даную переменную с null
 *
 * @param item
 * @return {boolean}
 */
function isUndefined(item) {
    return item === undefined;
}

/**
 * Проверяет является ли даная переменная целым числом любой длины
 *
 * @param number
 * @return {boolean}
 */
function isDecimal(number) {
    return new RegExp(/^\d+$/).test(number);
}

/**
 * Проверяет является ли даная переменная буквой
 *
 * @param char
 * @return {boolean}
 */
function isChar(char) {
    return new RegExp(/[a-zA-Z]|[а-яА-Я]/).test(char);
}
