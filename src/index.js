const usfmJs = require('usfm-js');
const fs = require('fs');
const srs = require('scripture-resources-rcl/dist/core/selections/selections');
const srr = require('scripture-resources-rcl/dist/core/selections/tokenizer');
const csh = require('scripture-resources-rcl/dist/components/selections/helpers');
const vots = require('scripture-resources-rcl/dist/core/selections/verseObjects');
console.log('Convert from tsv7 to tsv9');
const tsvRaw = fs.readFileSync('./res/3JN.tsv', 'utf8');
const usfmRaw = fs.readFileSync('./res/3JN.usfm', 'utf8');
const tsv = tsvRaw.split('\n').map(el => el.split('\t'))
const usfm = usfmJs.toJSON(usfmRaw);
const quote = tsv[3][4];
const verseObjects = usfm.chapters['1']['2'].verseObjects;
const occurence = tsv[3][5];
//console.log({tsv,usfm});
//console.log(tsv[3][4], tsv[3][5], usfm.chapters['1']['1'].verseObjects);
// console.log(
//     vots.verseObjectsToString(usfm.chapters['1']['1'].verseObjects)
// );
const newVerseObjects = verseObjects.map(el => (delete el.strong, delete el.lemma, delete el.morph, el?.children))
console.log(JSON.stringify(newVerseObjects));
// console.log(JSON.stringify(verseObjects));
// console.log('flattenVerseObjects', vots.flattenVerseObjects(verseObjects));
// console.log('occurrenceInjectVerseObjects', vots.occurrenceInjectVerseObjects(verseObjects));
// console.log('verseObjectsToString', vots.verseObjectsToString(verseObjects));
// console.log(
//   srr.tokenizer(vots.verseObjectsToString(usfm.chapters['1']['1'].verseObjects))
// );
// console.log(csh.selectionsFromQuote({ quote, verseObjects, occurence }));
// console.log(
//   srr.tokenizer(srs.normalizeString(
//     vots.verseObjectsToString(usfm.chapters['1']['1'].verseObjects)
//   ))
// );
//console.log(srr.selectionsFromQuoteAndVerseObjects(tsv[3][4],usfm.chapters['1']['1'].verseObjects,tsv[3][5],));
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
