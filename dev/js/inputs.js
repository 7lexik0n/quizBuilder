// класс контроля валидности отдельного инпута

class Input {
  constructor(inputEl) {
    this.source = inputEl;
    this.setProps();
    this.render();
    this.addEvents();
    this.valid = false;
    this.touched = false;
  }

  setProps() {
    this.data = { ...this.source.dataset };
    this.data.required = this.source.required;
    this.data.placeholder = this.source.getAttribute("placeholder");
    this.data.name = this.source.getAttribute("name");

    if (!this.data.name) {
      throw new Error("Inputs must have a name property!");
    }

    if (this.data.type === "text" && this.data.length) {
      const [min, max] = this.data.length.split("-");
      this.data.min = +min || 5;
      this.data.max = +max || null;
    }

    if (this.data.type === "number" || this.data.type === "tel") {
      this.data.min = +this.data.min || null;
      this.data.max = +this.data.max || null;
    }

    if (this.data.type === "tel") {
      this.data.min = +this.data.min || 10;
    }
  }

  render() {
    const parent = this.source.parentNode;

    const wrapper = document.createElement("div");
    wrapper.className = "input__wrapper";
    parent.insertBefore(wrapper, this.source);

    this.element = document.createElement("input");
    this.element.className = "input";
    this.element.setAttribute("placeholder", this.data.placeholder);

    this.errorElement = document.createElement("span");
    this.errorElement.className = "input__error input__error_hidden";
    this.errorElement.innerText = this.data.error;

    wrapper.appendChild(this.element);
    wrapper.appendChild(this.errorElement);

    this.source.remove();
    delete this.source;
  }

  addEvents() {
    this.element.addEventListener("input", this.setValue);
    this.element.addEventListener("input", this.validate);
    this.element.addEventListener("blur", this.onBlur);
    this.element.addEventListener("change", this.onBlur);
  }

  setValue = (event) => {
    this.value = event.target.value;
    this.element.value = this.value;
  };

  onBlur = () => {
    this.touched = true;
    this.validate();
  };

  validate = () => {
    this.valid = this.data.required || this.data.check ? this.isValid() : true;

    if (!this.valid && this.touched) {
      this.errorElement.classList.remove("input__error_hidden");
      this.element.classList.add("input__invalid");
    } else {
      this.errorElement.classList.add("input__error_hidden");
      this.element.classList.remove("input__invalid");
    }
  };

  showError = () => {
    this.onBlur();
  }

  isValid() {
    let value = this.value;

    if ((this.data.required || this.data.check) && !this.value) {
      return false;
    }

    switch (this.data.type) {
      case "text": {
        value = value.trim();

        if (
          value.length < this.data.min ||
          (this.data.max && value.length > this.data.max)
        ) {
          return false;
        }

        break;
      }
      case "number": {
        value = parseFloat(this.value);

        if (
          isNaN(value) ||
          (this.data.min && value < this.data.min) ||
          (this.data.max && value > this.data.max)
        ) {
          return false;
        }

        break;
      }
      case "tel": {
        value = value.trim().replace(/\D/g, "");

        if (
          value.length < this.data.min ||
          (this.data.max && value.length > this.data.max)
        ) {
          return false;
        }

        break;
      }
      case "email": {
        value = value.trim();

        if (
          !value.match(
            /^((([0-9A-Za-z]{1}[-0-9A-z\.]{1,}[0-9A-Za-z]{1})|([0-9А-Яа-я]{1}[-0-9А-я\.]{1,}[0-9А-Яа-я]{1}))@([-A-Za-z]{1,}\.){1,2}[-A-Za-z]{2,})$/
          )
        ) {
          return false;
        }

        break;
      }
    }

    return true;
  }
}

// класс контроля валидности группы инпутов

class ValidationForm {
  constructor(formElement, inputs, selects) {
    this.element = formElement;
    this.inputs = inputs;
    this.selects = selects;
  }

  getValues() {
    const inputs = this.inputs
      .map((input) => ({
        [input.data.name]: input.value,
      }))
      .reduce((acc, input) => ({ ...acc, ...input }), {});
    const selects = this.selects
      .map((select) => ({
        [select.name]: select.value,
      }))
      .reduce((acc, select) => ({ ...acc, ...select }), {});

    return {...inputs, ...selects};
  }

  isValid = () => {
    let valid = true;

    valid =
      this.inputs.every(
        (input) => !input.data.required || (input.touched && input.valid)
      ) &&
      this.selects.every(
        (select) => !select.required || (select.touched && select.valid)
      );

    return valid;
  };

  showErrors() {
    this.inputs.forEach(input => input.showError());
    this.selects.forEach(select => select.showError());
  }
}

window.validationForm = (formElement) => {
  const inputs = createInputs(`.validationInput`, formElement);
  const selects = selectus(".validationSelect", { parent: formElement });
  return new ValidationForm(formElement, inputs, selects);
};

window.createInputs = (selector, parentForm) => {
  const inputs = [...parentForm.querySelectorAll(selector)];
  return inputs.map((input) => new Input(input));
};

window.createInput = (selector) => {
  const input = document.querySelector(selector);
  return new Input(input);
};
