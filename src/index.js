const usfmJs = require('usfm-js');
const fs = require('fs');
const srs = require('scripture-resources-rcl/dist/core/selections/selections');
const helper = require('./helper.js');

const bookId = 'PHM';

console.log('Use range');

/**
 * для начала нам надо загрузить 3 файла
 * 1 - tsv с заметками
 * 2 - usfm с текстом на нужном языке
 * 3 - usfm с греческим текстом
 */
const tsvRaw = fs.readFileSync('./res/' + bookId + '.tsv', 'utf8');
const usfmRaw = fs.readFileSync('./res/' + bookId + '.usfm', 'utf8');
const greekRaw = fs.readFileSync('./res/' + bookId + 'G.usfm', 'utf8');

// Конвертируем в формат, удобный для работы
const tsv = tsvRaw.split('\n').map((el) => el.split('\t'));
const usfm = usfmJs.toJSON(usfmRaw);
const greek = usfmJs.toJSON(greekRaw);

// теперь надо пройти в цикле по каждой заметке и получить для нее цитату на целевом языке
console.log(helper.greekTest);
const i = 5;
const quote = tsv[i][4];
const occurence = tsv[i][5];
[chapter, verse] = tsv[i][0].split(':');
const greekVerseObjects = greek.chapters?.[chapter]?.[verse]?.verseObjects;
selections = srs.selectionsFromQuoteAndVerseObjects({
  quote,
  verseObjects: greekVerseObjects,
  occurence,
});
const res = usfm.chapters[chapter][verse].verseObjects.map((el) =>
  helper.parseVerseObject(el, selections)
);

console.log(
  bookId,
  chapter,
  verse,
  quote,
  occurence,
  helper.formatToString(res)
);

/**
 * Для начала надо попробовать объединить два объекта стиха в один
 * Сложность в пересчете occurence. Может быть можно попробовать использовать tokenizer или как-то самим
 *
 * Если самим, то вот что надо сделать
 * 1. Можно сделать в 2 прохода. 1ым мы считаем общее количество слов и вторым мы переписываем оккуренсес.
 * 2. Сейчас я так понял что мы не используем occurences по этому можно сделать в один проход. Просто прибавлять общее количество с прошлых стихов
 * 3. Сейчас я говорю именно о своей библиотеке, но для юв возможно лучше оставить все теги на своих местах, просто переписать occurences
 */
