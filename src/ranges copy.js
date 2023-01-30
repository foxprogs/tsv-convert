const usfmJs = require('usfm-js');
const fs = require('fs');
const srs = require('scripture-resources-rcl/dist/core/selections/selections');
const srvo = require('scripture-resources-rcl/dist/core/selections/verseObjects');
const helper = require('./helper.js');

const bookId = 'PHM';

const greekQuote = 'ἡμῶν, καὶ Ἀπφίᾳ';
const rangeOccurrence = -1;

const bcvQuery = {
  book: {
    '1jn': {
      ch: {
        1: {
          v: {
            1: {},
            2: {},
          },
        },
        2: { v: { 5: {} } },
      },
    },
  },
};

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

helper.greekTest.map((el, i) =>
  console.log(i + 1, el.map((elx) => elx.text).join('').trim())
);
console.log()
/**
 * Нам надо объединить несколько стихов
 * Наша задача сведется к тому, что мы должны будем просто пересчитать occurrence и occurrences
 * Первым проходом мы должны получить каждое слово, и сколько раз оно встречается в тексте
 * второй проход - мы переписываем occurrences и так же occurrence. Надо сделать так
 * Нужно запоминать какой стих и сколько тут было этих слов
 * к примеру слово "καὶ" встречается 2 раза в 1ом стихе и 3 раза во втором.
 * καὶ occurrences=2 occurrence=1
 * καὶ occurrences=2 occurrence=2
 * καὶ occurrences=3 occurrence=1
 * καὶ occurrences=3 occurrence=2
 * καὶ occurrences=3 occurrence=3
 * для всех стихов мы переписываем значение occurrences
 * для первого стиха мы occurrence оставляем без изменений
 * для каждого следующего мы к occurrence прибавляем occurrences с прошлых стихов
 */

selections = srs.selectionsFromQuoteAndVerseObjects({
  quote: greekQuote,
  verseObjects: [
    ...helper.greekTest[0],
    ...helper.greekTest[1],
    ...helper.greekTest[2],
  ],
  occurrence: rangeOccurrence,
});

helper.targetTest.map((el, index) =>
  console.log(
    index + 1,
    srs.normalizeString(srvo.verseObjectsToString(helper.targetTest[index]))
  )
);
console.log()

const flattenVerseObjects = (verseObjects, flat = []) => {
  let _verseObjects = [...verseObjects];
  while (_verseObjects.length > 0) {
    const object = _verseObjects.shift();
    if (object) {
      if (object.children) {
        let _objectChildren = [...object.children];
        const _flat = flattenVerseObjects(_objectChildren);
        delete _objectChildren;
        if (object.occurrence) {
          flat.push({
            text: object.text ?? object.content,
            occurrence: object.occurrence,
            occurrences: object.occurrences,
          });
        }
        _flat.forEach((_object) => flat.push(_object));
      } else {
        if (object.occurrence) {
          flat.push({
            text: object.text ?? object.content,
            occurrence: object.occurrence,
            occurrences: object.occurrences,
          });
        }
      }
    }
  }
  return flat;
};

const verses = [
  ...helper.targetTest[0],
  ...helper.targetTest[1],
  ...helper.targetTest[2],
];

const flatten = flattenVerseObjects(verses);

const result = flatten.reduce((prev, curr) => {
  if (!prev[curr.text]) {
    prev[curr.text] = {
      occurrences: 1,
      verseIndex: -1,
      increment: 0,
      preview: 0,
    };
  } else {
    ++prev[curr.text].occurrences;
  }
  return prev;
}, {});

// console.log(JSON.stringify(result, null, 2));

const correctOccurrences = (verseObjects, index) => {
  for (const verseObject of verseObjects) {
    const current = result[verseObject.text ?? verseObject.content];
    if (verseObject?.occurrences) {
      if (current.verseIndex === -1) {
        current.verseIndex = index;
        current.increment = 0;
        current.preview = parseInt(verseObject.occurrences);
      } else if (current.verseIndex !== index) {
        current.verseIndex = index;
        current.increment += current.preview;
        current.preview = parseInt(verseObject.occurrences);
      }
      verseObject.occurrences = current.occurrences.toString();
      verseObject.occurrence = (
        parseInt(verseObject.occurrence) + current.increment
      ).toString();
    }
    if (verseObject?.children) {
      verseObject.children = correctOccurrences(verseObject.children, index);
    }
  }
  return verseObjects;
};

// console.log(JSON.stringify(helper.targetTest[0], null, 2));

const newVal = helper.targetTest.map((verse, index) => {
  return correctOccurrences(verse, index);
});

console.log(
  greekQuote,
  rangeOccurrence,
  helper.formatToString(
    [...newVal[0], ...newVal[1], ...newVal[2]].map((el) =>
      helper.parseVerseObject(el, selections)
    )
  )
);

return;

const i = 5;
const quote = tsv[i][4];
const occurrence = tsv[i][5];
[chapter, verse] = tsv[i][0].split(':');
const greekVerseObjects = greek.chapters?.[chapter]?.[verse]?.verseObjects;
selections = srs.selectionsFromQuoteAndVerseObjects({
  quote,
  verseObjects: greekVerseObjects,
  occurrence,
});
const res = usfm.chapters[chapter][verse].verseObjects.map((el) =>
  helper.parseVerseObject(el, selections)
);

console.log(
  bookId,
  chapter,
  verse,
  quote,
  occurrence,
  helper.formatToString(res)
);

/**
 * Для начала надо попробовать объединить два объекта стиха в один
 * Сложность в пересчете occurrence. Может быть можно попробовать использовать tokenizer или как-то самим
 *
 * Если самим, то вот что надо сделать
 * 1. Можно сделать в 2 прохода. 1ым мы считаем общее количество слов и вторым мы переписываем оккуренсес.
 * Надо ли прописывать для текста на русском...
 * 2. Сейчас я так понял что мы не используем occurrences по этому можно сделать в один проход. Просто прибавлять общее количество с прошлых стихов
 * 3. Сейчас я говорю именно о своей библиотеке, но для юв возможно лучше оставить все теги на своих местах, просто переписать occurrences
 */
