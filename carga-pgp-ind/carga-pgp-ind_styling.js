(function () {
  'use strict';

  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host { display: block; font-family: "72", "Segoe UI", Arial, sans-serif; font-size: 13px; color: #1d2d3e; }
      fieldset { border: 1px solid #d9d9d9; border-radius: 6px; padding: 10px 12px; }
      legend { font-weight: 600; padding: 0 6px; }
      label { display: block; margin: 10px 0 4px; }
      input, select { width: 100%; padding: 6px 8px; font: inherit; border: 1px solid #8396a8; border-radius: 4px; }
      input:focus-visible, select:focus-visible, button:focus-visible { outline: 3px solid #0a6ed1; outline-offset: 1px; }
      button { margin-top: 12px; padding: 7px 14px; font: inherit; border: 1px solid #0a5bb0; border-radius: 6px; background: #0a5bb0; color: #ffffff; cursor: pointer; }
      .help { margin: 4px 0 0; font-size: 12px; color: #4a5a6a; }
    </style>
    <form id="form">
      <fieldset>
        <legend>Configuración del widget</legend>
        <label for="title">Título</label>
        <input id="title" type="text" />
        <label for="decimalSeparator">Separador decimal de MONTO</label>
        <select id="decimalSeparator">
          <option value=".">Punto (1234.56)</option>
          <option value=",">Coma (1234,56)</option>
        </select>
        <p class="help">Define cómo se interpretan montos como 1,5 o 1.5. Si cambia con un archivo cargado, se revalida solo.</p>
        <label for="previewRows">Filas de vista previa</label>
        <input id="previewRows" type="number" min="1" max="200" step="1" />
        <button type="submit">Aplicar</button>
      </fieldset>
    </form>`;

  class CargaPgpIndStyling extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this._shadowRoot.getElementById('form').addEventListener('submit', this._submit.bind(this));
    }

    _submit(e) {
      e.preventDefault();
      const titleValue = this._shadowRoot.getElementById('title').value;
      const decimalValue = this._shadowRoot.getElementById('decimalSeparator').value;
      const rowsValue = parseInt(this._shadowRoot.getElementById('previewRows').value, 10) || 10;
      this.dispatchEvent(new CustomEvent('propertiesChanged', {
        detail: {
          properties: {
            title: titleValue,
            decimalSeparator: decimalValue,
            previewRows: rowsValue
          }
        }
      }));
    }

    set title(value) {
      this._shadowRoot.getElementById('title').value = value == null ? '' : value;
    }

    set decimalSeparator(value) {
      this._shadowRoot.getElementById('decimalSeparator').value = value === ',' ? ',' : '.';
    }

    set previewRows(value) {
      this._shadowRoot.getElementById('previewRows').value = value == null ? 10 : value;
    }
  }

  if (!customElements.get('com-isitec-cargapgpind-styling')) {
    customElements.define('com-isitec-cargapgpind-styling', CargaPgpIndStyling);
  }
})();
