const csh = require('scripture-resources-rcl/dist/components/selections/helpers');

const formatToString = (res) => {
  /**
   * надо пройти в цикле по тому что получилось
   * 1. Пропускаем все, пока не попадется первое слово
   * 2. Теперь к слову можно добавлять следующие не пустые строки
   * 3. Если попадается пустая строка, то пропускаем до следующего слова
   * 4. Если есть то ставим три точки и повторяем со 2 пункта
   * 5. Если больше нет слов, то надо все символы убрать, по этому не стоит их прибавлять сразу, собирать лучше
   * Либо такой вариант
   * 1. Пропускем все, пока не попадется элемент, у которого первый символ - спецсимвол
   * 2. Прибавляем к нему все, пока не попадется пустая строка.
   * 3. С этого момента мы запоминаем и проверяем дальше слова.
   * 4. Если больше ничего нет то удаляем все символы, пробелы и т.д., что мы могли добавить
   * 5. Если попалось новое слово, то ставим три точки и добавляем снова все что идет
   */
  let resultString = ''; // это итоговая строка с текстом
  let addon = ''; // тут мы будем собирать все что после слова остается
  // проходим в цикле по каждому слову
  let dotted = false;
  for (const word of res) {
    if (!resultString.length) {
      // если еще нет никаких слов
      if (word[0] === '~') {
        // если это наше слово то добавим его
        resultString = word.slice(1);
      } // если нет то идем дальше
    } else {
      if (word === '') {
        // если это пустое значение, значит при появлении нового слова надо будет поставить три точки
        dotted = true;
        continue;
      }
      if (word[0] === '~') {
        // если это наше слово то
        if (dotted) {
          // если между словами были какие-то другие слова - поставим три точки
          dotted = false;
          addon = '';
          resultString += '... ' + word.slice(1);
        } else {
          // если небыло между словами других слов
          resultString += addon + word.slice(1);
          addon = '';
        }
        continue;
      }
      if (/\w/gi.test(word)) {
        // если это какие-то непривязанные слова то будем ставить три точки
        dotted = true;
      } else {
        // значит тут пробелы, запятые и другие символы
        addon += word;
      }
    }
  }
  return resultString;
};

const parseVerseObject = (verseObject, selections) => {
  switch (verseObject.type) {
    case 'quote':
      if (verseObject.children) {
        return verseObject.children.map((el) =>
          parseVerseObject(el, selections)
        );
      }

      break;
    case 'milestone':
      switch (verseObject.tag) {
        case 'k':
          return verseObject.children.map((el) =>
            parseVerseObject(el, selections)
          );
        case 'zaln':
          if (
            verseObject.children.length === 1 &&
            verseObject.children[0].type === 'milestone'
          ) {
            return parseVerseObject(verseObject.children[0], selections);
          } else {
            if (verseObject.strong) {
              const selected = csh.areSelected({
                words: [verseObject],
                selections,
              });
              return selected
                ? '~' +
                    verseObject.children
                      .map(
                        (_verseObject) =>
                          _verseObject.text || _verseObject.content
                      )
                      .join('')
                : '';
            }
            break;
          }
      }
      break;
    case 'text':
      return verseObject.text;
    case 'word':
      if (verseObject.strong) {
        const selected = csh.areSelected({
          words: [verseObject],
          selections,
        });
        return selected ? '~' + (verseObject.text || verseObject.content) : '';
      }
      break;
  }
  return '';
};

const greekTest = [
  [
    {
      text: 'Παῦλος',
      tag: 'w',
      type: 'word',
      lemma: 'Παῦλος',
      strong: 'G39720',
      morph: 'Gr,N,,,,,NMS,',
    },
    { type: 'text', text: ', ' },
    {
      text: 'δέσμιος',
      tag: 'w',
      type: 'word',
      lemma: 'δέσμιος',
      strong: 'G11980',
      morph: 'Gr,N,,,,,NMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'Χριστοῦ',
      tag: 'w',
      type: 'word',
      lemma: 'χριστός',
      strong: 'G55470',
      morph: 'Gr,N,,,,,GMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'Ἰησοῦ',
      tag: 'w',
      type: 'word',
      lemma: 'Ἰησοῦς',
      strong: 'G24240',
      morph: 'Gr,N,,,,,GMS,',
    },
    { type: 'text', text: ', ' },
    {
      text: 'καὶ',
      tag: 'w',
      type: 'word',
      lemma: 'καί',
      strong: 'G25320',
      morph: 'Gr,CC,,,,,,,,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'Τιμόθεος',
      tag: 'w',
      type: 'word',
      lemma: 'Τιμόθεος',
      strong: 'G50950',
      morph: 'Gr,N,,,,,NMS,',
    },
    { type: 'text', text: ', ' },
    {
      text: 'ὁ',
      tag: 'w',
      type: 'word',
      lemma: 'ὁ',
      strong: 'G35880',
      morph: 'Gr,EP,,,,NMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'ἀδελφὸς',
      tag: 'w',
      type: 'word',
      lemma: 'ἀδελφός',
      strong: 'G00800',
      morph: 'Gr,N,,,,,NMS,',
    },
    { type: 'text', text: '; ' },
    {
      text: 'Φιλήμονι',
      tag: 'w',
      type: 'word',
      lemma: 'Φιλήμων',
      strong: 'G53710',
      morph: 'Gr,N,,,,,DMS,',
    },
    { type: 'text', text: ', ' },
    {
      text: 'τῷ',
      tag: 'w',
      type: 'word',
      lemma: 'ὁ',
      strong: 'G35880',
      morph: 'Gr,EA,,,,DMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'ἀγαπητῷ',
      tag: 'w',
      type: 'word',
      lemma: 'ἀγαπητός',
      strong: 'G00270',
      morph: 'Gr,AR,,,,DMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'καὶ',
      tag: 'w',
      type: 'word',
      lemma: 'καί',
      strong: 'G25320',
      morph: 'Gr,CC,,,,,,,,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'συνεργῷ',
      tag: 'w',
      type: 'word',
      lemma: 'συνεργός',
      strong: 'G49040',
      morph: 'Gr,NS,,,,DMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'ἡμῶν',
      tag: 'w',
      type: 'word',
      lemma: 'ἐγώ',
      strong: 'G14730',
      morph: 'Gr,RP,,,1G,P,',
    },
    { type: 'text', text: ',\n\n' },
  ],
  [
    ({
      text: 'καὶ',
      tag: 'w',
      type: 'word',
      lemma: 'καί',
      strong: 'G25320',
      morph: 'Gr,CC,,,,,,,,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'Ἀπφίᾳ',
      tag: 'w',
      type: 'word',
      lemma: 'Ἀπφία',
      strong: 'G06820',
      morph: 'Gr,N,,,,,DFS,',
    },
    { type: 'text', text: ', ' },
    {
      text: 'τῇ',
      tag: 'w',
      type: 'word',
      lemma: 'ὁ',
      strong: 'G35880',
      morph: 'Gr,EA,,,,DFS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'ἀδελφῇ',
      tag: 'w',
      type: 'word',
      lemma: 'ἀδελφή',
      strong: 'G00790',
      morph: 'Gr,N,,,,,DFS,',
    },
    { type: 'text', text: ', ' },
    {
      text: 'καὶ',
      tag: 'w',
      type: 'word',
      lemma: 'καί',
      strong: 'G25320',
      morph: 'Gr,CC,,,,,,,,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'Ἀρχίππῳ',
      tag: 'w',
      type: 'word',
      lemma: 'Ἄρχιππος',
      strong: 'G07510',
      morph: 'Gr,N,,,,,DMS,',
    },
    { type: 'text', text: ', ' },
    {
      text: 'τῷ',
      tag: 'w',
      type: 'word',
      lemma: 'ὁ',
      strong: 'G35880',
      morph: 'Gr,EA,,,,DMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'συνστρατιώτῃ',
      tag: 'w',
      type: 'word',
      lemma: 'συνστρατιώτης',
      strong: 'G49610',
      morph: 'Gr,N,,,,,DMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'ἡμῶν',
      tag: 'w',
      type: 'word',
      lemma: 'ἐγώ',
      strong: 'G14730',
      morph: 'Gr,RP,,,1G,P,',
    },
    { type: 'text', text: ', ' },
    {
      text: 'καὶ',
      tag: 'w',
      type: 'word',
      lemma: 'καί',
      strong: 'G25320',
      morph: 'Gr,CC,,,,,,,,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'τῇ',
      tag: 'w',
      type: 'word',
      lemma: 'ὁ',
      strong: 'G35880',
      morph: 'Gr,EA,,,,DFS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'κατ’',
      tag: 'w',
      type: 'word',
      lemma: 'κατά',
      strong: 'G25960',
      morph: 'Gr,P,,,,,A,,,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'οἶκόν',
      tag: 'w',
      type: 'word',
      lemma: 'οἶκος',
      strong: 'G36240',
      morph: 'Gr,N,,,,,AMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'σου',
      tag: 'w',
      type: 'word',
      lemma: 'σύ',
      strong: 'G47710',
      morph: 'Gr,RP,,,2G,S,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'ἐκκλησίᾳ',
      tag: 'w',
      type: 'word',
      lemma: 'ἐκκλησία',
      strong: 'G15770',
      morph: 'Gr,N,,,,,DFS,',
    },
    { type: 'text', text: ':\n\n' }),
  ],
  [
    ({
      text: 'χάρις',
      tag: 'w',
      type: 'word',
      lemma: 'χάρις',
      strong: 'G54850',
      morph: 'Gr,N,,,,,NFS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'ὑμῖν',
      tag: 'w',
      type: 'word',
      lemma: 'σύ',
      strong: 'G47710',
      morph: 'Gr,RP,,,2D,P,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'καὶ',
      tag: 'w',
      type: 'word',
      lemma: 'καί',
      strong: 'G25320',
      morph: 'Gr,CC,,,,,,,,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'εἰρήνη',
      tag: 'w',
      type: 'word',
      lemma: 'εἰρήνη',
      strong: 'G15150',
      morph: 'Gr,N,,,,,NFS,',
    },
    { type: 'text', text: ', ' },
    {
      text: 'ἀπὸ',
      tag: 'w',
      type: 'word',
      lemma: 'ἀπό',
      strong: 'G05750',
      morph: 'Gr,P,,,,,G,,,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'Θεοῦ',
      tag: 'w',
      type: 'word',
      lemma: 'θεός',
      strong: 'G23160',
      morph: 'Gr,N,,,,,GMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'Πατρὸς',
      tag: 'w',
      type: 'word',
      lemma: 'πατήρ',
      strong: 'G39620',
      morph: 'Gr,N,,,,,GMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'ἡμῶν',
      tag: 'w',
      type: 'word',
      lemma: 'ἐγώ',
      strong: 'G14730',
      morph: 'Gr,RP,,,1G,P,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'καὶ',
      tag: 'w',
      type: 'word',
      lemma: 'καί',
      strong: 'G25320',
      morph: 'Gr,CC,,,,,,,,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'Κυρίου',
      tag: 'w',
      type: 'word',
      lemma: 'κύριος',
      strong: 'G29620',
      morph: 'Gr,N,,,,,GMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'ἡμῶν',
      tag: 'w',
      type: 'word',
      lemma: 'ἐγώ',
      strong: 'G14730',
      morph: 'Gr,RP,,,1G,P,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'Ἰησοῦ',
      tag: 'w',
      type: 'word',
      lemma: 'Ἰησοῦς',
      strong: 'G24240',
      morph: 'Gr,N,,,,,GMS,',
    },
    { type: 'text', text: ' ' },
    {
      text: 'Χριστοῦ',
      tag: 'w',
      type: 'word',
      lemma: 'χριστός',
      strong: 'G55470',
      morph: 'Gr,N,,,,,GMS,',
    },
    { type: 'text', text: '.\n\n' },
    { tag: 'p', nextChar: '\n', type: 'paragraph' }),
  ],
];

const targetTest = [
  [
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G39720',
      lemma: 'Παῦλος',
      morph: 'Gr,N,,,,,NMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Παῦλος',
      children: [
        {
          text: 'Павел',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ', ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G11980',
      lemma: 'δέσμιος',
      morph: 'Gr,N,,,,,NMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'δέσμιος',
      children: [
        {
          text: 'узник',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G24240',
      lemma: 'Ἰησοῦς',
      morph: 'Gr,N,,,,,GMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Ἰησοῦ',
      children: [
        {
          text: 'Христа',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G55470',
      lemma: 'χριστός',
      morph: 'Gr,N,,,,,GMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Χριστοῦ',
      children: [
        {
          text: 'Иисуса',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ', ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G25320',
      lemma: 'καί',
      morph: 'Gr,CC,,,,,,,,',
      occurrence: '1',
      occurrences: '2',
      content: 'καὶ',
      children: [
        {
          text: 'и',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G35880',
      lemma: 'ὁ',
      morph: 'Gr,EP,,,,NMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'ὁ',
      children: [
        {
          tag: 'zaln',
          type: 'milestone',
          strong: 'G00800',
          lemma: 'ἀδελφός',
          morph: 'Gr,N,,,,,NMS,',
          occurrence: '1',
          occurrences: '1',
          content: 'ἀδελφὸς',
          children: [
            {
              text: 'брат',
              tag: 'w',
              type: 'word',
              occurrence: '1',
              occurrences: '1',
            },
          ],
          endTag: 'zaln-e\\*',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G50950',
      lemma: 'Τιμόθεος',
      morph: 'Gr,N,,,,,NMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Τιμόθεος',
      children: [
        {
          text: 'Тимофей',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' - ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G35880',
      lemma: 'ὁ',
      morph: 'Gr,EA,,,,DMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'τῷ',
      children: [
        {
          tag: 'zaln',
          type: 'milestone',
          strong: 'G00270',
          lemma: 'ἀγαπητός',
          morph: 'Gr,AR,,,,DMS,',
          occurrence: '1',
          occurrences: '1',
          content: 'ἀγαπητῷ',
          children: [
            {
              text: 'любимому',
              tag: 'w',
              type: 'word',
              occurrence: '1',
              occurrences: '1',
            },
          ],
          endTag: 'zaln-e\\*',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G53710',
      lemma: 'Φιλήμων',
      morph: 'Gr,N,,,,,DMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Φιλήμονι',
      children: [
        {
          text: 'Филимону',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ', ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G14730',
      lemma: 'ἐγώ',
      morph: 'Gr,RP,,,1G,P,',
      occurrence: '1',
      occurrences: '1',
      content: 'ἡμῶν',
      children: [
        {
          text: 'нашему',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G25320',
      lemma: 'καί',
      morph: 'Gr,CC,,,,,,,,',
      occurrence: '2',
      occurrences: '2',
      content: 'καὶ',
      children: [
        {
          text: 'же',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G49040',
      lemma: 'συνεργός',
      morph: 'Gr,NS,,,,DMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'συνεργῷ',
      children: [
        {
          text: 'сотруднику',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ', \n' },
  ],
  [
    ({
      tag: 'zaln',
      type: 'milestone',
      strong: 'G25320',
      lemma: 'καί',
      morph: 'Gr,CC,,,,,,,,',
      occurrence: '1',
      occurrences: '3',
      content: 'καὶ',
      children: [
        {
          text: 'и',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '3',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G35880',
      lemma: 'ὁ',
      morph: 'Gr,EA,,,,DFS,',
      occurrence: '1',
      occurrences: '2',
      content: 'τῇ',
      children: [
        {
          tag: 'zaln',
          type: 'milestone',
          strong: 'G00790',
          lemma: 'ἀδελφή',
          morph: 'Gr,N,,,,,DFS,',
          occurrence: '1',
          occurrences: '1',
          content: 'ἀδελφῇ',
          children: [
            {
              text: 'сестре',
              tag: 'w',
              type: 'word',
              occurrence: '1',
              occurrences: '1',
            },
          ],
          endTag: 'zaln-e\\*',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G06820',
      lemma: 'Ἀπφία',
      morph: 'Gr,N,,,,,DFS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Ἀπφίᾳ',
      children: [
        {
          text: 'Апфии',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ', ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G25320',
      lemma: 'καί',
      morph: 'Gr,CC,,,,,,,,',
      occurrence: '2',
      occurrences: '3',
      content: 'καὶ',
      children: [
        {
          text: 'и',
          tag: 'w',
          type: 'word',
          occurrence: '2',
          occurrences: '3',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G07510',
      lemma: 'Ἄρχιππος',
      morph: 'Gr,N,,,,,DMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Ἀρχίππῳ',
      children: [
        {
          text: 'Архипу',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ', ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G35880',
      lemma: 'ὁ',
      morph: 'Gr,EA,,,,DMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'τῷ',
      children: [
        {
          tag: 'zaln',
          type: 'milestone',
          strong: 'G49610',
          lemma: 'συνστρατιώτης',
          morph: 'Gr,N,,,,,DMS,',
          occurrence: '1',
          occurrences: '1',
          content: 'συνστρατιώτῃ',
          children: [
            {
              text: 'соратнику',
              tag: 'w',
              type: 'word',
              occurrence: '1',
              occurrences: '1',
            },
          ],
          endTag: 'zaln-e\\*',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G14730',
      lemma: 'ἐγώ',
      morph: 'Gr,RP,,,1G,P,',
      occurrence: '1',
      occurrences: '1',
      content: 'ἡμῶν',
      children: [
        {
          text: 'нашему',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ', ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G25320',
      lemma: 'καί',
      morph: 'Gr,CC,,,,,,,,',
      occurrence: '3',
      occurrences: '3',
      content: 'καὶ',
      children: [
        {
          text: 'и',
          tag: 'w',
          type: 'word',
          occurrence: '3',
          occurrences: '3',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G35880',
      lemma: 'ὁ',
      morph: 'Gr,EA,,,,DFS,',
      occurrence: '2',
      occurrences: '2',
      content: 'τῇ',
      children: [
        {
          tag: 'zaln',
          type: 'milestone',
          strong: 'G15770',
          lemma: 'ἐκκλησία',
          morph: 'Gr,N,,,,,DFS,',
          occurrence: '1',
          occurrences: '1',
          content: 'ἐκκλησίᾳ',
          children: [
            {
              text: 'церкви',
              tag: 'w',
              type: 'word',
              occurrence: '1',
              occurrences: '1',
            },
          ],
          endTag: 'zaln-e\\*',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G25960',
      lemma: 'κατά',
      morph: 'Gr,P,,,,,A,,,',
      occurrence: '1',
      occurrences: '1',
      content: 'κατ’',
      children: [
        {
          text: 'в',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G47710',
      lemma: 'σύ',
      morph: 'Gr,RP,,,2G,S,',
      occurrence: '1',
      occurrences: '1',
      content: 'σου',
      children: [
        {
          text: 'твоём',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G36240',
      lemma: 'οἶκος',
      morph: 'Gr,N,,,,,AMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'οἶκόν',
      children: [
        {
          text: 'доме',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ': \n' }),
  ],
  [
    ({
      tag: 'zaln',
      type: 'milestone',
      strong: 'G54850',
      lemma: 'χάρις',
      morph: 'Gr,N,,,,,NFS,',
      occurrence: '1',
      occurrences: '1',
      content: 'χάρις',
      children: [
        {
          text: 'Благодать',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G47710',
      lemma: 'σύ',
      morph: 'Gr,RP,,,2D,P,',
      occurrence: '1',
      occurrences: '1',
      content: 'ὑμῖν',
      children: [
        {
          text: 'вам',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G25320',
      lemma: 'καί',
      morph: 'Gr,CC,,,,,,,,',
      occurrence: '1',
      occurrences: '2',
      content: 'καὶ',
      children: [
        {
          text: 'и',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '2',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G15150',
      lemma: 'εἰρήνη',
      morph: 'Gr,N,,,,,NFS,',
      occurrence: '1',
      occurrences: '1',
      content: 'εἰρήνη',
      children: [
        {
          text: 'мир',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G05750',
      lemma: 'ἀπό',
      morph: 'Gr,P,,,,,G,,,',
      occurrence: '1',
      occurrences: '1',
      content: 'ἀπὸ',
      children: [
        {
          text: 'от',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G23160',
      lemma: 'θεός',
      morph: 'Gr,N,,,,,GMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Θεοῦ',
      children: [
        {
          text: 'Бога',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G39620',
      lemma: 'πατήρ',
      morph: 'Gr,N,,,,,GMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Πατρὸς',
      children: [
        {
          text: 'Отца',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G14730',
      lemma: 'ἐγώ',
      morph: 'Gr,RP,,,1G,P,',
      occurrence: '1',
      occurrences: '2',
      content: 'ἡμῶν',
      children: [
        {
          text: 'нашего',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '2',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G25320',
      lemma: 'καί',
      morph: 'Gr,CC,,,,,,,,',
      occurrence: '2',
      occurrences: '2',
      content: 'καὶ',
      children: [
        {
          text: 'и',
          tag: 'w',
          type: 'word',
          occurrence: '2',
          occurrences: '2',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G29620',
      lemma: 'κύριος',
      morph: 'Gr,N,,,,,GMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Κυρίου',
      children: [
        {
          text: 'Господа',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G14730',
      lemma: 'ἐγώ',
      morph: 'Gr,RP,,,1G,P,',
      occurrence: '2',
      occurrences: '2',
      content: 'ἡμῶν',
      children: [
        {
          text: 'нашего',
          tag: 'w',
          type: 'word',
          occurrence: '2',
          occurrences: '2',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G24240',
      lemma: 'Ἰησοῦς',
      morph: 'Gr,N,,,,,GMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Ἰησοῦ',
      children: [
        {
          text: 'Иисуса',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: ' ' },
    {
      tag: 'zaln',
      type: 'milestone',
      strong: 'G55470',
      lemma: 'χριστός',
      morph: 'Gr,N,,,,,GMS,',
      occurrence: '1',
      occurrences: '1',
      content: 'Χριστοῦ',
      children: [
        {
          text: 'Христа',
          tag: 'w',
          type: 'word',
          occurrence: '1',
          occurrences: '1',
        },
      ],
      endTag: 'zaln-e\\*',
    },
    { type: 'text', text: '. \n' }),
  ],
];

module.exports.greekTest = greekTest;
module.exports.targetTest = targetTest;
module.exports.formatToString = formatToString;
module.exports.parseVerseObject = parseVerseObject;
