/**
 * Заменяет подстроку replacement в строке начиная с символа index
 *
 * @param {number} index С какого симвлоа начнётся замена
 * @param {String} replacement Подстрока, котрая будет вставлена
 * @return {String}
 */
String.prototype.replaceAt = function(index, replacement) {
    return this.slice(0, index) + replacement + this.slice(index + replacement.length);
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
