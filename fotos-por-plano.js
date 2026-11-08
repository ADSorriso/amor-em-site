/* Amor em Site — Upload de fotos por plano. Sem alterar Asaas ou Supabase.
   A foto principal permanece sob responsabilidade do script.js original.
   Este complemento prepara e guarda apenas as fotos ADICIONAIS da personalização. */
(() => {
  'use strict';
  const LIMITS = Object.freeze({ essencial: 1, romantico: 8, premium: 12 });
  const STORAGE_KEY = 'amorEmSiteFotosExtras';
  const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024;
  // Restrições conservadoras: mantêm o pedido abaixo dos limites comuns de APIs
  // e permitem armazenar as fotos em site_data sem mudar a estrutura do banco.
  const MAX_PREPARED_BYTES = 1.45 * 1024 * 1024;
  const MAX_IMAGE_DATA_URL_CHARS = 125000;
  let selectedFiles = [];
  let selectedThumbnails = [];
  let busy = false;
  let currentPlan = '';
  let buildNumber = 0;

  function safeSet(value) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Não foi possível guardar as fotos da prévia.', error);
      alert('As fotos ocupam muito espaço. Tente imagens menores.');
      return false;
    }
  }
  function reset(plan) {
    currentPlan = plan;
    selectedFiles = [];
    selectedThumbnails = [];
    buildNumber++;
    safeSet({ plan, photos: [] });
    const input = document.getElementById('pemExtraPhotosInput');
    if (input) input.value = '';
    paint();
  }
  function planLimit() {
    return LIMITS[currentPlan] ?? 1;
  }
  function paint() {
    const info = document.getElementById('pemExtraPhotosInfo');
    const previews = document.getElementById('pemExtraPhotosPreviews');
    const input = document.getElementById('pemExtraPhotosInput');
    const card = document.getElementById('pemExtraPhotosCard');
    if (!info || !previews || !input || !card) return;
    const extraLimit = planLimit() - 1;
    card.hidden = extraLimit === 0;
    input.disabled = extraLimit === 0 || busy;
    input.setAttribute('aria-label', `Adicionar até ${extraLimit} fotos além da foto principal`);
    info.textContent = busy
      ? 'Preparando imagens, não envie o formulário ainda...'
      : `Este plano permite ${planLimit()} foto${planLimit() !== 1 ? 's' : ''} no total. ` +
        `${selectedFiles.length} de ${extraLimit} foto${extraLimit !== 1 ? 's' : ''} adicional${extraLimit !== 1 ? 'is' : ''} selecionada${selectedFiles.length !== 1 ? 's' : ''}.`;
    previews.replaceChildren();
    selectedFiles.forEach((file, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'aesp-preview';
      const image = document.createElement('img');
      image.src = selectedThumbnails[index] || '';
      image.alt = `Foto adicional ${index + 1}`;
      const caption = document.createElement('span');
      caption.textContent = `${index + 2}. ${file.name}`;
      caption.title = file.name;
      thumb.append(image, caption);
      previews.append(thumb);
    });
  }

  function prepareImage(file) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type) || file.size > MAX_ORIGINAL_BYTES) {
        reject(new Error('Use JPEG, PNG, WebP ou GIF de até 10 MB por foto.'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Não foi possível ler uma foto.'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('Imagem inválida.'));
        image.onload = () => {
          if (!image.naturalWidth || !image.naturalHeight) {
            reject(new Error('Foto sem dimensões válidas.'));
            return;
          }
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Não foi possível processar a foto.')); return; }
          let output = '';
          const attempts = [
            [700, 0.67], [620, 0.60], [560, 0.54],
            [480, 0.48], [400, 0.42], [330, 0.40]
          ];
          try {
            for (const [maxSide, quality] of attempts) {
              const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
              canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
              canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
              ctx.fillStyle = '#fff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
              output = canvas.toDataURL('image/jpeg', quality);
              if (output.length <= MAX_IMAGE_DATA_URL_CHARS) break;
            }
            if (output.length > MAX_IMAGE_DATA_URL_CHARS) {
              reject(new Error('Uma foto ficou muito grande. Escolha outra imagem.'));
            } else {
              resolve(output);
            }
          } catch (error) { reject(new Error('Não foi possível comprimir esta foto.')); }
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  async function changed(event) {
    if (busy) return;
    const files = [...(event.target.files || [])];
    if (files.length > planLimit() - 1) {
      alert(`Seu plano permite no máximo ${planLimit()} fotos, contando a foto principal.`);
      event.target.value = '';
      return;
    }
    const version = ++buildNumber;
    busy = true;
    paint();
    try {
      const prepared = [];
      for (const file of files) prepared.push(await prepareImage(file));
      if (version !== buildNumber) return;
      const estimate = prepared.reduce((sum, image) => sum + image.length, 0);
      if (estimate > MAX_PREPARED_BYTES) throw new Error('Fotos muito grandes. Selecione imagens menores.');
      const data = { plan: currentPlan, photos: prepared };
      if (safeSet(data)) {
        selectedFiles = files;
        selectedThumbnails = prepared;
      }
    } catch (err) {
      alert(err.message || 'Não foi possível preparar suas fotos.');
      event.target.value = '';
      selectedFiles = [];
      selectedThumbnails = [];
      safeSet({ plan: currentPlan, photos: [] });
    } finally {
      busy = false;
      paint();
    }
  }

  function installStyles() {
    if (document.getElementById('aesp-styles')) return;
    const style = document.createElement('style');
    style.id = 'aesp-styles';
    style.textContent = `
      #pemExtraPhotosCard{grid-column:1/-1;border:1px solid #f5bccb;border-radius:16px;padding:16px;background:#fff6f9;}
      #pemExtraPhotosCard[hidden]{display:none!important;}
      #pemExtraPhotosCard label{display:block;font-weight:700;font-size:14px;margin-bottom:8px;}
      #pemExtraPhotosInput{width:100%;max-width:100%;font-size:13px;}
      #pemExtraPhotosInfo{display:block;margin-top:8px;color:#845767;font-size:12px;line-height:1.5;}
      #pemExtraPhotosPreviews{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:9px;margin-top:12px;}
      #pemExtraPhotosPreviews .aesp-preview{min-width:0;background:#fff;border:1px solid #f5bccb;border-radius:12px;padding:6px;}
      #pemExtraPhotosPreviews img{display:block;width:100%;height:82px;object-fit:cover;border-radius:8px;background:#fce0e8;}
      #pemExtraPhotosPreviews span{display:block;font-size:11px;color:#7b2e46;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:5px;}
    `;
    document.head.append(style);
  }
  function ensureUI() {
    const modal = document.getElementById('planPersonalizationModal');
    if (!modal || !modal.querySelector('#pemPhoto')) return;
    installStyles();
    if (!document.getElementById('pemExtraPhotosCard')) {
      const card = document.createElement('div');
      card.id = 'pemExtraPhotosCard';
      card.className = 'pem-field full';
      card.innerHTML = `
        <label for="pemExtraPhotosInput">📸 Fotos adicionais do seu plano</label>
        <input id="pemExtraPhotosInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple>
        <small id="pemExtraPhotosInfo" aria-live="polite"></small>
        <div id="pemExtraPhotosPreviews" aria-live="polite"></div>
      `;
      modal.querySelector('#pemPhoto').closest('.pem-field')?.after(card);
      card.querySelector('input').addEventListener('change', changed);
      modal.querySelector('#pemForm')?.addEventListener('submit', event => {
        if (busy) {
          event.preventDefault();
          event.stopImmediatePropagation();
          alert('Aguarde o preparo das fotos antes de abrir a prévia.');
        }
      }, true);
    }
    const plan = modal.dataset.planKey;
    if (!LIMITS[plan]) return;
    if (currentPlan !== plan) reset(plan);

    // A data do casal pode ser escolhida no Essencial também.
    // O script original esconde esse campo; reexibimos após a escolha do plano.
    const dateField = modal.querySelector('[data-pem="date"]');
    if (dateField) dateField.style.display = '';
    const dateInput = document.getElementById('pemDate');
    if (dateInput) dateInput.required = plan !== 'essencial';
    const dateLabel = modal.querySelector('label[for="pemDate"]');
    if (dateLabel) dateLabel.textContent = plan === 'essencial'
      ? '📅 Data especial do casal (opcional)'
      : 'Data especial *';

    // No Essencial a história, a carta e até 10 motivos também fazem parte do produto.
    if (plan === 'essencial') {
      modal.querySelectorAll('[data-pem="story"]').forEach(el => { el.style.display = ''; });
      const story = document.getElementById('pemStory');
      if (story) story.required = false;
      const storyLabel = modal.querySelector('label[for="pemStory"]');
      if (storyLabel) storyLabel.textContent = '📖 Como tudo começou (opcional)';
      for (const id of ['pemReasons', 'pemLetter']) {
        const el = document.getElementById(id);
        if (el) { el.closest('[data-pem="romantic"]')?.style.setProperty('display', ''); el.required = false; }
      }
      const section = modal.querySelector('.pem-section[data-pem="romantic"]');
      if (section) { section.style.display = ''; section.querySelector('strong').textContent = '💝 Recursos do Essencial'; }
      const surprise = document.getElementById('pemSurprise');
      if (surprise) { surprise.required = false; surprise.closest('[data-pem="romantic"]')?.style.setProperty('display', 'none'); }
      const letterLabel = modal.querySelector('label[for="pemLetter"]');
      if (letterLabel) letterLabel.textContent = '💌 Carta interativa (opcional)';
      const label = modal.querySelector('label[for="pemReasons"]');
      if (label) label.textContent = '❤️ Até 10 motivos para te amar';
      const help = document.getElementById('pemReasons')?.parentElement?.querySelector('.pem-help');
      if (help) help.textContent = 'Até 10 motivos, um por linha.';
      const input = document.getElementById('pemReasons');
      if (input && !input.dataset.aespValidationInstalled) {
        input.dataset.aespValidationInstalled = 'true';
        input.addEventListener('input', () => {
          const lines = input.value.split(/\r?\n/).filter(s => s.trim());
          if (lines.length > 10) input.setCustomValidity('O plano Essencial permite até 10 motivos.');
          else input.setCustomValidity('');
        });
      }
    } else {
      const storyLabel = modal.querySelector('label[for="pemStory"]');
      if (storyLabel) storyLabel.textContent = '📖 Nossa história *';
      const letterLabel = modal.querySelector('label[for="pemLetter"]');
      if (letterLabel) letterLabel.textContent = '💌 Carta interativa *';
      const main = modal.querySelector('.pem-section[data-pem="romantic"] strong');
      if (main) main.textContent = '💕 Recursos do Romântico/Premium';
      const label = modal.querySelector('label[for="pemReasons"]');
      if (label) label.textContent = '❤️ 100 motivos *';
      const help = document.getElementById('pemReasons')?.parentElement?.querySelector('.pem-help');
      if (help) help.textContent = 'Até 100 motivos, um por linha.';
      document.getElementById('pemReasons')?.setCustomValidity('');
    }
    const mainLabel = modal.querySelector('label[for="pemPhoto"]');
    if (mainLabel) mainLabel.textContent = `Foto principal (1 de até ${planLimit()}) *`;
    paint();
  }

  // O formulário é criado dinamicamente pelo script.js existente.
  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('[data-plan-id]')) setTimeout(ensureUI, 0);
  }, true);
  const observer = new MutationObserver(() => {
    if (document.getElementById('planPersonalizationModal') && !document.getElementById('pemExtraPhotosCard')) ensureUI();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  ensureUI();
})();
