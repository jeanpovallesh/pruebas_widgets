(function () {
  'use strict';

  // ---------------------------------------------------------------- estructura del modelo SOLLA_PGP_IND
  const COLS = ['Version', 'TIEMPO', 'CECO_PGP', 'AUDITORIA_PGP', 'EMPLEADOS_PGP_IND', 'CUENTA_PGP_IND', 'ENTIDAD_PGP', 'MONTO'];
  const KEYS = COLS.slice(0, 7);
  const MAX_LEN = { Version: 300, CECO_PGP: 256, AUDITORIA_PGP: 256, EMPLEADOS_PGP_IND: 256, CUENTA_PGP_IND: 256, ENTIDAD_PGP: 256 };
  const MAX_ERRORS = 500;
  const MAX_DECIMALS = 7;
  const PERIOD_RE = /^(\d{4})(0[1-9]|1[0-2])$/;

  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host { display: block; font-family: "72", "Segoe UI", Arial, sans-serif; color: #1d2d3e; }
      * { box-sizing: border-box; }
      .wrap { padding: 12px; background: #ffffff; border: 1px solid #d9d9d9; border-radius: 8px; min-height: 100%; }
      h2 { margin: 0 0 10px; font-size: 16px; font-weight: 600; }
      .visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); border: 0; }
      .drop { border: 2px dashed #8396a8; border-radius: 8px; background: #f5f6f7; }
      .drop.over { border-color: #0a6ed1; background: #eaf3fc; }
      .drop-label { display: block; padding: 18px 12px; text-align: center; cursor: pointer; font-size: 14px; }
      .drop-label strong { color: #0a5bb0; }
      .hint { display: block; margin-top: 6px; font-size: 12px; color: #4a5a6a; }
      input:focus-visible + .drop-label { outline: 3px solid #0a6ed1; outline-offset: -3px; border-radius: 6px; }
      .banner { margin: 12px 0; padding: 10px 12px; border-radius: 6px; font-size: 13px; border: 1px solid; }
      .banner.ok { background: #f1f9ec; border-color: #5a8f2e; color: #234a0d; }
      .banner.bad { background: #fdeeee; border-color: #bb0000; color: #7a0000; }
      .banner.warn { background: #fff8e1; border-color: #a86500; color: #5c3600; }
      .banner b { font-weight: 600; }
      .cards { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
      .card { flex: 1 1 120px; padding: 8px 10px; border: 1px solid #d9d9d9; border-radius: 6px; background: #ffffff; }
      .card .k { font-size: 11px; color: #4a5a6a; text-transform: uppercase; letter-spacing: 0.03em; }
      .card .v { font-size: 18px; font-weight: 600; margin-top: 2px; word-break: break-word; }
      h3 { margin: 14px 0 6px; font-size: 13px; font-weight: 600; }
      .scroll { overflow: auto; max-width: 100%; border: 1px solid #d9d9d9; border-radius: 6px; }
      table { border-collapse: collapse; width: 100%; font-size: 12px; }
      th, td { padding: 5px 8px; border-bottom: 1px solid #e5e5e5; text-align: left; white-space: nowrap; }
      th { background: #f5f6f7; font-weight: 600; position: sticky; top: 0; }
      td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      button { font: inherit; font-size: 13px; padding: 7px 14px; border-radius: 6px; border: 1px solid #0a6ed1; background: #ffffff; color: #0a5bb0; cursor: pointer; }
      button.primary { background: #0a5bb0; color: #ffffff; }
      button:disabled { opacity: 0.5; cursor: not-allowed; }
      button:focus-visible { outline: 3px solid #0a6ed1; outline-offset: 2px; }
      .scope { font-size: 12px; color: #3a4a5a; margin: 6px 0 0; }
      .muted { color: #4a5a6a; font-size: 12px; }
      @media (prefers-reduced-motion: no-preference) { .drop { transition: border-color 0.15s, background-color 0.15s; } }
    </style>
    <section class="wrap" aria-label="Carga de archivo plano">
      <h2 id="ttl"></h2>
      <div class="drop" id="drop">
        <input class="visually-hidden" type="file" id="file" accept=".csv,.txt,.tsv,text/csv,text/plain" />
        <label class="drop-label" for="file">
          <strong>Selecciona un archivo plano</strong> o arrástralo aquí
          <span class="hint">CSV o TXT con encabezado: Version, TIEMPO (AAAAMM), CECO_PGP, AUDITORIA_PGP, EMPLEADOS_PGP_IND, CUENTA_PGP_IND, ENTIDAD_PGP, MONTO</span>
        </label>
      </div>
      <div id="out" aria-live="polite"></div>
    </section>`;

  // ---------------------------------------------------------------- utilidades
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^﻿/, '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  }
  const NORM_COLS = COLS.map(norm);
  function fmtInt(n) { return new Intl.NumberFormat('es', { useGrouping: 'always' }).format(n); }
  function fmtAmt(n) { return new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }).format(n); }
  function plainDecimal(n) {
    const s = n.toFixed(MAX_DECIMALS).replace(/\.?0+$/, '');
    return s === '-0' || s === '' ? '0' : s;
  }
  function csvCell(v) {
    const s = String(v);
    return /[",\n\r;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function detectDelimiter(text) {
    const first = text.split(/\r?\n/).find(function (l) { return l.trim() !== ''; }) || '';
    let best = ',';
    let bestCount = -1;
    [',', ';', '\t', '|'].forEach(function (d) {
      let count = 0;
      let inQ = false;
      for (let i = 0; i < first.length; i++) {
        const c = first[i];
        if (c === '"') inQ = !inQ;
        else if (c === d && !inQ) count++;
      }
      if (count > bestCount) { best = d; bestCount = count; }
    });
    return best;
  }

  // Parser CSV que respeta comillas, separadores dentro de comillas y saltos de línea de Windows
  function parseCSV(text, delim) {
    const rows = [];
    let row = [];
    let field = '';
    let inQ = false;
    let line = 1;
    let rowLine = 1;
    let i = 0;
    const n = text.length;
    while (i < n) {
      const c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        if (c === '\n') line++;
        field += c; i++; continue;
      }
      if (c === '"' && field === '') { inQ = true; i++; continue; }
      if (c === delim) { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') {
        row.push(field);
        rows.push({ line: rowLine, cells: row });
        row = []; field = ''; line++; rowLine = line; i++; continue;
      }
      field += c; i++;
    }
    if (field !== '' || row.length) { row.push(field); rows.push({ line: rowLine, cells: row }); }
    return rows;
  }

  // Convierte texto a número. decPref es el separador decimal configurado ('.' o ',').
  function parseAmount(raw, decPref) {
    let s = String(raw).trim();
    if (s === '') return { err: 'MONTO vacío' };
    let neg = false;
    if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    s = s.replace(/[\s $€]/g, '').replace(/USD|COP|VES|EUR/gi, '');
    if (s.charAt(0) === '-') { neg = !neg; s = s.slice(1); }
    else if (s.charAt(0) === '+') { s = s.slice(1); }
    if (s.slice(-1) === '-') { neg = !neg; s = s.slice(0, -1); }
    if (!/^[0-9.,]+$/.test(s) || !/[0-9]/.test(s)) return { err: 'MONTO no es un número ("' + String(raw).trim() + '")' };

    const hasDot = s.indexOf('.') >= 0;
    const hasCom = s.indexOf(',') >= 0;
    let dec = null;
    if (hasDot && hasCom) {
      dec = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
    } else if (hasDot || hasCom) {
      const sep = hasDot ? '.' : ',';
      const count = s.split(sep).length - 1;
      if (count === 1) {
        const after = s.length - s.indexOf(sep) - 1;
        if (sep === decPref) dec = sep;
        else if (after === 3) dec = null;
        else return { err: 'MONTO con formato ambiguo ("' + String(raw).trim() + '"): revisa el separador decimal configurado' };
      }
    }
    let intRaw;
    let frac = '';
    if (dec) {
      const idx = s.lastIndexOf(dec);
      intRaw = s.slice(0, idx);
      frac = s.slice(idx + 1);
      if (!/^[0-9]*$/.test(frac)) return { err: 'MONTO con formato inválido ("' + String(raw).trim() + '")' };
    } else {
      intRaw = s;
    }
    // la parte entera solo puede tener separadores de miles en grupos de tres (1.234.567)
    if (!/^[0-9]*$/.test(intRaw) && !/^[0-9]{1,3}([.,][0-9]{3})+$/.test(intRaw)) {
      return { err: 'MONTO con separadores de miles inválidos ("' + String(raw).trim() + '")' };
    }
    let intPart = intRaw.replace(/[.,]/g, '');
    if (intPart === '') intPart = '0';
    const value = Number(intPart + (frac ? '.' + frac : ''));
    if (!isFinite(value)) return { err: 'MONTO fuera de rango ("' + String(raw).trim() + '")' };
    return { value: neg ? -value : value, rounded: frac.length > MAX_DECIMALS };
  }

  function decodeBuffer(buf) {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch (e) {
      return new TextDecoder('windows-1252').decode(buf);
    }
  }

  // ---------------------------------------------------------------- validación del archivo
  function validateText(text, decPref) {
    const res = {
      fatal: [], rows: [], errors: [], errorTotal: 0, warnings: [], groups: [],
      total: 0, lineCount: 0, delimiter: ',', duplicates: 0, roundedCount: 0
    };
    const clean = text.replace(/^﻿/, '');
    if (clean.trim() === '') { res.fatal.push('El archivo está vacío.'); return res; }

    res.delimiter = detectDelimiter(clean);
    const parsed = parseCSV(clean, res.delimiter).filter(function (r) {
      return r.cells.some(function (c) { return String(c).trim() !== ''; });
    });
    if (parsed.length < 2) { res.fatal.push('El archivo debe tener un encabezado y al menos una fila de datos.'); return res; }

    const header = parsed[0].cells.map(norm);
    const idx = {};
    const missing = [];
    COLS.forEach(function (col, k) {
      const pos = header.indexOf(NORM_COLS[k]);
      if (pos < 0) missing.push(col); else idx[col] = pos;
    });
    if (missing.length) {
      res.fatal.push('Faltan columnas en el encabezado: ' + missing.join(', ') + '.');
      return res;
    }
    const extra = parsed[0].cells.filter(function (h, p) {
      return Object.keys(idx).every(function (c) { return idx[c] !== p; }) && String(h).trim() !== '';
    });
    if (extra.length) res.warnings.push('Se ignoran columnas que no son del modelo: ' + extra.map(function (h) { return String(h).trim(); }).join(', ') + '.');

    function addError(line, col, msg) {
      res.errorTotal++;
      if (res.errors.length < MAX_ERRORS) res.errors.push({ line: line, col: col, msg: msg });
    }

    const seen = Object.create(null);
    const groups = Object.create(null);
    res.lineCount = parsed.length - 1;

    for (let r = 1; r < parsed.length; r++) {
      const src = parsed[r];
      const cells = src.cells;
      const row = {};
      let ok = true;

      KEYS.forEach(function (col) {
        const v = String(cells[idx[col]] == null ? '' : cells[idx[col]]).trim();
        row[col] = v;
        if (v === '') { addError(src.line, col, 'Valor vacío'); ok = false; return; }
        if (col === 'TIEMPO') {
          if (!PERIOD_RE.test(v)) { addError(src.line, col, 'Formato inválido ("' + v + '"): se espera AAAAMM, por ejemplo 202601'); ok = false; }
        } else if (v.length > MAX_LEN[col]) {
          addError(src.line, col, 'Supera el largo máximo de ' + MAX_LEN[col] + ' caracteres'); ok = false;
        }
      });

      const amt = parseAmount(cells[idx.MONTO] == null ? '' : cells[idx.MONTO], decPref);
      if (amt.err) { addError(src.line, 'MONTO', amt.err); ok = false; }
      else {
        row.MONTO = amt.value;
        if (amt.rounded) res.roundedCount++;
      }

      if (!ok) continue;

      const key = KEYS.map(function (k) { return row[k]; }).join('\u0001');
      if (seen[key]) res.duplicates++; else seen[key] = true;

      const gk = row.Version + '\u0001' + row.TIEMPO;
      if (!groups[gk]) groups[gk] = { Version: row.Version, TIEMPO: row.TIEMPO, rows: 0, total: 0 };
      groups[gk].rows++;
      groups[gk].total += row.MONTO;
      res.total += row.MONTO;
      res.rows.push(row);
    }

    res.groups = Object.keys(groups).map(function (k) { return groups[k]; }).sort(function (a, b) {
      return a.Version === b.Version ? (a.TIEMPO < b.TIEMPO ? -1 : 1) : (a.Version < b.Version ? -1 : 1);
    });
    if (res.duplicates > 0) res.warnings.push(res.duplicates + ' fila(s) repiten la misma combinación de llaves; al importar, SAC las suma.');
    if (res.roundedCount > 0) res.warnings.push(res.roundedCount + ' monto(s) tienen más de ' + MAX_DECIMALS + ' decimales y se redondean.');
    return res;
  }

  // ---------------------------------------------------------------- Web Component
  class CargaPgpInd extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {};
      this._state = null;
      this._rawText = '';
      this._fileName = '';

      const input = this._shadowRoot.getElementById('file');
      const drop = this._shadowRoot.getElementById('drop');
      input.addEventListener('change', () => {
        if (input.files && input.files[0]) this._loadFile(input.files[0]);
        input.value = '';
      });
      ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', (e) => {
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._loadFile(f);
      });
      this._shadowRoot.getElementById('out').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const act = btn.getAttribute('data-act');
        if (act === 'download') this._download();
        else if (act === 'copy') this._copy();
        else if (act === 'clear') this.clearData();
      });
    }

    onCustomWidgetBeforeUpdate(changed) {
      this._props = Object.assign({}, this._props, changed);
    }

    onCustomWidgetAfterUpdate() {
      this.render();
      // si cambió el separador decimal con un archivo ya cargado, se revalida con el nuevo valor
      if (this._rawText && this._lastDec !== undefined && this._lastDec !== this._decPref) {
        this._process(this._rawText, this._fileName);
      }
    }

    get _decPref() {
      return this._props.decimalSeparator === ',' ? ',' : '.';
    }

    render() {
      const t = this._shadowRoot.getElementById('ttl');
      t.textContent = this._props.title || 'Carga de datos PGP IND';
      this._paint();
    }

    _loadFile(file) {
      const reader = new FileReader();
      reader.onload = () => {
        this._rawText = decodeBuffer(reader.result);
        this._fileName = file.name;
        this._process(this._rawText, file.name);
      };
      reader.onerror = () => {
        this._state = { fatal: ['No se pudo leer el archivo.'], rows: [], errors: [], errorTotal: 0, warnings: [], groups: [], total: 0, lineCount: 0 };
        this._fileName = file.name;
        this._paint();
      };
      reader.readAsArrayBuffer(file);
    }

    _process(text, fileName) {
      this._lastDec = this._decPref;
      this._state = validateText(text, this._decPref);
      this._fileName = fileName;
      this._paint();
      this.dispatchEvent(new Event('onFileValidated'));
    }

    _isValid() {
      const s = this._state;
      return !!(s && s.fatal.length === 0 && s.errorTotal === 0 && s.rows.length > 0);
    }

    _csvText() {
      const lines = [COLS.join(',')];
      this._state.rows.forEach(function (r) {
        lines.push(COLS.map(function (c) { return c === 'MONTO' ? plainDecimal(r.MONTO) : csvCell(r[c]); }).join(','));
      });
      return lines.join('\r\n') + '\r\n';
    }

    _download() {
      if (!this._isValid()) return;
      const base = (this._fileName || 'carga').replace(/\.[^.]+$/, '');
      const fileName = base + '_normalizado.csv';
      const content = '\uFEFF' + this._csvText();
      const fallback = () => {
        // SAC ejecuta el widget en un iframe que ignora el nombre del blob: se guarda con GUID y sin extension.
        // Por eso se muestra tambien el texto para copiarlo y se indica el nombre correcto.
        this._download_anchor(content, fileName);
        this._showText();
        this._notice('Si el navegador guardó el archivo sin extensión, renómbralo a "' + fileName + '". También puedes copiar el texto de abajo y pegarlo en un archivo .csv.');
      };
      if (typeof window.showSaveFilePicker === 'function') {
        window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'CSV', accept: { 'text/csv': ['.csv'] } }]
        }).then(function (h) { return h.createWritable(); })
          .then((w) => w.write(content).then(function () { return w.close(); }))
          .then(() => this._notice('Archivo guardado como ' + fileName + '.'))
          .catch((err) => { if (err && err.name === 'AbortError') return; fallback(); });
      } else {
        fallback();
      }
    }

    _download_anchor(content, fileName) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      this._shadowRoot.appendChild(a);
      a.click();
      this._shadowRoot.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    _showText() {
      const box = this._shadowRoot.getElementById('csvbox');
      if (!box || !this._isValid()) return null;
      box.hidden = false;
      const ta = this._shadowRoot.getElementById('csvtext');
      ta.value = this._csvText();
      return ta;
    }

    _copy() {
      if (!this._isValid()) return;
      const text = this._csvText();
      const fail = () => {
        const ta = this._showText();
        if (ta) { ta.focus(); ta.select(); }
        this._notice('Selecciona el texto de abajo y cópialo (Ctrl+C) para pegarlo en un archivo .csv.');
      };
      const viaSelection = () => {
        const ta = this._showText();
        if (!ta) return fail();
        ta.focus(); ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        if (ok) this._notice('CSV normalizado copiado al portapapeles.'); else fail();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => this._notice('CSV normalizado copiado al portapapeles.'), viaSelection);
      } else {
        viaSelection();
      }
    }

    _notice(msg) {
      const n = this._shadowRoot.getElementById('notice');
      if (n) n.textContent = msg;
    }

    _paint() {
      const out = this._shadowRoot.getElementById('out');
      const s = this._state;
      if (!s) { out.innerHTML = ''; return; }

      if (s.fatal.length) {
        out.innerHTML = `<div class="banner bad" role="alert"><b>✕ No se pudo validar "${esc(this._fileName)}".</b><br>${s.fatal.map(esc).join('<br>')}</div>
          <div class="actions"><button type="button" data-act="clear">Limpiar</button></div>`;
        return;
      }

      const valid = this._isValid();
      const versions = Array.from(new Set(s.groups.map(function (g) { return g.Version; })));
      const periods = Array.from(new Set(s.groups.map(function (g) { return g.TIEMPO; }))).sort();
      const prev = Math.max(1, parseInt(this._props.previewRows, 10) || 10);

      let html = '';
      if (valid) {
        html += `<div class="banner ok" role="status"><b>✓ Archivo válido.</b> ${fmtInt(s.rows.length)} fila(s) listas para importar desde "${esc(this._fileName)}".</div>`;
      } else {
        html += `<div class="banner bad" role="alert"><b>✕ Se encontraron ${fmtInt(s.errorTotal)} error(es) en "${esc(this._fileName)}".</b> Corrige el archivo y vuelve a cargarlo; no se importará nada hasta que esté limpio.</div>`;
      }
      s.warnings.forEach(function (w) { html += `<div class="banner warn" role="status">⚠ ${esc(w)}</div>`; });

      if (s.errors.length) {
        html += `<h3>Errores${s.errorTotal > s.errors.length ? ' (primeros ' + s.errors.length + ' de ' + fmtInt(s.errorTotal) + ')' : ''}</h3><div class="scroll" style="max-height:220px"><table><thead><tr><th class="num">Línea</th><th>Columna</th><th>Detalle</th></tr></thead><tbody>`;
        s.errors.forEach(function (e) {
          html += `<tr><td class="num">${fmtInt(e.line)}</td><td>${esc(e.col)}</td><td style="white-space:normal">${esc(e.msg)}</td></tr>`;
        });
        html += `</tbody></table></div>`;
      }

      html += `<div class="cards">
        <div class="card"><div class="k">Filas leídas</div><div class="v">${fmtInt(s.lineCount)}</div></div>
        <div class="card"><div class="k">Filas válidas</div><div class="v">${fmtInt(s.rows.length)}</div></div>
        ${valid ? `<div class="card"><div class="k">Total MONTO</div><div class="v">${fmtAmt(s.total)}</div></div>
        <div class="card"><div class="k">Versiones</div><div class="v">${fmtInt(versions.length)}</div></div>
        <div class="card"><div class="k">Periodos</div><div class="v">${fmtInt(periods.length)}</div></div>` : ''}
      </div>`;

      // alcance, totales y vista previa solo con archivo válido: si hay errores no se importa nada
      if (valid) {
        html += `<p class="scope">Al importar con reemplazo se sustituirán los datos de: <b>${esc(versions.join(', '))}</b> · periodos <b>${esc(periods[0])}${periods.length > 1 ? ' a ' + esc(periods[periods.length - 1]) : ''}</b>.</p>`;
        html += `<h3>Totales por versión y periodo</h3><div class="scroll"><table><thead><tr><th>Version</th><th>TIEMPO</th><th class="num">Filas</th><th class="num">MONTO</th></tr></thead><tbody>`;
        s.groups.slice(0, 200).forEach(function (g) {
          html += `<tr><td>${esc(g.Version)}</td><td>${esc(g.TIEMPO)}</td><td class="num">${fmtInt(g.rows)}</td><td class="num">${fmtAmt(g.total)}</td></tr>`;
        });
        html += `</tbody></table></div>`;
        if (s.groups.length > 200) html += `<p class="muted">Se muestran 200 de ${fmtInt(s.groups.length)} combinaciones.</p>`;

        html += `<h3>Vista previa (${Math.min(prev, s.rows.length)} de ${fmtInt(s.rows.length)})</h3><div class="scroll"><table><thead><tr>${COLS.map(function (c) { return '<th' + (c === 'MONTO' ? ' class="num"' : '') + '>' + esc(c) + '</th>'; }).join('')}</tr></thead><tbody>`;
        s.rows.slice(0, prev).forEach(function (r) {
          html += '<tr>' + COLS.map(function (c) {
            return c === 'MONTO' ? '<td class="num">' + fmtAmt(r.MONTO) + '</td>' : '<td>' + esc(r[c]) + '</td>';
          }).join('') + '</tr>';
        });
        html += `</tbody></table></div>`;
      }

      html += `<div class="actions">
        <button type="button" class="primary" data-act="download" ${valid ? '' : 'disabled'}>Descargar CSV normalizado</button>
        <button type="button" data-act="copy" ${valid ? '' : 'disabled'}>Copiar CSV</button>
        <button type="button" data-act="clear">Limpiar</button>
      </div><p class="muted" id="notice" role="status"></p>
      <div id="csvbox" hidden><label for="csvtext" class="muted">CSV normalizado (seleccionar todo y copiar)</label>
      <textarea id="csvtext" readonly rows="8" style="width:100%;box-sizing:border-box;font:12px monospace"></textarea></div>`;

      out.innerHTML = html;
    }

    // ---------------------------------------------------------------- métodos expuestos a SAC Script
    getRowsJson() {
      return JSON.stringify(this._isValid() ? this._state.rows : []);
    }

    getSummaryJson() {
      const s = this._state;
      const summary = {
        archivo: this._fileName || '',
        valido: this._isValid(),
        filasLeidas: s ? s.lineCount : 0,
        filasValidas: s ? s.rows.length : 0,
        totalMonto: s ? s.total : 0,
        errores: s ? s.errorTotal : 0,
        advertencias: s ? s.warnings : [],
        totalesPorVersionPeriodo: s ? s.groups : []
      };
      return JSON.stringify(summary);
    }

    // ---- API para la carga directa desde la historia (opción B) ----
    // Cantidad de lotes de `size` filas (por defecto 500)
    getChunkCount(size) {
      const n = Math.max(1, parseInt(size, 10) || 500);
      return this._isValid() ? Math.ceil(this._state.rows.length / n) : 0;
    }

    // Lote `index` (base 0) como JSON de arreglos: [Version,TIEMPO,CECO_PGP,AUDITORIA_PGP,EMPLEADOS_PGP_IND,CUENTA_PGP_IND,ENTIDAD_PGP,MONTO]
    getChunkJson(index, size) {
      if (!this._isValid()) return '[]';
      const n = Math.max(1, parseInt(size, 10) || 500);
      const i = Math.max(0, parseInt(index, 10) || 0);
      return JSON.stringify(this._state.rows.slice(i * n, (i + 1) * n).map(function (r) {
        return COLS.map(function (c) { return c === 'MONTO' ? Number(r.MONTO) : String(r[c]); });
      }));
    }

    // Alcance del archivo: versiones y periodos distintos (para limpiar antes de escribir)
    getScopeJson() {
      if (!this._isValid()) return '{"versions":[],"periods":[]}';
      const v = {}, t = {};
      this._state.rows.forEach(function (r) { v[r.Version] = 1; t[r.TIEMPO] = 1; });
      return JSON.stringify({ versions: Object.keys(v).sort(), periods: Object.keys(t).sort() });
    }

    getRowCount() {
      return this._state ? this._state.rows.length : 0;
    }

    getErrorCount() {
      return this._state ? this._state.errorTotal : 0;
    }

    isValid() {
      return this._isValid();
    }

    getFileName() {
      return this._fileName || '';
    }

    clearData() {
      this._state = null;
      this._rawText = '';
      this._fileName = '';
      this._paint();
    }
  }

  if (!customElements.get('com-isitec-cargapgpind')) {
    customElements.define('com-isitec-cargapgpind', CargaPgpInd);
  }
})();
