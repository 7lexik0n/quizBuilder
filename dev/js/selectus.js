class Selectus {
  selectClassName = "select select__wrapper";
  selectButtonClassName = "selectus__button";
  optionsBoxName = "selectus__optionsBox";
  optionsClassName = "selectus__option";
  optionsActiveClassName = `${this.optionsClassName}_active`;

  toggleSpeed = 200;

  constructor(defaultSelect, order, { animated = true } = {}) {
    this.defaultSelect = defaultSelect;
    this.animated = animated;
    this.order = order;
    this.init();
    this.render();
  }

  init() {
    this.hide(this.defaultSelect);
    this.required = this.defaultSelect.required;
    this.name = this.defaultSelect.getAttribute("name");
    this.touched = false;
    this.valid = false;
  }

  hide(element) {
    element.style.display = "none";
  }

  hideMenu = () => {
    this.optionsBox.classList.add("selectus__optionsBox_animated");
    this.menuHeight = this.optionsBox.getBoundingClientRect().height;
    this.optionsBox.style.height = "0px";
  };

  toggleSelectMenu = () => {
    this.touched = true;

    if (!this.animated) {
      this.optionsBox.classList.toggle(`${this.optionsBoxName}_opened`);

      if (this.optionsBox.classList.contains(`${this.optionsBoxName}_opened`)) {
        window.addEventListener("click", this.closeMenu);
      } else {
        window.removeEventListener("click", this.closeMenu);
      }
    } else {
      this.optionsBox.classList.contains(`${this.optionsBoxName}_opened`)
        ? this.toggleMenu(this.toggleSpeed, "close")
        : this.toggleMenu(this.toggleSpeed, "open");
    }
  };

  closeMenu = (evt) => {
    if (!evt.target.closest(".select__wrapper")) {
      if (this.animated) {
        this.toggleMenu(this.toggleSpeed, "close");
      } else {
        this.optionsBox.classList.remove(`${this.optionsBoxName}_opened`);
      }

      window.removeEventListener("click", this.closeMenu);

      this.checkError();
    }
  };

  toggleMenu(duration, type) {
    if (type === "open") {
      window.addEventListener("click", this.closeMenu);
    } else {
      window.removeEventListener("click", this.closeMenu);
    }

    const start = performance.now();

    requestAnimationFrame((time) =>
      this.animationFunction({
        time,
        start,
        duration,
        type,
      })
    );
  }

  animationFunction({ time, start, duration, type }) {
    let timeFraction = (time - start) / duration;

    if (timeFraction >= 1) {
      timeFraction = 1;

      if (type === "open") {
        this.optionsBox.classList.add(`${this.optionsBoxName}_opened`);

        if (this.options[0].offsetHeight * 5 > this.menuHeight) {
          this.menuHeight = this.options[0].offsetHeight * 5;
          this.optionsBox.style.height = `${this.menuHeight}px`;
        }
      } else {
        this.optionsBox.classList.remove(`${this.optionsBoxName}_opened`);
      }
    }

    let progress =
      type === "open"
        ? this.getOpenTiming(timeFraction)
        : this.getCloseTiming(timeFraction);

    this.draw(progress);

    if (timeFraction < 1) {
      requestAnimationFrame((newTime) =>
        this.animationFunction({
          time: newTime,
          start,
          duration,
          type,
        })
      );
    }
  }

  getOpenTiming(timeFraction) {
    return timeFraction;
  }

  getCloseTiming(timeFraction) {
    return 1 - timeFraction;
  }

  draw(progress) {
    this.optionsBox.style.height = `${this.menuHeight * progress}px`;
  }

  selectOption = (evt) => {
    const option = evt.target.closest(`.${this.optionsClassName}`);

    if (option) {
      const value = option.dataset.value;
      const index = option.dataset.index;
      const text = option.innerText;

      this.resetOptions();
      this.changeSelectData(index, value, text);
    }
  };

  resetOptions() {
    this.options[this.index].classList.remove(this.optionsActiveClassName);
    this.defaultSelect.options[this.index].removeAttribute("selected");
  }

  changeSelectData(index, value, text) {
    this.value = value;
    this.index = index;

    if (this.value != 0) {
      this.button.innerHTML = `<span>${text}</span>`;
    } else {
      this.button.innerHTML = `<span class="input__placeholder">${text}</span>`;
    }

    this.options[this.index].classList.add(this.optionsActiveClassName);
    this.defaultSelect.options[this.index].setAttribute("selected", "selected");

    this.valid = this.value != 0;

    this.checkError();

    this.defaultSelect.dispatchEvent(new Event("change"));
  }

  checkError() {
    if (this.required && this.touched) {
      if (this.valid) {
        this.errorElement.classList.add("select__error_hidden");
        this.elem.classList.remove("select_invalid");
      } else {
        this.errorElement.classList.remove("select__error_hidden");
        this.elem.classList.add("select_invalid");
      }
    }
  }

  showError() {
    this.touched = true;
    this.checkError();
  }

  render() {
    this.parent = this.defaultSelect.parentElement;

    this.value = this.defaultSelect.value;
    this.index = this.defaultSelect.selectedIndex;

    this.elem = document.createElement("div");
    this.elem.className = this.selectClassName;
    this.elem.dataset.order = this.order;

    this.button = document.createElement("div");
    this.button.classList.add(this.selectButtonClassName);
    this.button.innerHTML = `<span class="input__placeholder">${
      this.defaultSelect[this.index].innerText
    }</span>`;

    this.optionsBox = document.createElement("div");
    this.optionsBox.classList.add(this.optionsBoxName);

    const options = Array.from(this.defaultSelect.options);
    this.options = [...options].map((option, index) => {
      const value = option.value;
      const text = option.innerText;
      const selected = option.selected;
      const optionElement = document.createElement("div");
      optionElement.innerHTML = `
          <div
            class="${this.optionsClassName}${
        selected ? ` ${this.optionsActiveClassName}` : ""
      }"
            data-value="${value}"
            data-index="${index}"
          >
            ${text}           
          </div>
        `;

      return optionElement.firstElementChild;
    });

    this.options.forEach((option) =>
      this.optionsBox.insertAdjacentElement("beforeend", option)
    );

    this.parent.insertBefore(this.elem, this.defaultSelect);
    this.elem.insertAdjacentElement("beforeend", this.button);
    this.elem.insertAdjacentElement("beforeend", this.optionsBox);

    if (this.required) {
      this.errorMessage = this.defaultSelect.dataset.error;
      this.errorElement = document.createElement("span");
      this.errorElement.className = "select__error select__error_hidden";
      this.errorElement.innerText = this.errorMessage;
      this.elem.insertAdjacentElement("afterend", this.errorElement);
    }

    this.addEventListeners();
  }

  addEventListeners() {
    this.elem.addEventListener("click", this.toggleSelectMenu);
    this.optionsBox.addEventListener("click", this.selectOption);

    if (this.animated) {
      document.addEventListener("DOMContentLoaded", this.hideMenu);
    }
  }

  isValid() {
    return this.value != 0;
  }
}

window.selectus = (className, { animated = true, parent = document } = {}) => {
  const selectsElements = [...parent.querySelectorAll(className)];
  const selects = selectsElements.map(
    (select, index) => new Selectus(select, index, { animated })
  );
  selects.reverse().forEach((select, index) => {
    const zIndex = window.getComputedStyle(select.elem).zIndex;
    select.elem.style.zIndex = +zIndex + index;
  });

  return selects.reverse();
};
