(() => {
  'use strict';

  const tabs = [...document.querySelectorAll('.member-tab')];
  const downloads = [...document.querySelectorAll('.download-btn')];
  const memberSection = document.querySelector('#meu-pacote');

  const panel = document.querySelector('#selected-member');
  const nameEl = document.querySelector('#selected-member-name');
  const summaryEl = document.querySelector('#selected-member-summary');
  const selectedPackageButton = document.querySelector('#selected-member-download');
  const heroPackageButton = document.querySelector('#hero-package-download');
  const mobilePackageButton = document.querySelector('#mobile-package-download');
  const mobileBar = document.querySelector('#mobile-access-bar');
  const mobileName = document.querySelector('#mobile-member-name');

  const accessTitle = document.querySelector('#access-status-title');
  const accessCopy = document.querySelector('#access-status-copy');
  const accessStatus = document.querySelector('#access-status');

  const changeButtons = [
    document.querySelector('#change-member-top'),
    document.querySelector('#change-member-footer')
  ].filter(Boolean);

  const toast = document.querySelector('#app-toast');
  const toastMessage = document.querySelector('#app-toast-message');
  let toastTimer;
  let currentMember = null;

  const members = {
    renison: {
      name: 'Renison',
      initial: 'R',
      role: 'Flauta 1 • Solos',
      file: 'assets/pacotes/partituras-renison.zip',
      summary: 'Flauta 1 nas peças divididas; solo em Gabriel\'s Oboé e Forrest Gump.'
    },
    vinicius: {
      name: 'Vinícius',
      initial: 'V',
      role: 'Flautas 1 e 2 • Solo',
      file: 'assets/pacotes/partituras-vinicius.zip',
      summary: 'Flauta 1 nas peças indicadas, solo em Kamado, Flauta 2 em Gabriel\'s Oboé e entrada na parte B de Forrest Gump.'
    },
    isabella: {
      name: 'Isabella',
      initial: 'I',
      role: 'Flauta 2',
      file: 'assets/pacotes/partituras-isabella.zip',
      summary: 'Flauta 2 nas peças divididas; Flauta 1 em Evidências e Piratas; todos em Kamado a partir do compasso 46.'
    },
    miguel: {
      name: 'Miguel',
      initial: 'M',
      role: 'Flauta 2',
      file: 'assets/pacotes/partituras-miguel.zip',
      summary: 'Flauta 2 nas peças divididas; Flauta 1 em Evidências e Piratas; todos em Kamado a partir do compasso 46.'
    }
  };

  function memberCanAccess(button, member) {
    if (!member) return false;
    return (button.dataset.members || '')
      .split(/\s+/)
      .filter(Boolean)
      .includes(member);
  }

  function setButtonIcon(button, allowed) {
    const icon = button.querySelector('.download-btn__icon i');
    const arrow = button.querySelector('.download-btn__arrow');
    if (icon) {
      icon.className = allowed
        ? 'fa-solid fa-download fa-beat-fade download-icon'
        : 'fa-solid fa-lock';
    }
    if (arrow) {
      arrow.className = allowed
        ? 'fa-solid fa-chevron-right download-btn__arrow'
        : 'fa-solid fa-shield-halved download-btn__arrow';
    }
  }

  function showToast(message, type = 'success') {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.dataset.type = type;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function triggerDownload(file, label) {
    if (!file) return;
    const link = document.createElement('a');
    link.href = file;
    link.download = '';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(label || 'Download iniciado.');
  }

  function setPackageButton(button, enabled, label) {
    if (!button) return;
    button.disabled = !enabled;
    const icon = button.querySelector('i');
    const text = button.querySelector('span');
    if (icon) {
      icon.className = enabled
        ? 'fa-solid fa-download fa-beat-fade download-icon'
        : 'fa-solid fa-lock';
    }
    if (text) text.textContent = label;
  }

  function updateDownloads(member) {
    let allowedCount = 0;

    downloads.forEach((button) => {
      const allowed = memberCanAccess(button, member);
      button.disabled = !allowed;
      button.setAttribute('aria-disabled', String(!allowed));
      button.classList.toggle('is-relevant', allowed);
      button.classList.toggle('is-locked', !allowed);
      setButtonIcon(button, allowed);

      if (allowed) {
        allowedCount += 1;
        button.title = 'Esta partitura pertence ao seu pacote';
        button.setAttribute('aria-label', `${button.textContent.trim()} — liberada para ${members[member].name}`);
      } else {
        button.title = member ? 'Esta partitura não pertence ao seu pacote' : 'Selecione seu nome para liberar os downloads';
        button.setAttribute('aria-label', member ? 'Partitura bloqueada: não pertence ao seu pacote' : 'Partitura bloqueada: selecione seu nome');
      }
    });
    return allowedCount;
  }

  function setMember(member, { persist = true, announce = true } = {}) {
    if (!members[member]) return;
    currentMember = member;
    const data = members[member];

    tabs.forEach((tab) => {
      const active = tab.dataset.member === member;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-pressed', String(active));
    });

    const count = updateDownloads(member);

    if (panel) panel.hidden = false;
    if (nameEl) nameEl.textContent = data.name;
    if (summaryEl) summaryEl.textContent = data.summary;

    if (accessStatus) accessStatus.classList.add('is-unlocked');
    if (accessTitle) accessTitle.textContent = `Pacote de ${data.name} liberado`;
    if (accessCopy) accessCopy.textContent = `${count} PDFs disponíveis. As partituras que não pertencem ao seu pacote permanecem bloqueadas.`;
    if (mobileName) mobileName.textContent = data.name;
    if (mobileBar) mobileBar.hidden = false;

    setPackageButton(heroPackageButton, true, `Baixar pacote de ${data.name}`);

    if (persist) {
      try { localStorage.setItem('naipeFlautasMember', member); } catch (_) {}
    }

    if (announce) showToast(`Acesso de ${data.name} ativado.`);
  }

  function clearMember() {
    currentMember = null;
    tabs.forEach((tab) => {
      tab.classList.remove('active');
      tab.setAttribute('aria-pressed', 'false');
    });
    updateDownloads(null);
    if (panel) panel.hidden = true;
    if (mobileBar) mobileBar.hidden = true;
    setPackageButton(heroPackageButton, false, 'Selecione seu nome');
    if (accessStatus) accessStatus.classList.remove('is-unlocked');
    if (accessTitle) accessTitle.textContent = 'Downloads bloqueados';
    if (accessCopy) accessCopy.textContent = 'Selecione seu nome acima para liberar apenas as partituras do seu pacote.';
    try { localStorage.removeItem('naipeFlautasMember'); } catch (_) {}
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setMember(tab.dataset.member));
  });

  downloads.forEach((button) => {
    button.addEventListener('click', () => {
      if (!currentMember || !memberCanAccess(button, currentMember)) {
        showToast('Este PDF não pertence ao seu pacote.', 'warning');
        return;
      }
      triggerDownload(button.dataset.file, 'Download da partitura iniciado.');
    });
  });

  [selectedPackageButton, heroPackageButton, mobilePackageButton].filter(Boolean).forEach((button) => {
    button.addEventListener('click', () => {
      if (!currentMember) {
        memberSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      triggerDownload(members[currentMember].file, `Pacote de ${members[currentMember].name} iniciado.`);
    });
  });

  changeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      clearMember();
      memberSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => tabs[0]?.focus(), 500);
    });
  });

  let saved = null;
  try { saved = localStorage.getItem('naipeFlautasMember'); } catch (_) {}
  if (saved && members[saved]) {
    setMember(saved, { persist: false, announce: false });
  } else {
    clearMember();
  }
})();
