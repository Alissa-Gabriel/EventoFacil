(() => {
  'use strict';

  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const form = document.getElementById('vulnerabilityForm');
  const notice = document.getElementById('notice');
  const desc = document.getElementById('descricao');
  const counter = document.getElementById('descricao-count');
  const file = document.getElementById('anexo');

  const updateCounter = () => {
    counter.textContent = `${desc.value.length} / ${desc.maxLength}`;
  };
  desc.addEventListener('input', updateCounter);

  const setError = (el, message) => {
    const id = `${el.id}-error`;
    let box = document.getElementById(id);
    if (!message) {
      el.removeAttribute('aria-invalid');
      if (box) box.remove();
      return;
    }
    if (!box) {
      box = document.createElement('div');
      box.id = id;
      box.className = 'error-msg';
      (el.closest('.check') || el).insertAdjacentElement('afterend', box);
    }
    box.textContent = message;
    el.setAttribute('aria-invalid', 'true');
  };

  const validateField = (el) => {
    el.setCustomValidity('');
    let message = '';
    if (el === file && file.files[0] && file.files[0].size > MAX_FILE_BYTES) {
      message = 'O arquivo excede 5 MB.';
      el.setCustomValidity(message);
    } else if (!el.validity.valid) {
      message = el.validity.valueMissing ? 'Preencha este campo.' : 'Informe um valor válido.';
    }
    setError(el, message);
    return !message;
  };

  form.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) validateField(el); });
    el.addEventListener('change', () => { if (el.hasAttribute('aria-invalid') || el === file) validateField(el); });
  });

  const makeProtocol = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().slice(0, 5);
    return `EF-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${rand}`;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    notice.hidden = true;

    const fields = [...form.elements].filter((el) => el.name && el.willValidate);
    const invalid = fields.filter((el) => !validateField(el));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    const protocol = makeProtocol();
    const hasEmail = form.elements.email.value.trim() !== '';
    notice.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = 'Relato recebido (demonstração)';
    const body = document.createElement('span');
    body.textContent = `Protocolo: ${protocol}. ` + (hasEmail
      ? 'Confirmaremos o recebimento por e-mail em até 3 dias úteis.'
      : 'Guarde este número: sem e-mail, não conseguimos entrar em contato.')
      + ' Nenhum dado foi realmente enviado.';
    notice.append(title, body);
    notice.hidden = false;
    notice.focus();

    form.reset();
    updateCounter();
  });

  updateCounter();
})();
