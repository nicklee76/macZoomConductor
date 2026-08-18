/**
 * macZoomConductor — Interactive Product Page Script
 * Powers the live simulator, tree traversal, keyboard shortcuts,
 * display scaling engine, and UI interactions.
 */

// --- Initial Tree Data Model ---
const initialTreeData = [
  {
    id: 'chrome',
    type: 'browser',
    name: 'Google Chrome',
    icon: '🌐',
    expanded: true,
    windows: [
      {
        id: 'chrome-w1',
        type: 'window',
        name: '🚀 Production Admin & Metrics',
        display: 'Studio Display 4K',
        displayId: 'studio4k',
        expanded: true,
        tabs: [
          {
            id: 'tab-aws',
            type: 'tab',
            title: 'AWS Cloud Console',
            url: 'https://console.aws.amazon.com/dashboard',
            zoom: 125,
            isException: false,
            isActive: true,
            browser: 'Google Chrome'
          },
          {
            id: 'tab-datadog',
            type: 'tab',
            title: 'Datadog APM & Service Map',
            url: 'https://app.datadoghq.com/apm/services',
            zoom: 125,
            isException: false,
            isActive: false,
            browser: 'Google Chrome'
          },
          {
            id: 'tab-grafana',
            type: 'tab',
            title: 'Grafana Cluster Dashboards',
            url: 'https://grafana.internal.infra/d/prod',
            zoom: 125,
            isException: false,
            isActive: false,
            browser: 'Google Chrome'
          }
        ]
      },
      {
        id: 'chrome-w2',
        type: 'window',
        name: '📚 Documentation & RFCs',
        display: 'MacBook Pro Retina',
        displayId: 'retina',
        expanded: true,
        tabs: [
          {
            id: 'tab-swift',
            type: 'tab',
            title: 'SwiftUI View Architecture — Apple Docs',
            url: 'https://developer.apple.com/documentation/swiftui',
            zoom: 100,
            isException: false,
            isActive: false,
            browser: 'Google Chrome'
          },
          {
            id: 'tab-github',
            type: 'tab',
            title: 'macZoomConductor Pull Requests',
            url: 'https://github.com/bricolageTheory/macZoomConductor/pulls',
            zoom: 100,
            isException: false,
            isActive: false,
            browser: 'Google Chrome'
          }
        ]
      }
    ]
  },
  {
    id: 'safari',
    type: 'browser',
    name: 'Safari',
    icon: '🧭',
    expanded: true,
    windows: [
      {
        id: 'safari-w1',
        type: 'window',
        name: '💼 Client Research & Jira',
        display: 'Studio Display 4K',
        displayId: 'studio4k',
        expanded: true,
        tabs: [
          {
            id: 'tab-jira',
            type: 'tab',
            title: 'Sprint Board — Q3 Core Engine',
            url: 'https://jira.company.com/secure/RapidBoard.jspa',
            zoom: 125,
            isException: false,
            isActive: true,
            browser: 'Safari'
          },
          {
            id: 'tab-figma',
            type: 'tab',
            title: 'Design System — Figma (100% Locked)',
            url: 'https://figma.com/file/xyz/Design-System',
            zoom: 100,
            isException: true,
            isActive: false,
            browser: 'Safari'
          },
          {
            id: 'tab-maps',
            type: 'tab',
            title: 'Google Maps (100% Exception)',
            url: 'https://maps.google.com/',
            zoom: 100,
            isException: true,
            isActive: false,
            browser: 'Safari'
          }
        ]
      }
    ]
  },
  {
    id: 'firefox',
    type: 'browser',
    name: 'Mozilla Firefox',
    icon: '🦊',
    expanded: false,
    windows: [
      {
        id: 'firefox-w1',
        type: 'window',
        name: '🛡️ Security Testing & Diagnostics',
        display: 'MacBook Pro Retina',
        displayId: 'retina',
        expanded: true,
        tabs: [
          {
            id: 'tab-ff-debug',
            type: 'tab',
            title: 'Firefox WebExtension Debugger',
            url: 'about:debugging#/runtime/this-firefox',
            zoom: 100,
            isException: false,
            isActive: true,
            browser: 'Mozilla Firefox'
          }
        ]
      }
    ]
  }
];

// --- App State ---
const state = {
  tree: JSON.parse(JSON.stringify(initialTreeData)),
  selectedId: 'tab-aws',
  filterText: '',
  filterOverriddenOnly: false,
  currentDisplayProfile: 'studio4k', // 'studio4k' (125%), 'retina' (100%), 'ultrawide' (110%)
  displayScales: {
    studio4k: { name: 'Studio Display 4K', defaultZoom: 125 },
    retina: { name: 'MacBook Pro Retina', defaultZoom: 100 },
    ultrawide: { name: 'LG 38" Ultrawide', defaultZoom: 110 }
  }
};

// --- DOM References ---
const dom = {
  treeContainer: document.getElementById('simulatorTree'),
  treeStats: document.getElementById('treeStats'),
  inspectType: document.getElementById('inspectType'),
  inspectTitle: document.getElementById('inspectTitle'),
  inspectBadge: document.getElementById('inspectBadge'),
  inspectZoomValue: document.getElementById('inspectZoomValue'),
  btnZoomMinus: document.getElementById('btnZoomMinus'),
  btnZoomPlus: document.getElementById('btnZoomPlus'),
  btnZoomReset: document.getElementById('btnZoomReset'),
  btnTriggerFocus: document.getElementById('btnTriggerFocus'),
  btnTriggerRename: document.getElementById('btnTriggerRename'),
  btnTriggerLock: document.getElementById('btnTriggerLock'),
  mockUrlBar: document.getElementById('mockUrlBar'),
  mockScaleBadge: document.getElementById('mockScaleBadge'),
  mockViewport: document.getElementById('mockViewport'),
  simSearchInput: document.getElementById('simSearchInput'),
  displaySelector: document.getElementById('displaySelector'),
  btnToggleAll: document.getElementById('btnToggleAll'),
  btnToggleOverridden: document.getElementById('btnToggleOverridden'),
  btnCopyInstall: document.getElementById('btnCopyInstall'),
  statusBarMsg: document.getElementById('statusBarMsg')
};

// --- Helper: Find Node in Tree ---
function findNode(id, tree = state.tree) {
  for (const b of tree) {
    if (b.id === id) return { node: b, type: 'browser', parent: null };
    for (const w of b.windows) {
      if (w.id === id) return { node: w, type: 'window', parent: b };
      for (const t of w.tabs) {
        if (t.id === id) return { node: t, type: 'tab', parent: w, grandParent: b };
      }
    }
  }
  return null;
}

// --- Helper: Get Flattened Visible Rows for Navigation ---
function getVisibleRows() {
  const rows = [];
  const query = state.filterText.toLowerCase().trim();

  state.tree.forEach(browser => {
    let browserMatches = !query || browser.name.toLowerCase().includes(query);
    const visibleWindows = [];

    browser.windows.forEach(win => {
      let winMatches = !query || win.name.toLowerCase().includes(query) || win.display.toLowerCase().includes(query);
      const visibleTabs = win.tabs.filter(tab => {
        if (state.filterOverriddenOnly && !tab.isException && tab.zoom === 100) return false;
        if (!query) return true;
        return tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query) || winMatches || browserMatches;
      });

      if (visibleTabs.length > 0 || winMatches || browserMatches) {
        visibleWindows.push({ window: win, tabs: visibleTabs });
      }
    });

    if (visibleWindows.length > 0 || browserMatches) {
      rows.push({ id: browser.id, type: 'browser', data: browser });
      if (browser.expanded) {
        visibleWindows.forEach(({ window: win, tabs }) => {
          rows.push({ id: win.id, type: 'window', data: win, parent: browser });
          if (win.expanded) {
            tabs.forEach(tab => {
              rows.push({ id: tab.id, type: 'tab', data: tab, parent: win });
            });
          }
        });
      }
    }
  });

  return rows;
}

// --- Render Tree View ---
function renderTree() {
  const visibleRows = getVisibleRows();
  dom.treeContainer.innerHTML = '';

  let totalTabs = 0;
  let totalWindows = 0;
  state.tree.forEach(b => {
    totalWindows += b.windows.length;
    b.windows.forEach(w => { totalTabs += w.tabs.length; });
  });
  dom.treeStats.textContent = `${state.tree.length} Browsers • ${totalWindows} Windows • ${totalTabs} Tabs`;

  visibleRows.forEach(row => {
    const el = document.createElement('div');
    el.className = `tree-node ${row.type}-row`;
    if (row.id === state.selectedId) {
      el.classList.add('selected');
    }

    if (row.type === 'browser') {
      const arrow = row.data.expanded ? '▼' : '▶';
      el.innerHTML = `
        <span class="node-arrow">${arrow}</span>
        <span class="node-icon">${row.data.icon}</span>
        <span class="node-title">${row.data.name}</span>
        <span class="node-badge badge-zoom">${row.data.windows.reduce((acc, w) => acc + w.tabs.length, 0)} tabs</span>
      `;
      el.addEventListener('click', () => {
        row.data.expanded = !row.data.expanded;
        selectNode(row.id);
      });
    } else if (row.type === 'window') {
      const arrow = row.data.expanded ? '▼' : '▶';
      el.innerHTML = `
        <span class="node-arrow">${arrow}</span>
        <span class="node-icon">🪟</span>
        <span class="node-title">${row.data.name}</span>
        <span class="node-badge badge-display">${row.data.display}</span>
      `;
      el.addEventListener('click', () => {
        selectNode(row.id);
      });
    } else if (row.type === 'tab') {
      const tab = row.data;
      let badgeHtml = '';
      if (tab.isException) {
        badgeHtml = `<span class="node-badge badge-exception">Exception 🔒 100%</span>`;
      } else {
        badgeHtml = `<span class="node-badge badge-zoom">${tab.zoom}%</span>`;
      }

      el.innerHTML = `
        <span class="node-icon">${tab.isActive ? '🟢' : '⚪'}</span>
        <span class="node-title">${tab.title}</span>
        ${badgeHtml}
      `;
      el.addEventListener('click', () => {
        selectNode(row.id);
      });
    }

    dom.treeContainer.appendChild(el);
  });

  updateInspector();
}

// --- Select a Node ---
function selectNode(id) {
  state.selectedId = id;
  renderTree();
}

// --- Update Node Inspector & Live Preview ---
function updateInspector() {
  const result = findNode(state.selectedId);
  if (!result) return;

  const { node, type, parent } = result;

  if (type === 'tab') {
    dom.inspectType.textContent = 'TAB';
    dom.inspectTitle.textContent = node.title;
    dom.inspectBadge.textContent = node.isActive ? 'Active Selected Tab' : 'Background Tab';
    dom.inspectZoomValue.textContent = `${node.zoom}%`;
    dom.mockUrlBar.textContent = node.url;
    dom.mockScaleBadge.textContent = `Rendered Scale: ${node.zoom}%`;

    // Apply live visual scale to virtual viewport
    const scaleRatio = node.zoom / 100;
    dom.mockViewport.style.transform = `scale(${scaleRatio})`;

    // Lock button state
    if (node.isException) {
      dom.btnTriggerLock.textContent = '🔓 Unlock Exception';
      dom.btnZoomPlus.disabled = true;
      dom.btnZoomMinus.disabled = true;
      dom.inspectZoomValue.style.color = 'var(--accent-amber)';
    } else {
      dom.btnTriggerLock.textContent = '🔒 Lock Exception (100%)';
      dom.btnZoomPlus.disabled = false;
      dom.btnZoomMinus.disabled = false;
      dom.inspectZoomValue.style.color = 'var(--accent-cyan)';
    }
  } else if (type === 'window') {
    dom.inspectType.textContent = 'WINDOW';
    dom.inspectTitle.textContent = node.name;
    dom.inspectBadge.textContent = `Display: ${node.display}`;
    dom.inspectZoomValue.textContent = `${state.displayScales[node.displayId]?.defaultZoom || 100}%`;
    dom.mockUrlBar.textContent = `Window ID: ${node.id} (${node.tabs.length} tabs)`;
    dom.mockScaleBadge.textContent = `Display Default`;
    dom.mockViewport.style.transform = `scale(${((state.displayScales[node.displayId]?.defaultZoom || 100) / 100)})`;
    dom.btnZoomPlus.disabled = false;
    dom.btnZoomMinus.disabled = false;
  } else if (type === 'browser') {
    dom.inspectType.textContent = 'BROWSER';
    dom.inspectTitle.textContent = node.name;
    dom.inspectBadge.textContent = 'Native Bridge Connected';
    dom.inspectZoomValue.textContent = '100%';
    dom.mockUrlBar.textContent = `${node.name} Multiplexed Native Bridge`;
    dom.mockScaleBadge.textContent = '100%';
    dom.mockViewport.style.transform = 'scale(1)';
  }
}

// --- Zoom Controls Actions ---
function adjustZoom(delta) {
  const result = findNode(state.selectedId);
  if (!result) return;

  if (result.type === 'tab') {
    if (result.node.isException) return;
    let newZoom = result.node.zoom + delta;
    if (newZoom < 25) newZoom = 25;
    if (newZoom > 500) newZoom = 500;
    result.node.zoom = newZoom;
    renderTree();
  } else if (result.type === 'window') {
    result.node.tabs.forEach(t => {
      if (!t.isException) {
        let newZoom = t.zoom + delta;
        if (newZoom >= 25 && newZoom <= 500) t.zoom = newZoom;
      }
    });
    renderTree();
  }
}

function resetZoom() {
  const result = findNode(state.selectedId);
  if (!result) return;
  if (result.type === 'tab') {
    result.node.zoom = 100;
    result.node.isException = false;
    renderTree();
  } else if (result.type === 'window') {
    result.node.tabs.forEach(t => { t.zoom = 100; });
    renderTree();
  }
}

function toggleException() {
  const result = findNode(state.selectedId);
  if (!result || result.type !== 'tab') return;
  result.node.isException = !result.node.isException;
  if (result.node.isException) {
    result.node.zoom = 100;
  }
  renderTree();
}

// --- Rename Window Action ---
function promptRenameWindow() {
  const result = findNode(state.selectedId);
  let winNode = null;

  if (result.type === 'window') {
    winNode = result.node;
  } else if (result.type === 'tab') {
    winNode = result.parent;
  }

  if (winNode) {
    const newName = prompt(`Enter custom name for window (${winNode.display}):`, winNode.name);
    if (newName && newName.trim() !== '') {
      winNode.name = newName.trim();
      renderTree();
      showStatusMessage(`Window renamed to: "${winNode.name}" (Persisted locally)`);
    }
  } else {
    alert('Please select a window or tab to rename its window.');
  }
}

// --- Focus Action Simulation ---
function triggerFocus() {
  const result = findNode(state.selectedId);
  if (!result) return;

  const { node, type, parent } = result;
  let tabName = type === 'tab' ? node.title : (node.name || 'Selected Window');

  // Flash UI element
  const preview = document.querySelector('.mock-viewport-container');
  preview.style.boxShadow = '0 0 30px rgba(48, 209, 88, 0.8)';
  preview.style.borderColor = 'var(--accent-green)';

  setTimeout(() => {
    preview.style.boxShadow = 'none';
    preview.style.borderColor = 'var(--bg-glass-border)';
  }, 600);

  showStatusMessage(`⚡ Focus dispatched! Raised window and activated "${tabName}"`);
}

function showStatusMessage(msg) {
  dom.statusBarMsg.textContent = msg;
  dom.statusBarMsg.style.color = 'var(--accent-green)';
  setTimeout(() => {
    dom.statusBarMsg.textContent = 'Connected: Chrome (5 tabs), Safari (4 tabs), Firefox (0 tabs)';
    dom.statusBarMsg.style.color = 'var(--text-muted)';
  }, 3500);
}

// --- Display Profile Change ---
function handleDisplayChange(displayKey) {
  state.currentDisplayProfile = displayKey;
  const config = state.displayScales[displayKey];
  if (!config) return;

  // Update primary windows matching display
  state.tree.forEach(browser => {
    browser.windows.forEach(win => {
      if (win.id === 'chrome-w1' || win.id === 'safari-w1') {
        win.display = config.name;
        win.displayId = displayKey;
        win.tabs.forEach(tab => {
          if (!tab.isException) {
            tab.zoom = config.defaultZoom;
          }
        });
      }
    });
  });

  renderTree();
  showStatusMessage(`🖥️ Display switched to ${config.name} — auto-scaled tabs to ${config.defaultZoom}%`);
}

// --- Vi Keyboard Navigation ---
function setupKeyboardRouter() {
  window.addEventListener('keydown', (e) => {
    // If typing in an input field, do not capture Vi keys
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
      return;
    }

    const rows = getVisibleRows();
    const currentIndex = rows.findIndex(r => r.id === state.selectedId);

    if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentIndex < rows.length - 1) {
        selectNode(rows[currentIndex + 1].id);
      }
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentIndex > 0) {
        selectNode(rows[currentIndex - 1].id);
      }
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      adjustZoom(5);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      adjustZoom(-5);
    } else if (e.key === '0') {
      e.preventDefault();
      resetZoom();
    } else if (e.key === 'f') {
      e.preventDefault();
      triggerFocus();
    } else if (e.key === 'r') {
      e.preventDefault();
      promptRenameWindow();
    } else if (e.key === '/') {
      e.preventDefault();
      dom.simSearchInput.focus();
    }
  });
}

// --- Pricing Switcher Logic ---
function setupPricingSwitcher() {
  const btnMonthly = document.getElementById('btnPricingMonthly');
  const btnAnnual = document.getElementById('btnPricingAnnual');
  const btnLifetime = document.getElementById('btnPricingLifetime');

  const cardMonthly = document.getElementById('cardMonthly');
  const cardAnnual = document.getElementById('cardAnnual');
  const cardLifetime = document.getElementById('cardLifetime');

  function setPricingMode(mode) {
    [btnMonthly, btnAnnual, btnLifetime].forEach(b => b.classList.remove('active'));
    [cardMonthly, cardAnnual, cardLifetime].forEach(c => c.classList.remove('featured'));

    if (mode === 'monthly') {
      btnMonthly.classList.add('active');
      cardMonthly.classList.add('featured');
    } else if (mode === 'annual') {
      btnAnnual.classList.add('active');
      cardAnnual.classList.add('featured');
    } else if (mode === 'lifetime') {
      btnLifetime.classList.add('active');
      cardLifetime.classList.add('featured');
    }
  }

  btnMonthly.addEventListener('click', () => setPricingMode('monthly'));
  btnAnnual.addEventListener('click', () => setPricingMode('annual'));
  btnLifetime.addEventListener('click', () => setPricingMode('lifetime'));
}

// --- FAQ Accordion Logic ---
function setupFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.parentElement;
      const isOpen = item.classList.contains('open');

      // Close other accordion items
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const ans = i.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// --- Terminal Snippet Copy Logic ---
function setupSnippetCopy() {
  dom.btnCopyInstall.addEventListener('click', () => {
    const code = 'curl -fsSL https://browsernexus.com/install.sh | bash';
    navigator.clipboard.writeText(code).then(() => {
      dom.btnCopyInstall.textContent = 'Copied!';
      dom.btnCopyInstall.style.color = 'var(--accent-green)';
      setTimeout(() => {
        dom.btnCopyInstall.textContent = 'Copy';
        dom.btnCopyInstall.style.color = 'var(--accent-cyan)';
      }, 2000);
    });
  });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  dom.btnZoomPlus.addEventListener('click', () => adjustZoom(5));
  dom.btnZoomMinus.addEventListener('click', () => adjustZoom(-5));
  dom.btnZoomReset.addEventListener('click', resetZoom);
  dom.btnTriggerLock.addEventListener('click', toggleException);
  dom.btnTriggerRename.addEventListener('click', promptRenameWindow);
  dom.btnTriggerFocus.addEventListener('click', triggerFocus);

  dom.displaySelector.addEventListener('change', (e) => {
    handleDisplayChange(e.target.value);
  });

  dom.simSearchInput.addEventListener('input', (e) => {
    state.filterText = e.target.value;
    renderTree();
  });

  dom.btnToggleAll.addEventListener('click', () => {
    dom.btnToggleAll.classList.add('active');
    dom.btnToggleOverridden.classList.remove('active');
    state.filterOverriddenOnly = false;
    renderTree();
  });

  dom.btnToggleOverridden.addEventListener('click', () => {
    dom.btnToggleOverridden.classList.add('active');
    dom.btnToggleAll.classList.remove('active');
    state.filterOverriddenOnly = true;
    renderTree();
  });

  document.getElementById('btnOpenSessions').addEventListener('click', () => {
    alert('📋 Session Snapshots viewer simulated: captures window UUIDs, tab sets, zoom policies, and display layouts.');
  });

  document.getElementById('btnOpenSettings').addEventListener('click', () => {
    alert('⚙️ Settings & Diagnostics: Protected by Touch ID / Password authentication (LAPolicy.deviceOwnerAuthentication).');
  });
}

// --- Expose for browser debugging & testing ---
window.macZoomConductor = {
  state,
  findNode,
  adjustZoom,
  resetZoom,
  toggleException,
  handleDisplayChange,
  selectNode,
  renderTree
};

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  renderTree();
  setupEventListeners();
  setupKeyboardRouter();
  setupPricingSwitcher();
  setupFaqAccordion();
  setupSnippetCopy();
});
