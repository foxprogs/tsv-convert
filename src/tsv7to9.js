const usfmJs = require('usfm-js');
const fs = require('fs');
const srs = require('scripture-resources-rcl/dist/core/selections/selections');
const helper = require('./helper.js');

const bookId = 'PHM';

console.log('Convert from tsv7 to tsv9');

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

let selections = '';
let chapter = 0;
let verse = 0;
let result = [];
for (let i = 1; i < tsv.length; i++) {
  const quote = tsv[i][4];
  const occurence = tsv[i][5];
  if (occurence === '0') {
      result.push(
        [
          bookId,
          tsv[i][0].split(':')?.[0] ?? '',
          tsv[i][0].split(':')?.[1] ?? '',
          tsv[i][1],
          tsv[i][3],
          quote,
          occurence,
          '',
          tsv[i][6],
        ].join('\t')
      );
      continue;
  };
  [chapter, verse] = tsv[i][0].split(':')
  if (!verse || parseInt(verse).toString() !== verse) {
      result.push(
        [
          bookId,
          chapter,
          verse,
          tsv[i][1],
          tsv[i][3],
          quote,
          occurence,
          '',
          tsv[i][6],
        ].join('\t')
      );
      continue;
  };
  const verseObjects = greek.chapters?.[chapter]?.[verse]?.verseObjects;
  selections = srs.selectionsFromQuoteAndVerseObjects({
    quote,
    verseObjects,
    occurence,
  });

  const res = usfm.chapters[chapter][verse].verseObjects.map((el) =>
    helper.parseVerseObject(el, selections)
  );
//Book	Chapter	Verse	ID	SupportReference	OrigQuote	Occurrence	GLQuote	OccurrenceNote
// Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
  result.push(
    [
      bookId,
      chapter,
      verse,
      tsv[i][1],
      tsv[i][3],
      quote,
      occurence,
      helper.formatToString(res),
      tsv[i][6],
    ].join('\t')
  );
}
fs.writeFileSync(
  './res/' + bookId + 'RS.tsv',
  `Book\tChapter\tVerse\tID\tSupportReference\tOrigQuote\tOccurrence\tGLQuote\tOccurrenceNote\n` +
    result.join('\n'),
  'utf8'
);


// сейчас мы получили данные из файлов и преобразовали в объекты
// надо определить, какой файл будет основным
// так как записывать новый контент мы будем в тсв, логично чтобы он был основным
// в цикле мы проходим по каждой строке
// по референсу мы получаем verseObjects
// если occurence равен 0 то просто пропускаем, можно скопировать из quote контент
// если он равен -1, это значит для всех вхождений. Лучшим вариантом будет поставить между вхождениями три точки
// если положительное число, то надо брать нужное вхождение (первое, второе, третье) С одной стороны, на греческом это одно и то же слово, но с другой, перевод может отличаться
// еще в запросе может быть спец символ, три точки или знак амперсанда. это значит не жадный поиск, надо посмотреть как именно на ГЛ языке это раньше отображалось
/**
 * PoC
 * Надо разбить работу на несколько шагов
 * 1. разместить два файла, usfm и tn.tsv7 а на выходе получить файл tn.tsv9.
 * 2. указать две ссылки на дор43
 * 3. попробовать брать из манифеста нужный юсфм
 *
 * Сначала консольное приложение, потом сделать с интерфейсом
 *
 * надо результат сравнивать с прошлой версией из 9 колонок
 *
 * Судя по тому что я проверил, этот контекст работает для греческого текста. То есть ему нужен греческий текст а не перевод. Он в нем находит совпадения, а потому скорее всего уже как-то компонент VerseObject именно для AlignedWord подсвечивает перевод
 * Даже если я к примеру соберу из рлоб только греческий текст, это будет не правильно, так как там вполне может быть изменен порядок слов
 * Ну и нам обязательно нужен компонент Verse и контекст провайдер, для того чтобы все сработало
 * Как мысль, что если нам при рендере добавить data аттрибут с греческим текстом к каждому слову на русском.
 * Кроме этого надо добавить occurence чтобы знать который раз встречается это слово в тексте
 * Затем при открытии заметки мы знаем текущий референс, разбиваем нашу греческую фразу на слова, разбивка будет по пробелу, и начинаем искать совпадения в тексте.
 * Еще одна проблема, что делать если там будут три точки. Что именно мне надо подсветить, все слова или же только те что написаны? Если все, то опять же нужен оригинальный текст, в нем найти все слова и подсветить их так как правильный порядок слов я не смогу восстановить.
 *
 * Надо разобраться, когда вложенные греческие слова, что это такое?
 */
