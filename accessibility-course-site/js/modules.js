(function(){
  'use strict';

  const container = document.getElementById('module-list');
  const progressBar = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');
  const resetBtn = document.getElementById('reset-progress');

  if (!container) return;

  const STORAGE_KEY = 'a11y_course_progress_v1';

  function loadProgress(){
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch(e){
      return {};
    }
  }
  function saveProgress(state){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const state = loadProgress();

  function render(){
    container.innerHTML = '';
    const modules = (window.COURSE_DATA && window.COURSE_DATA.modules) || [];
    let total = 0, done = 0;

    modules.forEach(mod => {
      const details = document.createElement('details');
      details.className = 'module';
      details.open = false;

      const summary = document.createElement('summary');
      summary.textContent = `Module ${mod.id}: ${mod.title}`;
      details.appendChild(summary);

      const list = document.createElement('ul');
      list.className = 'task-list';

      mod.tasks.forEach((task, i) => {
        const li = document.createElement('li');
        const id = `m${mod.id}-t${i}`;
        const checked = !!(state[id]);
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.checked = checked;
        checkbox.addEventListener('change', () => {
          state[id] = checkbox.checked;
          saveProgress(state);
          updateProgress();
        });

        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = task;

        li.appendChild(checkbox);
        li.appendChild(label);
        list.appendChild(li);

        total += 1;
        if (checked) done += 1;
      });

      details.appendChild(list);
      container.appendChild(details);
    });

    updateProgress(total, done);
  }

  function updateProgress(totalCount, doneCount){
    if (typeof totalCount === 'undefined' || typeof doneCount === 'undefined'){
      // recompute
      const modules = (window.COURSE_DATA && window.COURSE_DATA.modules) || [];
      let total = 0, done = 0;
      modules.forEach((mod, mi) => {
        mod.tasks.forEach((task, ti) => {
          total += 1;
          if (state[`m${mod.id}-t${ti}`]) done += 1;
        });
      });
      totalCount = total; doneCount = done;
    }
    const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
    progressBar.style.setProperty('--value', pct + '%');
    progressBar.setAttribute('aria-valuenow', pct.toString());
    progressBar.querySelector('span#progress-label').textContent = pct + '%';
    // visual fill
    progressBar.style.setProperty('--fill', pct + '%');
    progressBar.style.setProperty('--label', `'${pct}%'`);
    progressBar.style.position = 'relative';
    progressBar.style.setProperty('--pct', pct + '%');
    progressBar.style.setProperty('--progress-width', pct + '%');
    progressBar.style.setProperty('--progress-text', pct + '%');
    progressBar.style.setProperty('--width', pct + '%');
    progressBar.style.setProperty('--value', pct + '%');
    progressBar.style.setProperty('--_w', pct + '%');
    progressBar.style.setProperty('--w', pct + '%');
    progressBar.style.setProperty('--barWidth', pct + '%');
    progressBar.style.setProperty('--progress', pct + '%');
    // update pseudo-element width via inline style hack:
    progressBar.style.background = `linear-gradient(to right, #005fcc 0%, #005fcc ${pct}%, transparent ${pct}%, transparent 100%)`;
  }

  resetBtn && resetBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    for (const k in state) delete state[k];
    render();
  });

  render();
})();