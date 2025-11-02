/* script.js
   SPA, validação, acessibilidade, toasts, theme toggles
*/
document.addEventListener('DOMContentLoaded', () => {
  
  document.getElementById('year').textContent = new Date().getFullYear();

  const app = document.getElementById('app');
  const menu = document.querySelector('.main-nav .menu');
  const hamburger = document.querySelector('.hamburger');
  const themeToggle = document.getElementById('themeToggle');
  const contrastToggle = document.getElementById('contrastToggle');
  const toastContainer = document.getElementById('toast-container');

  
  const TEMPLATES = {
    home: `
      <section aria-labelledby="home-title">
        <h2 id="home-title">Bem-vindo</h2>
        <p class="muted">Plataforma modelo para entrega acadêmica — SPA, acessibilidade e otimização.</p>
        <div class="card-list" id="featuredProjects" aria-live="polite"></div>
      </section>
    `,
    projetos: `
      <section aria-labelledby="proj-title">
        <h2 id="proj-title">Projetos</h2>
        <div class="card-list" id="projectsGrid" aria-live="polite"></div>
      </section>
    `,
    voluntariado: `
      <section aria-labelledby="vol-title">
        <h2 id="vol-title">Voluntariado</h2>
        <div class="card">
          <h3>Inscreva-se como voluntário</h3>
          <form id="volForm" novalidate>
            <label for="vnome">Nome</label>
            <input id="vnome" name="nome" type="text" required minlength="3" />
            <label for="vemail">E-mail</label>
            <input id="vemail" name="email" type="email" required />
            <label for="vmensagem">Mensagem</label>
            <textarea id="vmensagem" name="mensagem" rows="4"></textarea>
            <div class="form-actions">
              <button class="btn" type="submit">Enviar</button>
              <button class="btn secondary" type="reset">Limpar</button>
            </div>
            <div id="volMsg" class="form-message" aria-live="polite"></div>
          </form>
        </div>
      </section>
    `,
    doar: `
      <section aria-labelledby="doar-title">
        <h2 id="doar-title">Doar (simulado)</h2>
        <div class="card">
          <form id="donationForm" novalidate>
            <label for="valor">Valor (R$)</label>
            <input id="valor" name="valor" type="number" min="1" required />
            <label for="metodo">Método</label>
            <select id="metodo" name="metodo">
              <option value="pix">PIX</option>
              <option value="cartao">Cartão</option>
              <option value="boleto">Boleto</option>
            </select>
            <div class="form-actions">
              <button class="btn" type="submit">Doar</button>
            </div>
            <div id="donationMsg" class="form-message" aria-live="polite"></div>
          </form>
        </div>
      </section>
    `,
    transparencia: `
      <section aria-labelledby="trans-title">
        <h2 id="trans-title">Transparência</h2>
        <div class="card">
          <p>Relatórios e prestação de contas (simulação). Faça o download dos PDFs no repositório.</p>
          <ul>
            <li><a href="#" aria-label="Baixar relatório 2023">Relatório 2023 (PDF)</a></li>
            <li><a href="#" aria-label="Baixar relatório 2024">Relatório 2024 (PDF)</a></li>
          </ul>
        </div>
      </section>
    `
  };

  
  const SAMPLE_PROJECTS = [
    { title: 'Reforço Escolar', desc: 'Apoio escolar para crianças.', cat: 'educacao' },
    { title: 'Clínica Móvel', desc: 'Atendimento médico comunitário.', cat: 'saude' },
    { title: 'Verde Urbano', desc: 'Reflorestamento local.', cat: 'meioambiente' },
    { title: 'Oficinas Culturais', desc: 'Atividades artísticas para jovens.', cat: 'educacao' }
  ];

  
  function navigateTo(page, opts = {}) {
    
    if (location.hash !== `#${page}`) location.hash = page;
    render(page, opts);
  }

  function render(page, opts = {}) {
    
    app.innerHTML = '';
    const template = TEMPLATES[page] || TEMPLATES['home'];
    app.insertAdjacentHTML('beforeend', template);

   
    if (page === 'home' || page === 'projetos') fillProjects(opts.filter || null);
    if (page === 'voluntariado') initVolForm();
    if (page === 'doar') initDonationForm();

    
    app.focus();
  }

  function fillProjects(filter = null) {
    const grid = document.getElementById('projectsGrid') || document.getElementById('featuredProjects');
    if (!grid) return;
    grid.innerHTML = '';
    const items = SAMPLE_PROJECTS.filter(p => !filter || p.cat === filter);
    items.forEach(p => {
      const div = document.createElement('article');
      div.className = 'card';
      div.innerHTML = `<h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.desc)}</p>
        <div><span class="badge">${escapeHtml(p.cat)}</span></div>
        <div style="margin-top:.6rem;"><button class="btn" data-project="${escapeHtml(p.title)}">Quero me voluntariar</button></div>`;
      grid.appendChild(div);
    });

    
    grid.querySelectorAll('button[data-project]').forEach(b => {
      b.addEventListener('click', () => {
        
        navigateTo('voluntariado');
        setTimeout(() => {
          const mensagem = document.getElementById('vmensagem');
          if (mensagem) mensagem.value = `Interesse no projeto: ${b.dataset.project}`;
          const nomeField = document.getElementById('vnome');
          if (nomeField) nameFieldFocus(); 
        }, 250);
      });
    });
  }

  
  function escapeHtml(str){ return String(str).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  
  function initVolForm(){
    const form = document.getElementById('volForm');
    const msg = document.getElementById('volMsg');
    if(!form) return;
    
    const savedName = localStorage.getItem('vol_name');
    const savedEmail = localStorage.getItem('vol_email');
    if(savedName) document.getElementById('vnome').value = savedName;
    if(savedEmail) document.getElementById('vemail').value = savedEmail;

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const nome = document.getElementById('vnome');
      const email = document.getElementById('vemail');
      let valid = true;
      msg.textContent = '';
      // reset
      nome.classList.remove('input-invalid');
      email.classList.remove('input-invalid');

      if(!nome.value || nome.value.trim().length < 3){
        nome.classList.add('input-invalid');
        msg.textContent = '⚠️ O nome deve ter pelo menos 3 caracteres.';
        msg.style.color = '#d32f2f';
        valid = false;
        nome.focus();
      } else if(!/^\S+@\S+\.\S+$/.test(email.value)){
        email.classList.add('input-invalid');
        msg.textContent = '⚠️ Insira um e-mail válido.';
        msg.style.color = '#d32f2f';
        valid = false;
        email.focus();
      }

      if(valid){
        localStorage.setItem('vol_name', nome.value.trim());
        localStorage.setItem('vol_email', email.value.trim());
        msg.textContent = '✅ Inscrição enviada (simulação). Obrigado!';
        msg.style.color = 'green';
        showToast('Inscrição enviada com sucesso!', 'success');
        form.reset();
      }
    });
  }

  function initDonationForm(){
    const form = document.getElementById('donationForm');
    const msg = document.getElementById('donationMsg');
    if(!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const valor = document.getElementById('valor');
      const metodo = document.getElementById('metodo');
      msg.textContent = '';
      valor.classList.remove('input-invalid');

      if(!valor.value || Number(valor.value) <= 0){
        valor.classList.add('input-invalid');
        msg.textContent = '⚠️ Insira um valor maior que zero.';
        msg.style.color = '#d32f2f';
        valor.focus();
        return;
      }
      msg.textContent = '✅ Doação simulada com sucesso. Obrigado!';
      msg.style.color = 'green';
      showToast(`Doação de R$ ${Number(valor.value).toFixed(2)} (simulada) via ${metodo.value}`, 'success');
      form.reset();
    });
  }

  
  function showToast(text, type='info'){
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    el.style.background = type === 'success' ? '#2a7f62' : (type==='error' ? '#d32f2f' : '#333');
    el.setAttribute('role','status');
    toastContainer.appendChild(el);
    setTimeout(()=>{ el.style.opacity = '0'; el.addEventListener('transitionend', ()=> el.remove()); }, 3500);
  }

  
  hamburger.addEventListener('click', ()=>{
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('show');
  });

  
  function applySavedTheme(){
    if(localStorage.getItem('theme') === 'dark'){ document.documentElement.setAttribute('data-theme','dark'); themeToggle.setAttribute('aria-pressed','true'); }
    if(localStorage.getItem('contrast') === 'high'){ document.documentElement.setAttribute('data-contrast','high'); contrastToggle.setAttribute('aria-pressed','true'); }
  }
  applySavedTheme();

  themeToggle.addEventListener('click', ()=>{
    const active = document.documentElement.getAttribute('data-theme') === 'dark';
    if(active){ document.documentElement.removeAttribute('data-theme'); localStorage.removeItem('theme'); themeToggle.setAttribute('aria-pressed','false'); }
    else{ document.documentElement.setAttribute('data-theme','dark'); localStorage.setItem('theme','dark'); themeToggle.setAttribute('aria-pressed','true'); }
  });

  contrastToggle.addEventListener('click', ()=>{
    const active = document.documentElement.getAttribute('data-contrast') === 'high';
    if(active){ document.documentElement.removeAttribute('data-contrast'); localStorage.removeItem('contrast'); contrastToggle.setAttribute('aria-pressed','false'); }
    else{ document.documentElement.setAttribute('data-contrast','high'); localStorage.setItem('contrast','high'); contrastToggle.setAttribute('aria-pressed','true'); }
  });

  
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      if(menu.classList.contains('show')) menu.classList.remove('show');
    }
  });

  
  function handleHash(){
    const hash = location.hash.replace('#','') || 'home';
    
    const [page, sub] = hash.split('/');
    render(page, sub ? { filter: sub } : {});
  }
  window.addEventListener('hashchange', handleHash);
  
  handleHash();

  
  document.querySelectorAll('[data-page]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const p = btn.getAttribute('data-page');
      const filter = btn.getAttribute('data-filter');
      navigateTo(p, filter ? { filter } : {});
      
      if(menu.classList.contains('show')) menu.classList.remove('show');
    });
  });

  // basic a11y: focus the app root when page changes
  function navigateTo(p, opts){ location.hash = p + (opts && opts.filter ? '/' + opts.filter : ''); }

});
