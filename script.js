const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
const modalOverlay = document.getElementById("modalOverlay");
const feedbackForm = document.getElementById("feedbackForm");
const messageDiv = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const organizationInput = document.getElementById("organization");
const messageTextInput = document.getElementById("messageText");
const privacyPolicyInput = document.getElementById("privacyPolicy");

const fullNameError = document.getElementById("fullNameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const messageTextError = document.getElementById("messageTextError");
const privacyPolicyError = document.getElementById("privacyPolicyError");

const FORMCARRY_FORM_ID = "bNKHtdlam31";
const FORMCARRY_URL = `https://formcarry.com/s/${FORMCARRY_FORM_ID}`;

openModalBtn.addEventListener("click", () => {
  modalOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";

  history.pushState({ modalOpen: true }, "", "#feedback");

  restoreFormData();
});

closeModalBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

window.addEventListener("popstate", (e) => {
  if (location.hash !== "#feedback") {
    closeModal();
  }
});

function closeModal() {
  modalOverlay.style.display = "none";
  document.body.style.overflow = "auto";

  if (location.hash === "#feedback") {
    history.back();
  }
}

function validateForm() {
  let isValid = true;

  if (!fullNameInput.value.trim()) {
    fullNameError.style.display = "block";
    isValid = false;
  } else {
    fullNameError.style.display = "none";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value)) {
    emailError.style.display = "block";
    isValid = false;
  } else {
    emailError.style.display = "none";
  }

  if (phoneInput.value.trim()) {
    const phoneRegex = /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(phoneInput.value)) {
      phoneError.style.display = "block";
      isValid = false;
    } else {
      phoneError.style.display = "none";
    }
  } else {
    phoneError.style.display = "none";
  }

  if (!messageTextInput.value.trim()) {
    messageTextError.style.display = "block";
    isValid = false;
  } else {
    messageTextError.style.display = "none";
  }

  if (!privacyPolicyInput.checked) {
    privacyPolicyError.style.display = "block";
    isValid = false;
  } else {
    privacyPolicyError.style.display = "none";
  }

  return isValid;
}

phoneInput.addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 0) {
    if (!value.startsWith("7") && !value.startsWith("8")) {
      value = "7" + value;
    }

    if (value.length > 1) {
      value =
        "+7 (" +
        value.substring(1, 4) +
        ") " +
        value.substring(4, 7) +
        "-" +
        value.substring(7, 9) +
        "-" +
        value.substring(9, 11);
    } else {
      value = "+7";
    }
  }

  e.target.value = value;
});

function saveFormData() {
  const formData = {
    fullName: fullNameInput.value,
    email: emailInput.value,
    phone: phoneInput.value,
    organization: organizationInput.value,
    messageText: messageTextInput.value,
    privacyPolicy: privacyPolicyInput.checked,
  };

  localStorage.setItem("feedbackFormData", JSON.stringify(formData));
}

function restoreFormData() {
  const savedData = localStorage.getItem("feedbackFormData");

  if (savedData) {
    const formData = JSON.parse(savedData);

    fullNameInput.value = formData.fullName || "";
    emailInput.value = formData.email || "";
    phoneInput.value = formData.phone || "";
    organizationInput.value = formData.organization || "";
    messageTextInput.value = formData.messageText || "";
    privacyPolicyInput.checked = formData.privacyPolicy || false;
  }
}

function clearFormData() {
  fullNameInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
  organizationInput.value = "";
  messageTextInput.value = "";
  privacyPolicyInput.checked = false;

  localStorage.removeItem("feedbackFormData");
}

feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Отправка...";

  try {
    const formData = {
      fullName: fullNameInput.value,
      email: emailInput.value,
      phone: phoneInput.value,
      organization: organizationInput.value,
      message: messageTextInput.value,
      privacyPolicy: privacyPolicyInput.checked,
    };

    console.log("Отправка данных:", formData);

    const response = await fetch(FORMCARRY_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    console.log("Статус ответа:", response.status);

    const result = await response.json();
    console.log("Ответ сервера:", result);

    if (response.ok && result.code === 200) {
      showMessage(
        "Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.",
        "success"
      );
      clearFormData();
    } else {
      throw new Error(result.message || "Ошибка отправки формы");
    }
  } catch (error) {
    console.error("Ошибка отправки формы:", error);
    showMessage(
      "Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз или свяжитесь с нами другим способом.",
      "error"
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Отправить";
  }
});

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";

  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 5000);
}

feedbackForm.addEventListener("input", saveFormData);
privacyPolicyInput.addEventListener("change", saveFormData);
