(function () {
  'use strict';
  var TAG = "com-isitec-controlproduccion-styling";
  var tpl = document.createElement('template');
  tpl.innerHTML = "<style>:host{display:block;font:12px Arial,sans-serif;padding:8px}fieldset{border:1px solid #c6c6cd;border-radius:6px;margin:0 0 8px;padding:6px 8px}legend{font-weight:600}label{display:block;margin:6px 0 2px}input[type=text],input[type=number]{width:100%;box-sizing:border-box;padding:4px}</style><fieldset><legend>Widget</legend><label for=\"title\">Título</label><input id=\"title\" type=\"text\"></fieldset><fieldset><legend>Componente kpiTotal</legend><label for=\"titulo_kpiTotal\">Título: Valor total</label><input id=\"titulo_kpiTotal\" type=\"text\"></fieldset><fieldset><legend>Componente kpiEstado</legend><label for=\"titulo_kpiEstado\">Título: Valor por estado de la orden</label><input id=\"titulo_kpiEstado\" type=\"text\"></fieldset><fieldset><legend>Componente donaAreas</legend><label for=\"titulo_donaAreas\">Título: Reparto por área</label><input id=\"titulo_donaAreas\" type=\"text\"></fieldset><fieldset><legend>Componente barrasAreaEstado</legend><label for=\"titulo_barrasAreaEstado\">Título: Valor por área y estado</label><input id=\"titulo_barrasAreaEstado\" type=\"text\"></fieldset><fieldset><legend>Componente barrasOrdenes</legend><label for=\"titulo_barrasOrdenes\">Título: Órdenes con mayor valor</label><input id=\"titulo_barrasOrdenes\" type=\"text\"></fieldset><fieldset><legend>Componente matrizAreaMes</legend><label for=\"titulo_matrizAreaMes\">Título: Área × mes</label><input id=\"titulo_matrizAreaMes\" type=\"text\"></fieldset><fieldset><legend>Componente pivotControl</legend><label for=\"titulo_pivotControl\">Título: Control por orden, área y mes</label><input id=\"titulo_pivotControl\" type=\"text\"></fieldset><fieldset><legend>Filtros</legend><label for=\"etiqueta_fMes\">Etiqueta del filtro Mes</label><input id=\"etiqueta_fMes\" type=\"text\"><label for=\"etiqueta_fArea\">Etiqueta del filtro Área</label><input id=\"etiqueta_fArea\" type=\"text\"><label for=\"etiqueta_fVersion\">Etiqueta del filtro Versión</label><input id=\"etiqueta_fVersion\" type=\"text\"><label for=\"etiqueta_fEstado\">Etiqueta del filtro Estado de la orden</label><input id=\"etiqueta_fEstado\" type=\"text\"><label for=\"etiqueta_fCliente\">Etiqueta del filtro Cliente</label><input id=\"etiqueta_fCliente\" type=\"text\"></fieldset><fieldset><legend>Diagnóstico</legend><label for=\"diagnostico\">Mostrar diagnóstico de datos</label><input id=\"diagnostico\" type=\"checkbox\"></fieldset>";

  class ControlProduccionStyling extends HTMLElement {
    constructor() {
      super();
      this._root = this.attachShadow({ mode: 'open' });
      this._root.appendChild(tpl.content.cloneNode(true));
      var self = this;
      this._el_title = this._root.getElementById('title');
      this._el_title.addEventListener('change', function () { self._fire({ title: self._el_title.value }); });
      this._el_titulo_kpiTotal = this._root.getElementById('titulo_kpiTotal');
      this._el_titulo_kpiTotal.addEventListener('change', function () { self._fire({ titulo_kpiTotal: self._el_titulo_kpiTotal.value }); });
      this._el_titulo_kpiEstado = this._root.getElementById('titulo_kpiEstado');
      this._el_titulo_kpiEstado.addEventListener('change', function () { self._fire({ titulo_kpiEstado: self._el_titulo_kpiEstado.value }); });
      this._el_titulo_donaAreas = this._root.getElementById('titulo_donaAreas');
      this._el_titulo_donaAreas.addEventListener('change', function () { self._fire({ titulo_donaAreas: self._el_titulo_donaAreas.value }); });
      this._el_titulo_barrasAreaEstado = this._root.getElementById('titulo_barrasAreaEstado');
      this._el_titulo_barrasAreaEstado.addEventListener('change', function () { self._fire({ titulo_barrasAreaEstado: self._el_titulo_barrasAreaEstado.value }); });
      this._el_titulo_barrasOrdenes = this._root.getElementById('titulo_barrasOrdenes');
      this._el_titulo_barrasOrdenes.addEventListener('change', function () { self._fire({ titulo_barrasOrdenes: self._el_titulo_barrasOrdenes.value }); });
      this._el_titulo_matrizAreaMes = this._root.getElementById('titulo_matrizAreaMes');
      this._el_titulo_matrizAreaMes.addEventListener('change', function () { self._fire({ titulo_matrizAreaMes: self._el_titulo_matrizAreaMes.value }); });
      this._el_titulo_pivotControl = this._root.getElementById('titulo_pivotControl');
      this._el_titulo_pivotControl.addEventListener('change', function () { self._fire({ titulo_pivotControl: self._el_titulo_pivotControl.value }); });
      this._el_etiqueta_fMes = this._root.getElementById('etiqueta_fMes');
      this._el_etiqueta_fMes.addEventListener('change', function () { self._fire({ etiqueta_fMes: self._el_etiqueta_fMes.value }); });
      this._el_etiqueta_fArea = this._root.getElementById('etiqueta_fArea');
      this._el_etiqueta_fArea.addEventListener('change', function () { self._fire({ etiqueta_fArea: self._el_etiqueta_fArea.value }); });
      this._el_etiqueta_fVersion = this._root.getElementById('etiqueta_fVersion');
      this._el_etiqueta_fVersion.addEventListener('change', function () { self._fire({ etiqueta_fVersion: self._el_etiqueta_fVersion.value }); });
      this._el_etiqueta_fEstado = this._root.getElementById('etiqueta_fEstado');
      this._el_etiqueta_fEstado.addEventListener('change', function () { self._fire({ etiqueta_fEstado: self._el_etiqueta_fEstado.value }); });
      this._el_etiqueta_fCliente = this._root.getElementById('etiqueta_fCliente');
      this._el_etiqueta_fCliente.addEventListener('change', function () { self._fire({ etiqueta_fCliente: self._el_etiqueta_fCliente.value }); });
      this._el_diagnostico = this._root.getElementById('diagnostico');
      this._el_diagnostico.addEventListener('change', function () { self._fire({ diagnostico: self._el_diagnostico.checked }); });
    }
    _fire(props) {
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: props } }));
    }
    set title(v) { this._el_title.value = v == null ? '' : v; }
    get title() { return this._el_title.value; }
    set titulo_kpiTotal(v) { this._el_titulo_kpiTotal.value = v == null ? '' : v; }
    get titulo_kpiTotal() { return this._el_titulo_kpiTotal.value; }
    set titulo_kpiEstado(v) { this._el_titulo_kpiEstado.value = v == null ? '' : v; }
    get titulo_kpiEstado() { return this._el_titulo_kpiEstado.value; }
    set titulo_donaAreas(v) { this._el_titulo_donaAreas.value = v == null ? '' : v; }
    get titulo_donaAreas() { return this._el_titulo_donaAreas.value; }
    set titulo_barrasAreaEstado(v) { this._el_titulo_barrasAreaEstado.value = v == null ? '' : v; }
    get titulo_barrasAreaEstado() { return this._el_titulo_barrasAreaEstado.value; }
    set titulo_barrasOrdenes(v) { this._el_titulo_barrasOrdenes.value = v == null ? '' : v; }
    get titulo_barrasOrdenes() { return this._el_titulo_barrasOrdenes.value; }
    set titulo_matrizAreaMes(v) { this._el_titulo_matrizAreaMes.value = v == null ? '' : v; }
    get titulo_matrizAreaMes() { return this._el_titulo_matrizAreaMes.value; }
    set titulo_pivotControl(v) { this._el_titulo_pivotControl.value = v == null ? '' : v; }
    get titulo_pivotControl() { return this._el_titulo_pivotControl.value; }
    set etiqueta_fMes(v) { this._el_etiqueta_fMes.value = v == null ? '' : v; }
    get etiqueta_fMes() { return this._el_etiqueta_fMes.value; }
    set etiqueta_fArea(v) { this._el_etiqueta_fArea.value = v == null ? '' : v; }
    get etiqueta_fArea() { return this._el_etiqueta_fArea.value; }
    set etiqueta_fVersion(v) { this._el_etiqueta_fVersion.value = v == null ? '' : v; }
    get etiqueta_fVersion() { return this._el_etiqueta_fVersion.value; }
    set etiqueta_fEstado(v) { this._el_etiqueta_fEstado.value = v == null ? '' : v; }
    get etiqueta_fEstado() { return this._el_etiqueta_fEstado.value; }
    set etiqueta_fCliente(v) { this._el_etiqueta_fCliente.value = v == null ? '' : v; }
    get etiqueta_fCliente() { return this._el_etiqueta_fCliente.value; }
    set diagnostico(v) { this._el_diagnostico.checked = !!v; }
    get diagnostico() { return this._el_diagnostico.checked; }
  }
  if (!customElements.get(TAG)) customElements.define(TAG, ControlProduccionStyling);
})();
