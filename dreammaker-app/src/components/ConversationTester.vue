<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>地府求職模式（發話者打勾 + 可編輯訊息）</title>
<style>
  :root{
    --brand:#ff7f50; --ink:#2b2b2b; --muted:#6b7280;
    --panel:#fffaf7; --chip:#ffe8df; --border:#e6a892;
    --bubble-left:#f1f5f9; --bubble-right:#ffe8df;
  }
  .theme-orange{ --brand:#ff7f50; --chip:#ffe8df; --border:#e6a892; }
  .theme-blue  { --brand:#3b82f6; --chip:#e6efff; --border:#a9c7ff; }
  .theme-green { --brand:#22c55e; --chip:#e6ffe9; --border:#a6e8bb; }
  .theme-purple{ --brand:#a855f7; --chip:#f3e8ff; --border:#d5b5ff; }

  *{box-sizing:border-box}
  body{margin:0;background:#f0f2f5;font:14px/1.6 ui-sans-serif,system-ui,-apple-system,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;display:grid;place-items:center;padding:16px;}
  .app{width:min(420px,100vw);height:min(760px,100vh - 24px);background:var(--panel);border:1px solid var(--border);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.08);overflow:hidden;position:relative;display:grid;grid-template-rows:auto auto 1fr auto;}

  /* Header */
  .header{background:linear-gradient(180deg,#ffd6c7 0%, #ffd6c780 100%);padding:8px 10px;display:flex;align-items:center;border-bottom:1px solid var(--border);}
  .right-group{margin-left:auto;display:flex;align-items:center;gap:8px}
  .badge{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--border);padding:4px 10px;border-radius:999px;}
  .badge .status-icon{width:18px;height:18px;display:grid;place-items:center;border-radius:50%;background:var(--chip);border:1px solid var(--border);font-size:12px}
  .mode-text{font-weight:700}
  .coins{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--border);padding:4px 10px;border-radius:999px;}
  .coins .amount{color:#e63946;font-weight:800}
  .menu-btn{width:30px;height:30px;border-radius:10px;border:1px solid var(--border);background:#fff;display:grid;place-items:center;cursor:pointer}
  .menu-btn span{font-size:18px;line-height:1}

  /* Sub bar */
  .subbar{background:linear-gradient(0deg,#fff,#fff0);border-bottom:2px solid var(--brand);padding:10px 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
  .tab{display:flex;align-items:center;gap:6px;color:#fff;background:var(--brand);padding:6px 10px;border-radius:999px;font-weight:600;}
  .pill{flex:1 1 160px;min-width:140px;max-width:220px;height:28px;border-radius:999px;border:1px solid var(--border);background:#fff;position:relative;display:grid;place-items:center;font-weight:700;color:var(--muted);}
  .pill .fill{position:absolute;left:2px;top:2px;bottom:2px;width:50%;border-radius:999px;background:var(--chip);border:1px solid var(--border);transition:width .25s ease;}
  .pill .label{position:relative;z-index:1;white-space:nowrap;display:inline-flex;gap:4px}
  .stage-hint{padding:4px 8px;border:1px solid var(--border);border-radius:999px;background:#fff;color:#7a4b3a}
  .right-stat{margin-left:auto;color:#fff;background:var(--brand);padding:6px 10px;border-radius:999px;font-weight:600;white-space:nowrap;flex:0 0 auto}

  /* Chat */
  .chat{padding:12px;overflow:auto;background:#fff}
  .msg{display:grid;grid-template-columns:34px 1fr;gap:8px;margin:10px 0;position:relative}
  .msg.right{grid-template-columns:1fr 34px}
  .avatar{width:34px;height:34px;border-radius:50%;background:#e5e7eb;border:1px solid #d1d5db;display:grid;place-items:center;font-size:12px;color:#9ca3af;overflow:hidden}
  .avatar img{width:100%;height:100%;object-fit:cover}
  .avatar.npc{background:#ffd5c7;border-color:#ffc3ae}
  .bubble{max-width:80%;padding:10px 12px;border-radius:14px;border:1px solid #e5e7eb;background:var(--bubble-left);cursor:pointer}
  .right .bubble{justify-self:end;background:var(--bubble-right)}

  /* Toolbar */
  .toolbar{background:#fff;border-top:1px solid #e5e7eb;padding:10px;display:flex;gap:10px;align-items:center}
  .input{flex:1;height:36px;border-radius:999px;border:1px solid #e5e7eb;padding:0 12px}
  .fab,.cta{width:40px;height:40px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;display:grid;place-items:center;cursor:pointer}
  .cta{background:var(--brand);color:#fff;clip-path:polygon(50% 0%,95% 35%,78% 100%,22% 100%,5% 35%)}
  .sender-chip{display:none;} /* 不在輸入框旁顯示名稱 */
  .sender-menu{position:absolute;bottom:64px;left:10px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);display:none;overflow:auto;max-height:220px}
  .sender-menu.open{display:block;}
  .sender-menu button{display:flex;align-items:center;gap:8px;width:200px;padding:8px 10px;background:#fff;border:none;text-align:left;cursor:pointer}
  .sender-menu button img{width:20px;height:20px;border-radius:50%;object-fit:cover}
  .sender-menu button:hover{background:#f6f6f6}

  /* Drawer */
  .drawer{position:absolute;top:0;right:0;bottom:0;width:min(380px,92vw);background:#fff;border-left:1px solid var(--border);transform:translateX(100%);transition:transform .28s ease;z-index:20;display:flex;flex-direction:column}
  .drawer.open{transform:translateX(0)}
  .drawer header{padding:12px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;background:#fff}
  .drawer .body{padding:12px;overflow:auto;background:var(--panel)}
  .overlay{position:absolute;inset:0;background:rgba(0,0,0,.12);opacity:0;pointer-events:none;transition:opacity .28s ease;z-index:10}
  .overlay.show{opacity:1;pointer-events:auto}

  /* Drawer tabs */
  .tabs-head{display:flex;gap:8px;margin-bottom:10px}
  .tabs-head button{flex:1;padding:8px 10px;border:1px solid #ddd;background:#fff;border-radius:8px;cursor:pointer}
  .tabs-head button.active{border-color:var(--brand);color:#fff;background:var(--brand)}
  .tab-panel{display:none}
  .tab-panel.active{display:block}

  /* form groups */
  .fg{display:grid;grid-template-columns:110px 1fr;gap:8px;align-items:center;margin:8px 0}
  .fg label{font-weight:600}
  .fg input,.fg select{border:1px solid #d1d5db;border-radius:8px;padding:8px;width:100%}

  /* Roles editor */
  .role-card{display:grid;grid-template-columns:48px 1fr auto;gap:10px;align-items:center;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:8px;margin:8px 0}
  .role-card .avatar{width:48px;height:48px;border-radius:50%}
  .role-fields{display:grid;grid-template-columns:1fr 110px;gap:8px}
  .role-actions{display:flex;gap:6px}
  .add-role{margin-top:8px;width:100%;padding:8px 12px;border:1px dashed var(--brand);border-radius:10px;background:#fff;cursor:pointer}
  .limit-note{font-size:12px;color:#666}

  /* 氣泡選單 & 編輯對話框 */
  .msg-menu{position:absolute;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:30;display:none;overflow:hidden}
  .msg-menu.open{display:block;}
  .msg-menu button{display:block;width:140px;padding:10px 12px;border:none;background:#fff;text-align:left;cursor:pointer}
  .msg-menu button:hover{background:#f6f6f6}
  .dialog{position:absolute;inset:0;display:none;z-index:40;align-items:center;justify-content:center}
  .dialog.show{display:flex;}
  .dialog .sheet{width:min(340px,90vw);background:#fff;border:1px solid #ddd;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.25);padding:12px;display:grid;gap:8px}
  .dialog textarea{width:100%;min-height:96px;padding:8px;border:1px solid #d1d5db;border-radius:8px;resize:vertical}
  .dialog .row{display:flex;gap:8px;justify-content:flex-end}
  .btn{padding:6px 12px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer}
  .btn.primary{background:var(--brand);color:#fff;border-color:var(--brand)}
</style>
</head>
<body class="theme-orange">
  <main class="app" role="application" aria-label="地府求職模式">

    <!-- Header -->
    <header class="header">
      <div class="right-group">
        <div class="badge">
          <div class="status-icon" id="statusIcon">🌀</div>
          <div class="mode-text" id="modeText">無央保密模式</div>
        </div>
        <div class="coins">
          <span class="coin-icon" id="coinIcon">🪙</span>
          <span class="amount" id="coinAmount">999,999</span>
        </div>
        <button class="menu-btn" id="openDrawer" aria-label="開啟設定"><span>⋮</span></button>
      </div>
    </header>

    <!-- Sub bar -->
    <section class="subbar">
      <div class="tab"><span class="tab-icon" id="tabIcon">❖</span></div>
      <div class="stage-hint" id="tabCurrent">遊魂</div>
      <div class="stage-hint" id="tabNext">打工仔</div>
      <div class="pill" aria-label="進度">
        <div class="fill" id="pillFill" style="width:50%"></div>
        <div class="label"><span id="progressName">打工</span>：<span id="progressPct">50%</span></div>
      </div>
      <div class="right-stat" id="rightStat">困惑度：50%</div>
    </section>

    <!-- Chat -->
    <section class="chat" id="chat" aria-label="對話">
      <article class="msg">
        <div class="avatar"></div>
        <div class="bubble">什麼年代了！還在用人工作業？生死簿不會還是用毛筆手寫的吧？</div>
      </article>
      <article class="msg right">
        <div class="bubble">哇！妳怎麼知道？我們的毛筆還是用上等狼毫做的呢！</div>
        <div class="avatar npc"></div>
      </article>
      <div style="height:24px"></div>
    </section>

    <!-- Toolbar -->
    <footer class="toolbar">
      <button class="fab" id="senderBtn" aria-label="切換發話者">＋</button>
      <span class="sender-chip" id="senderChip">（hidden）</span>
      <input class="input" id="msgInput" placeholder="輸入訊息…" />
      <button class="cta" id="sendBtn" aria-label="送出訊息">◆</button>
      <div class="sender-menu" id="senderMenu" role="menu" aria-label="選擇發話者"></div>
    </footer>

    <!-- Overlay -->
    <div class="overlay" id="overlay"></div>

    <!-- Drawer -->
    <aside class="drawer" id="drawer" aria-label="設定">
      <header>
        <strong>設定</strong>
        <button id="closeDrawer" class="menu-btn" aria-label="關閉設定"><span>✕</span></button>
      </header>
      <div class="body">
        <div class="tabs-head">
          <button class="active" data-tab="uiTab">介面設定</button>
          <button data-tab="roleTab">角色設定</button>
        </div>

        <!-- UI settings -->
        <div class="tab-panel active" id="uiTab">
          <div class="fg"><label>對話模式</label><input id="inpMode" placeholder="無央保密模式" /></div>
          <div class="fg"><label>代幣ICON</label><input id="inpCoinIcon" placeholder="🪙 或 emoji/字元" /></div>
          <div class="fg"><label>代幣數量</label><input id="inpCoinAmount" type="number" placeholder="999999" /></div>
          <div class="fg"><label>狀態ICON</label><input id="inpStatusIcon" placeholder="🌀 或 emoji/字元" /></div>
          <div class="fg"><label>目前狀態</label><input id="inpCurrent" placeholder="遊魂" /></div>
          <div class="fg"><label>下階段狀態</label><input id="inpNext" placeholder="打工仔" /></div>
          <div class="fg"><label>進度名稱</label><input id="inpProgName" placeholder="打工" /></div>
          <div class="fg"><label>百分比</label><input id="inpPct" type="number" min="0" max="100" placeholder="50" /></div>
          <div class="fg">
            <label>色調</label>
            <select id="inpTheme">
              <option value="orange" selected>橘色</option>
              <option value="blue">藍色</option>
              <option value="green">綠色</option>
              <option value="purple">紫色</option>
            </select>
          </div>
        </div>

        <!-- Role settings -->
        <div class="tab-panel" id="roleTab">
          <div class="limit-note">最多可新增 10 位角色。可上傳頭貼（建議 1:1）並設定名稱。</div>
          <div id="rolesWrap"></div>
          <button class="add-role" id="addRoleBtn">＋ 新增角色</button>
        </div>
      </div>
    </aside>

    <!-- 氣泡選單 -->
    <div class="msg-menu" id="msgMenu" role="menu" aria-label="訊息操作">
      <button type="button" data-act="edit">✏️ 編輯訊息</button>
      <button type="button" data-act="del">🗑️ 刪除</button>
    </div>

    <!-- 編輯對話框 -->
    <div class="dialog" id="editDialog" aria-modal="true" role="dialog">
      <div class="sheet">
        <strong>編輯訊息</strong>
        <textarea id="editTextarea" placeholder="輸入新內容…"></textarea>
        <div class="row">
          <button class="btn" id="editCancel">取消</button>
          <button class="btn primary" id="editSave">儲存</button>
        </div>
      </div>
    </div>

  </main>

<script>
  /* ===== Drawer open/close ===== */
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const openBtn = document.getElementById('openDrawer');
  const closeBtn = document.getElementById('closeDrawer');
  function openDrawer(){ drawer.classList.add('open'); overlay.classList.add('show'); }
  function closeDrawer(){ drawer.classList.remove('open'); overlay.classList.remove('show'); }
  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  /* ===== Tabs in drawer ===== */
  document.querySelectorAll('.tabs-head button').forEach(b=>{
    b.addEventListener('click', ()=>{
      document.querySelectorAll('.tabs-head button').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById(b.dataset.tab).classList.add('active');
    });
  });

  /* ===== UI settings binding ===== */
  const elModeText = document.getElementById('modeText');
  const elCoinIcon = document.getElementById('coinIcon');
  const elCoinAmount = document.getElementById('coinAmount');
  const elStatusIcon = document.getElementById('statusIcon');
  const elTabIcon = document.getElementById('tabIcon');
  const elTabCurrent = document.getElementById('tabCurrent');
  const elTabNext = document.getElementById('tabNext');
  const elProgName = document.getElementById('progressName');
  const elProgPctText = document.getElementById('progressPct');
  const elPillFill = document.getElementById('pillFill');
  const elRightStat = document.getElementById('rightStat');

  const inpMode = document.getElementById('inpMode');
  const inpCoinIcon = document.getElementById('inpCoinIcon');
  const inpCoinAmount = document.getElementById('inpCoinAmount');
  const inpStatusIcon = document.getElementById('inpStatusIcon');
  const inpCurrent = document.getElementById('inpCurrent');
  const inpNext = document.getElementById('inpNext');
  const inpProgName = document.getElementById('inpProgName');
  const inpPct = document.getElementById('inpPct');
  const inpTheme = document.getElementById('inpTheme');

  function applyUI(){
    if (inpMode.value) elModeText.textContent = inpMode.value;
    if (inpCoinIcon.value) elCoinIcon.textContent = inpCoinIcon.value;
    if (inpCoinAmount.value !== '') elCoinAmount.textContent = Number(inpCoinAmount.value).toLocaleString();
    if (inpStatusIcon.value){ elStatusIcon.textContent = inpStatusIcon.value; elTabIcon.textContent = inpStatusIcon.value; }
    if (inpCurrent.value) elTabCurrent.textContent = inpCurrent.value;
    if (inpNext.value) elTabNext.textContent = inpNext.value;
    if (inpProgName.value) elProgName.textContent = inpProgName.value;
    if (inpPct.value !== ''){
      const v = Math.max(0, Math.min(100, Number(inpPct.value)));
      elProgPctText.textContent = `${v}%`;
      elPillFill.style.width = `${v}%`;
      elRightStat.textContent = `${inpProgName.value || elProgName.textContent}：${v}%`;
    }
    document.body.className = `theme-${inpTheme.value}`;
  }
  [inpMode, inpCoinIcon, inpCoinAmount, inpStatusIcon, inpCurrent, inpNext, inpProgName, inpPct, inpTheme]
    .forEach(el => el.addEventListener('input', applyUI));
  applyUI();

  /* ===== Roles state & editor ===== */
  const MAX_ROLES = 10;
  const rolesWrap = document.getElementById('rolesWrap');
  const addRoleBtn = document.getElementById('addRoleBtn');
  let roles = [
    { id: crypto.randomUUID(), name: '自己', avatar: '', side: 'left' },
    { id: crypto.randomUUID(), name: 'NPC',  avatar: '', side: 'right' }
  ];
  let currentRoleId = roles[0].id;

  function renderRoles(){
    rolesWrap.innerHTML = '';
    roles.forEach(role=>{
      const card = document.createElement('div');
      card.className = 'role-card';

      const av = document.createElement('div');
      av.className = 'avatar';
      av.innerHTML = role.avatar ? `<img src="${role.avatar}" alt="${role.name}">` : role.name.slice(0,2);

      const fields = document.createElement('div');
      fields.className = 'role-fields';
      const nameInput = document.createElement('input');
      nameInput.value = role.name;
      nameInput.placeholder = '角色名稱';
      const fileInput = document.createElement('input');
      fileInput.type = 'file'; fileInput.accept = 'image/*';

      fields.appendChild(nameInput);
      fields.appendChild(fileInput);

      const actions = document.createElement('div');
      actions.className = 'role-actions';
      const del = document.createElement('button');
      del.textContent = '刪除'; del.className = 'menu-btn';
      actions.appendChild(del);

      card.appendChild(av); card.appendChild(fields); card.appendChild(actions);
      rolesWrap.appendChild(card);

      nameInput.addEventListener('input', ()=>{
        role.name = nameInput.value || '未命名';
        av.textContent = '';
        if(role.avatar){ av.innerHTML = `<img src="${role.avatar}" alt="${role.name}">`; }
        else{ av.textContent = role.name.slice(0,2); }
        refreshSenderMenu();
      });

      fileInput.addEventListener('change', ()=>{
        const f = fileInput.files[0];
        if(!f) return;
        if(f.size > 2*1024*1024){ alert('圖片大小請小於 2MB'); fileInput.value=''; return; }
        const fr = new FileReader();
        fr.onload = e=>{
          role.avatar = e.target.result;
          av.innerHTML = `<img src="${role.avatar}" alt="${role.name}">`;
          refreshSenderMenu();
        };
        fr.readAsDataURL(f);
      });

      del.addEventListener('click', ()=>{
        if(roles.length <= 1){ alert('至少保留 1 位角色'); return; }
        roles = roles.filter(r=>r.id !== role.id);
        if(currentRoleId === role.id){ currentRoleId = roles[0].id; }
        renderRoles(); refreshSenderMenu();
      });
    });

    addRoleBtn.disabled = roles.length >= MAX_ROLES;
    addRoleBtn.textContent = roles.length >= MAX_ROLES ? '已達上限（10）' : '＋ 新增角色';
  }
  addRoleBtn.addEventListener('click', ()=>{
    if(roles.length >= MAX_ROLES) return;
    roles.push({ id: crypto.randomUUID(), name: `角色${roles.length+1}`, avatar:'', side:'right' });
    renderRoles(); refreshSenderMenu();
  });
  renderRoles();

  /* ===== Sender menu ===== */
  const senderBtn = document.getElementById('senderBtn');
  const senderMenu = document.getElementById('senderMenu');
  function refreshSenderMenu(){
    senderMenu.innerHTML = '';
    roles.forEach(role=>{
      const btn = document.createElement('button');
      btn.type='button'; btn.dataset.id = role.id;
      const check = role.id === currentRoleId ? '✔ ' : '';
      btn.innerHTML = `${role.avatar ? `<img src="${role.avatar}" alt="">` : ''}<span>${check}${role.name}</span>`;
      btn.addEventListener('click', ()=>{
        currentRoleId = role.id;
        refreshSenderMenu();
        senderMenu.classList.remove('open');
      });
      senderMenu.appendChild(btn);
    });
  }
  refreshSenderMenu();
  senderBtn.addEventListener('click', (e)=>{ e.stopPropagation(); senderMenu.classList.toggle('open'); });
  document.addEventListener('click', ()=> senderMenu.classList.remove('open'));

  /* ===== Chat sending ===== */
  const chat = document.getElementById('chat');
  const msgInput = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');

  function createMessage(text, role){
    const article = document.createElement('article');
    const isRight = role.name !== '自己'; // 仍沿用原邏輯（可改為 role.side === 'right'）
    article.className = 'msg' + (isRight ? ' right' : '');

    const avatar = document.createElement('div');
    avatar.className = 'avatar' + (isRight ? ' npc' : '');
    // 只顯示頭貼或縮寫，不顯示名稱文字
    if(role.avatar){
      const img = document.createElement('img'); img.src = role.avatar; img.alt = role.name; avatar.appendChild(img);
    }else{
      avatar.textContent = role.name.slice(0,2);
    }

    const bubble = document.createElement('div');
    bubble.className = 'bubble'; bubble.textContent = text;

    if(isRight){ article.appendChild(bubble); article.appendChild(avatar); }
    else{ article.appendChild(avatar); article.appendChild(bubble); }
    return article;
  }

  function send(){
    const text = msgInput.value.trim();
    if(!text) return;
    const role = roles.find(r=>r.id===currentRoleId) || roles[0];
    const node = createMessage(text, role);
    const spacer = chat.lastElementChild;
    chat.insertBefore(node, spacer);
    msgInput.value = '';
    chat.scrollTop = chat.scrollHeight;
  }
  sendBtn.addEventListener('click', send);
  msgInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }});

  /* ===== Bubble: 編輯 / 刪除 ===== */
  const msgMenu = document.getElementById('msgMenu');
  const editDialog = document.getElementById('editDialog');
  const editTextarea = document.getElementById('editTextarea');
  const editCancel = document.getElementById('editCancel');
  const editSave = document.getElementById('editSave');
  let targetBubble = null;

  function openMsgMenu(x, y){
    const app = document.querySelector('.app').getBoundingClientRect();
    msgMenu.classList.add('open');
    const w = msgMenu.offsetWidth || 160;
    const h = msgMenu.offsetHeight || 90;
    let left = x - app.left, top  = y - app.top;
    if(left + w > app.width) left = app.width - w - 8;
    if(top  + h > app.height) top  = app.height - h - 8;
    if(left < 8) left = 8; if(top < 8) top = 8;
    msgMenu.style.left = left + 'px'; msgMenu.style.top  = top  + 'px';
  }
  function closeMsgMenu(){ msgMenu.classList.remove('open'); }

  // ==== 新增：行動裝置長按開啟氣泡選單 ====
  let touchTimer = null;
  let touchStart = null; // {x, y}
  let openedByLongPress = false;
  const LONG_PRESS_MS = 400;
  const MOVE_THRESHOLD = 10; // px

  function clearTouchTimer(){
    if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
  }

  chat.addEventListener('touchstart', (e)=>{
    const b = e.target.closest('.bubble');
    if (!b) return;

    // 記錄起點，準備判斷是否是滑動
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };

    // 設定長按計時器
    clearTouchTimer();
    touchTimer = setTimeout(()=>{
      targetBubble = b;
      openedByLongPress = true;
      openMsgMenu(t.clientX, t.clientY);
    }, LONG_PRESS_MS);
  }, { passive: true });

  chat.addEventListener('touchmove', (e)=>{
    if (!touchStart) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - touchStart.x);
    const dy = Math.abs(t.clientY - touchStart.y);
    // 移動超過門檻就取消長按（代表使用者在捲動或拖移）
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      clearTouchTimer();
    }
  }, { passive: true });

  chat.addEventListener('touchend', ()=>{
    touchStart = null;
    clearTouchTimer();
    // 延後一個 tick 再重置，避免 click 事件馬上跟進
    setTimeout(()=>{ openedByLongPress = false; }, 0);
  }, { passive: true });

  chat.addEventListener('touchcancel', ()=>{
    touchStart = null;
    clearTouchTimer();
    openedByLongPress = false;
  }, { passive: true });

  // 修改：原本的 click 監聽，加入「長按後抑制 click」
  chat.addEventListener('click', (e)=>{
    if (openedByLongPress) { // 長按已開啟選單 -> 忽略這次 click，避免二次觸發
      openedByLongPress = false;
      return;
    }
    const b = e.target.closest('.bubble');
    if(!b) { closeMsgMenu(); return; }
    targetBubble = b;
    openMsgMenu(e.clientX, e.clientY);
    e.stopPropagation();
  });

  msgMenu.addEventListener('click', (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const act = btn.dataset.act;
    if(act === 'edit'){
      closeMsgMenu();
      editTextarea.value = targetBubble ? targetBubble.textContent : '';
      editDialog.classList.add('show'); editTextarea.focus();
    }else if(act === 'del'){
      const msg = targetBubble && targetBubble.parentElement; if(msg) msg.remove();
      closeMsgMenu();
    }
    e.stopPropagation();
  });

  document.addEventListener('click', ()=>{ closeMsgMenu(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ closeMsgMenu(); editDialog.classList.remove('show'); }});
  editCancel.addEventListener('click', ()=> editDialog.classList.remove('show'));
  editSave.addEventListener('click', ()=>{
    const v = editTextarea.value.trim();
    if(targetBubble && v){ targetBubble.textContent = v; }
    editDialog.classList.remove('show');
  });
</script>
</body>
</html>
