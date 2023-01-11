const usfmJs = require('usfm-js');
const fs = require('fs');
const srr = require('scripture-resources-rcl/dist/core/selections/selections');
const vots = require('scripture-resources-rcl/dist/core/selections/verseObjects');
console.log('Convert from tsv7 to tsv9');
const tsvRaw = fs.readFileSync('./res/3JN.tsv', 'utf8');
const usfmRaw = fs.readFileSync('./res/3JN.usfm', 'utf8');
const tsv = tsvRaw.split('\n').map(el => el.split('\t'))
const usfm = usfmJs.toJSON(usfmRaw);
//console.log({tsv,usfm});
//console.log(tsv[3][4], tsv[3][5], usfm.chapters['1']['1'].verseObjects);
console.log(
    vots.verseObjectsToString(usfm.chapters['1']['1'].verseObjects)
);
console.log(
  srr.normalizeString(
    vots.verseObjectsToString(usfm.chapters['1']['1'].verseObjects)
  )
);
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
 */
