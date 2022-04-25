// новый тип слайда - form - который собирает формы в групповой класс и получает данные о валидности - доп проверка при нажатии на кнопку далее

class Quiz {
  constructor(
    selector,
    {
      progress = true,
      start = 1,
      showControls = true,
      immidiateChoice = false,
      speed = 350,
      onFinish = () => {},
      customs = [],
      answers = [],
    }
  ) {
    this.element = document.querySelector(selector);
    this.progress = progress;
    this.active = start;
    this.answers = answers;
    this.showControls = showControls;
    this.progress = progress;
    this.immidiateChoice = immidiateChoice;
    this.speed = speed;
    this.points = 0;
    this.result = {};
    this.callback = onFinish;
    this.customs = customs;
    this.testType = answers.length > 0 ? "points" : "free";

    this.render();
    this.initForms();
    this.addEvents();
  }

  render() {
    this.slides = [...this.element.querySelectorAll(".quiz__slide")].map(
      (slide) => ({
        element: slide,
        required: slide.dataset.points !== "0",
        multiple: Boolean(slide.dataset.multiple),
        name: slide.dataset.name,
      })
    );
    this.length = this.slides.length;

    if (this.testType === "points") {
      this.checkAnswers();
    }

    this.setProps();

    if (this.showControls) {
      this.renderButtons();
    }

    if (this.progress) {
      this.renderProgress();
    }

    this.show(this.active);
  }

  renderButtons() {
    const buttonsTemplate = document.querySelector("#quizControlButtons");

    this.slides.forEach((slide) => {
      const buttonsClone = buttonsTemplate.content.cloneNode(true);
      const prevButton = buttonsClone.querySelector(".quiz__button_previos");
      const nextButton = buttonsClone.querySelector(".quiz__button_next");

      slide.element.appendChild(buttonsClone);

      if (this.index(slide) === 1) {
        prevButton.remove();
      }

      if (this.index(slide) === this.length) {
        nextButton.remove();
        const finishButtonTemplate =
          document.querySelector("#quizFinishButton");
        const finishButton = finishButtonTemplate.content.cloneNode(true);
        const buttonsWrapper = slide.element.querySelector(
          ".quiz__buttonsWrapper"
        );
        buttonsWrapper.appendChild(finishButton);
      }
    });
  }

  initForms() {
    this.slides.forEach(this.initForm);
  }

  initForm(slide) {
    const forms = [...slide.element.querySelectorAll(".quiz__form")];

    if (forms.length > 0) {
      slide.forms = forms.map((form) => {
        return validationForm(form);
      });
    }
  }

  renderProgress() {
    const progressTemplate = document.querySelector("#quizProgress");
    const progressClone = progressTemplate.content.cloneNode(true);

    this.element.insertBefore(
      progressClone,
      this.element.querySelector(".quiz__content")
    );

    this.pagination = {
      current: this.element.querySelector(".quiz__progress_current"),
      total: this.element.querySelector(".quiz__progress_total"),
    };
    this.progressBar = this.element.querySelector(".quiz__progress_in");

    if (this.progress) {
      this.drawProgress(this.active);
    }
  }

  drawProgress(newValue) {
    this.pagination.current.innerText = newValue;
    this.pagination.total.innerText = this.length;
    this.progressBar.style.width = `${((100 * newValue) / this.length).toFixed(
      2
    )}%`;
  }

  show(index) {
    this.slide(index).element.classList.add("quiz__slide_active");
  }

  setProps() {
    this.slides.forEach((slide, index) => {
      slide.element.dataset.slide = index + 1;
      slide.answers = [...slide.element.querySelectorAll(".quiz__answer")];
      slide.answers.forEach(
        (answer, index) => (answer.dataset.index = index + 1)
      );
    });
  }

  slide(num) {
    return this.slides.find((slide) => +slide.element.dataset.slide === num);
  }

  index(slide) {
    return +slide.element.dataset.slide;
  }

  addEvents() {
    this.element.addEventListener("click", this.onSlideClick);
    this.addCustomEvents();
  }

  addCustomEvents() {
    this.customs.forEach((custom) => {
      if (!this.slide(custom.slide)) {
        return;
      }

      if (custom.next) {
        const nextButton = this.slide(custom.slide).element.querySelector(
          ".quiz__button_next"
        );

        nextButton.addEventListener("click", () =>
          custom.next(this.slide(custom.slide))
        );
      }
    });
  }

  onSlideClick = (evt) => {
    if (evt.target.closest(".quiz__answer")) {
      const answerElement = evt.target.closest(".quiz__answer");
      const answerIndex = +answerElement.dataset.index;
      const slideElement = answerElement.closest(".quiz__slide");
      const slideIndex = +slideElement.dataset.slide;

      if (this.slide(slideIndex).multiple) {
        answerElement.classList.toggle("quiz__answer_choosen");
        const checkbox = this.result[this.active] || {};

        if (checkbox) {
          checkbox[answerIndex] = checkbox[answerIndex]
            ? !checkbox[answerIndex]
            : true;
        } else {
          checkbox[answerIndex] = true;
        }

        this.result[this.active] = { ...this.result[this.active], ...checkbox };
      } else {
        this.clearChoice(slideElement);
        answerElement.classList.add("quiz__answer_choosen");
        this.result[this.active] = answerIndex;

        if (this.immidiateChoice) {
          this.goToSlide(this.active + 1);
        }
      }
    }

    if (evt.target.closest(".quiz__button_next")) {      
      const result = this.result[this.active];
      const slide = this.slide(this.active);
      const isRequired = slide.required;
      const isMultiple = slide.multiple;
      const isHasForms = slide.forms;

      if (!isRequired) {
        this.goToSlide(this.active + 1);
        return;
      }

      if (isHasForms) {
        if (!this.isFormsValid(slide)) {
          this.showFormsErrors(slide);
        } else {
          this.goToSlide(this.active + 1);
        }
        
        return;
      }

      if (isRequired) {
        if (isMultiple && this.isMultipleChoosen(result)) {
          this.goToSlide(this.active + 1);
          return;
        }
        if (!isMultiple && result) {
          this.goToSlide(this.active + 1);
        }
      }

      return;
    }

    if (evt.target.closest(".quiz__button_previos")) {
      this.goToSlide(this.active - 1);
    }

    if (evt.target.closest(".quiz__button_finish")) {
      if (this.testType === "points") {
        this.checkPoints();
      }
      this.storeResults();
      this.callback({...this.result, formData: this.getFormData()});
    }
  };

  showFormsErrors(slide) {
    slide.forms.forEach(form => form.showErrors());
  }

  isFormsValid(slide) {
    return slide.forms.every((form) => form.isValid());
  }

  isMultipleChoosen(obj = {}) {
    return Object.keys(obj).some((key) => obj[key]);
  }

  goToSlide(newIndex) {
    if (newIndex <= 0 || newIndex > this.length) {
      return;
    }

    this.slide(this.active).element.classList.add("hidding");
    this.slide(newIndex).element.classList.add("showing");

    if (this.progress) {
      this.drawProgress(newIndex);
    }    

    setTimeout(() => {
      this.slide(this.active).element.classList.remove("quiz__slide_active");
      this.slide(this.active).element.classList.remove("hidding");
      this.active = newIndex;
      this.slide(this.active).element.classList.add("quiz__slide_active");
      this.slide(this.active).element.classList.remove("showing");
    }, this.speed);
  }

  clearChoice(slide) {
    const choosen = slide.querySelector(".quiz__answer_choosen");
    if (choosen) {
      choosen.classList.remove("quiz__answer_choosen");
    }
  }

  checkAnswers() {
    if (!Array.isArray(this.answers)) {
      throw new Error("Answers must be an array type!");
    }

    if (this.slides.length !== this.answers.length) {
      throw new Error(`Length of slides must be equal to questions's length`);
    }
  }

  showAnswers() {
    this.answers.forEach((answer, index) => {
      if (!this.slides[index].required || this.slides[index].multiple || this.slides[index].forms) {
        return;
      }

      const answerElement = this.slides[index].answers.find(
        (el) => +el.dataset.index === answer
      );
      const questionElement =
        this.slides[index].element.querySelector(".quiz__question");

      console.log(`${index + 1}. ${questionElement.textContent}`);
      console.log(`${answerElement.textContent}`);
    });
  }

  checkPoints() {
    this.points = [...this.answers].reduce((acc, answer, index) => {
      if (this.result[index + 1] && this.result[index + 1] === answer) {
        acc += 1;
      }
      return acc;
    }, 0);
  }

  getFormData() {
    const formData = this.slides.map(slide => {
      if (slide.forms) {
        return slide.forms.map(form => form.getValues()).reduce((acc, el) => ({...acc, ...el}), {});
      } else {
        return null;
      }
    });

    return formData.filter(el => el != null).reduce((acc, el) => ({...acc, ...el}), {});
  }

  storeResults() {
    const results = Object.entries(this.result)
      .map(([index, answerIndex]) => {
        const slideElement = this.slide(+index);
        const name = slideElement.name;
        const questionElement =
          slideElement.element.querySelector(".quiz__question");

        const result = {
          name,
          question: questionElement.textContent,
        };

        if (typeof answerIndex === "number") {
          const answerElement = slideElement.answers.find(
            (answer) => +answer.dataset.index === answerIndex
          );

          result.choice = answerElement.textContent;
        } else {
          const answerElements = slideElement.answers.filter((answer) =>
            answer.classList.contains("quiz__answer_choosen")
          );

          result.choice = answerElements.map((element) => element.textContent);
        }

        return result;
      })
      .reduce(
        (acc, result) => ({
          ...acc,
          [result.name]: {
            question: result.question,
            choice: result.choice,
          },
        }),
        {}
      );

    results.testType = this.testType;

    if (results.testType === "points") {
      const total = this.answers.filter(
        (answer) => typeof answer === "number"
      ).length;

      results.stats = {
        points: this.points,
        percent: ((100 * this.points) / total).toFixed(2),
        total,
      };
    }

    results.formsData = this.getFormData();

    const jsonResults = JSON.stringify(results);
    localStorage.setItem("quizResult", jsonResults);
  }
}

window.buildQuiz = (selector, options = {}) => {
  return new Quiz(selector, options);
};
