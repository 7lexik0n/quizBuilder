# Quiz Builder

Инструмент, позволяющий быстро верстать опросники различной структуры. Пример с рабочим шаблоном можно найти [здесь](http://public.leadrocktest.com/lexik0n/quizBuilder/).

## Основной макет

Для использования инструмента требуется разметка определенного формата.

``` html
  <div id="{my_quiz_id}">
    <div class="quiz__content">
      <div class="quiz__slide" data-name="{name_1}"></div>
      <div class="quiz__slide" data-name="{name_2}"></div>
      <div class="quiz__slide" data-name="{name_3}"></div>
    </div>
  </div>  
```
Если в опроснике требуются кнопки вперед/назад, необходимо добавить такие блоки:

```html
  <template id="quizControlButtons">
    <div class="quiz__buttonsWrapper">
      <button class="quiz__button quiz__button_previos">Назад</button>
      <button class="quiz__button quiz__button_next">Далее</button>
    </div>
  </template>
  <template id="quizFinishButton">
    <button class="quiz__button quiz__button_finish">Завершить</button>
  </template>
```

Для отображения шкалы прогресса потребуется следующий шаблон:
```html
  <template id="quizProgress">
    <div class="quiz__progress">
      <p>Вопрос <span class="quiz__progress_current">1</span>/<span class="quiz__progress_total">1</span></p>
      <div class="quiz__progress_out">
        <div class="quiz__progress_in"></div>
      </div>
    </div>
  </template>
```

У каждого элемента опроса должно быть имя, задаваемое через атрибут `data-name`. Содержимое внутри элемента квиза можно условно разбить на 4 типа:
* Простой вопрос с единственным вариантом ответа
```html
  <div class="quiz__slide" data-name="name_3">
    <div class="quiz__question">Вопрос 3</div>
    <ul class="quiz__answers">
      <li class="quiz__answer">Ответ 1</li>
      <li class="quiz__answer">Ответ 2</li>
      <li class="quiz__answer">Ответ 3</li>
      <li class="quiz__answer">Ответ 4</li>
    </ul>
  </div>
```
* Вопрос с множеством вариантов ответа. Требуется добавить атрибут `data-multiple="true"`
```html
  <div class="quiz__slide" data-multiple="true" data-name="name_1">
    <div class="quiz__question">Вопрос с множеством ответов, без оценки</div>
    <ul class="quiz__answers">
      <li class="quiz__answer">Вариант 1</li>
      <li class="quiz__answer">Вариант 2</li>
      <li class="quiz__answer">Вариант 3</li>
      <li class="quiz__answer">Вариант 4</li>
    </ul>
  </div>
```
* Форма с инпутами и селектами (подробнее о формах в секции ниже). Для элемента с формой не требуется задавать имя `data-name`.
```html
  <div class="quiz__slide">
    <div class="quiz__question">Ввод данных</div>
    <div class="quiz__answers">
      <div class="inputs__container">
        <div class="form quiz__form">
          <label class="label">Введите имя</label>
          <input name="name" type="text" class="validationInput" placeholder="Имя" data-type="text"
            data-error="Минимум 3 символа" required data-length="3">
          <label class="label">Выберите вариант</label>
          <select class="validationSelect quiz__select" name="age" data-error="Значение не выбрано" required>
            <option value="">Возраст</option>
            <option value="<18">< 18</option>
            <option value="18-30">18-30</option>
            <option value="31-45">31-45</option>
            <option value="46-65">46-65</option>
            <option value="65+">65+</option>
          </select>          
      </div>
    </div>
  </div>
```
* Простой информационный блок. Чтобы от пользователя не требовался ответ, необходимо добавить атрибут `data-points="0"`. Для таких элементов не требуется задавать имя `data-name`.
```html
  <div class="quiz__slide" data-points="0">
    <div class="quiz__question">Вопрос 2</div>
    <ul class="quiz__answers">
      <p>Простой информационный слайд без ответов</p>
    </ul>
  </div>
```
## Формы

В формах опросника ожидаются элементы `input` и `select`. 

### Input элементы

Для input обязательны атрибуты `name`, `type`, `placeholder`, `data-type`. Если элементу требуется валидация, необходимо также добавить атрибут `required` и `data-error="{message}"`, где `{message}` - сообщение, отображаемое в случае, когда input не проходит проверку валидности.
```html
  <input name="name" type="text" class="validationInput" placeholder="Имя" data-type="text" data-error="Минимум 3 символа" required data-length="3">
```

### Select элементы

Для select элементов обязательны атрибуты `name`, `data-error="{message}"`, `required`. Для всех `option` требуется указать занчение `value`, кроме первого, который служит аналогом `placeholder`.

```html
  <select class="validationSelect quiz__select" name="age" data-error="Значение не выбрано" required>
    <option value="">Возраст</option>
    <option value="<18">< 18</option>
    <option value="18-30">18-30</option>
    <option value="31-45">31-45</option>
    <option value="46-65">46-65</option>
    <option value="65+">65+</option>
  </select>
```

### Типы input элементов

На данный момент реализованы следующие типы и проверки к ним: `text`, `number`, `tel`, `email`.

#### Текстовые инпуты

Для текстовых инпутов с `type="text"` возможно указать минимальную длину введенного значения и (опционально) максимальную. Значение задается через атрибут `data-length`.

```html
  <input name="name" type="text" class="validationInput" placeholder="Имя" data-type="text" data-error="Минимум 3 символа" required data-length="3">
  <input name="name" type="text" class="validationInput" placeholder="Имя" data-type="text" data-error="Требуется 3-30 символов" required data-length="3-30">
```

#### Числовые инпуты

Для числовых инпутов с `type="number"` возможно указать минимальное и максимальное значение с помощью атрибутов `data-min` и `data-max` соответственно. Данные атрибуты не являются обязательными, в случае их отсутствия валидатор проверяет только на соответствие числовому типу введенных данных.

```html
  <input name="weight" type="number" class="validationInput" placeholder="Вес" data-type="number" data-error="Недопустимый вес" required data-min="45" data-max="350">
```

#### Телефонные инпуты

Для числовых инпутов с `type="tel"` возможно указать минимальную и максимальную длину номера с помощью атрибутов `data-min` и `data-max` соответственно. В случае их отсутствия будет проводиться проверка с минимальным числом цифр 10.

```html
  <input name="phone" type="tel" class="validationInput" placeholder="Телефон" data-type="tel" data-error="Минимум 10 цифр" required>
```

#### Email инпуты

Для email инпутов с `type="email"` никаких дополнительных атрибутов задавать не требуется.

```html
  <input name="email" type="email" class="validationInput" placeholder="Email" data-type="email" data-error="Недопустимый формат" required>
```

## Использование

После создания основного макета требуется подключить файлы стиля `quiz.min.css` и скрипта `quiz.min.js`. Инициализация производится следующим образом:
```js
buildQuiz(selector, [options]);
```
Здесь `selector` - строка с `id` основного контейнера квиза. Функция `buildQuiz` возвращает главный объект опросника, который можно использовать, например, чтобы проверить правильность ответов. 
`Options` - необязательный параметр, на его место требуется поставить объект с дополнительными параметрами квиза. Все параметры перечислены в таблице ниже

|Параметр|Описание|Значение по умолчанию|Пример|
|:------:|:------:|:------:|:----:|
|progress|Добавляет либо убирает шкалу прогресса. Возможные значения `true`, `false`|`true`|`{progress: true}`
|start|Номер элемента, с которого начинается квиз|1|{start: 2}
|showControls|Добавляет кнопки вперед/назадВозможные значения `true`, `false`|`true`|`{showControls: true}`
|immidiateChoice|Позволяет немедленно переходить к следующему вопросу по нажатию на вариант ответа.Возможные значения `true`, `false`|`false`|`{immidiateChoice: true}`
|answers|В случае, если на вопросы квиза есть верный ответ, и в дальнейшем требуется определить колчество верных, необходимо задать ответы в формате массива с номерами правильных ответов. В случае, если в опроснике имеются вопросы без верного ответа или элементы без ответов вообще (см. типы элементов), - для них в массиве задается пустая строка `''`. Количество элементов в массиве должно совпадать с количеством элементов в опросе. В случае несовпадения генерируется ошибка|`[]`|`{answers: ["", "", 3, "", 4, 1]}`
|onFinish|Функция, которая выполняется в случе нажатия на кнопку "завершить". Принимает параметр, который содержит все ответы пользователя.|`() => {}`|```onFinish: (data) => {console.log(data); window.location.href = "./result.html";}```
|customs|Параметр, который принимает массив кастомных функций для определенных элементов квиза. О кастомных фунцкиях см. ниже|`[]`|```customs: [{slide: 3, next: customFunction}]```

### Кастомные функции

Кастомные функции передаются в объекте дополнительных параметров `options` в свойство `customs` и представляют из себя массив объектов следующего формата:
```js
  {
    slide: 3,
    next: customFunction,
  }
```
В свойстве `slide` пишется номер слайда опросника, в котором требуется применить данную функцию, а в свойстве `next` - непосредственно функция, которая будет выполнена при нажатии на кнопку "далее". Функция принимает объект такой следующей структуры:
```js
  {
    answers, // массив node-элементов ответов, из которого можно определить выбранный пользователем
    element, // node-элемент слайда
    miltiple, // параметр, показывающий, что в слайде возможно несколько ответов 
    name, // имя слайда
    required // параметр, показывающий, что слайд обязателен к ответу
  }
```

## Сохранение данных

Все данные после прохождения опросника сохраняются в json-формате в `localStorage` с именем `quizResult`. Соотвественно, их можно легко получить следующим образом:
```js
  const results = JSON.parse(localStorage.getItem('quizResult'));
```

## Проверка ответов

В случае необходимости, имеется возможность проверить правильность внесенных верных ответов на квиз. Для этого после инициализации необходимо воспользоваться методом `showAnswers`. Вопросы и верные для них ответы (в соотвествии с заданными параметрами) будут выведены в консоль. Пример:
```js
const quiz = buildQuiz(selector, {
  answers: [1, 2, 3];
});
quiz.showAnswers();
```
<img src="https://sun9-29.userapi.com/s/v1/if2/5XPSlCtzb9EUSXnA5uSFquNUko6GRw4APnWKwKz8YJ_oHHDM4QEGc2gJKqsroKSdNpQ1e4Q_-iZcKpEMtmWhiKhu.jpg?size=163x142&quality=96&type=album" width="200" alt="Пример вывода ответов"/>