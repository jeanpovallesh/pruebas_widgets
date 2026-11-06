# Opción B — prototipo (carga directa desde la historia)

## Cómo funciona
1. El widget valida el archivo (igual que hoy).
2. Un botón de la historia ejecuta un script que:
   - limpia con una Data Action los datos existentes de las Version x TIEMPO del archivo (reemplazo);
   - escribe las filas en una tabla de planificación oculta con `setUserInput`, por lotes;
   - publica la versión.

## Qué hay que armar en la historia (una sola vez)
- Importar el manifiesto v1.0.3 y colocar el widget (`CargaPgp_1`).
  El widget entrega texto separado por `|` (getRowText, getVersionsText, getPeriodsText); el script no usa JSON.
- Una **tabla de planificación** sobre SOLLA_PGP_IND (`Table_Carga`), oculta (visibilidad en runtime = falso)
  y con la planificación habilitada. Debe poder resolver las 7 dimensiones del modelo.
- **Data Action** `DA_LimpiarVersionTiempo` con parámetros `P_VERSION` y `P_TIEMPO` que borra los datos de esa
  Version x TIEMPO (paso Advanced Formulas, `DELETE`).
- Un botón `Button_Cargar` y un texto `Text_Estado`.
- Pegar el script de `script_historia_opcionB.txt` en los eventos indicados.

## Qué NO está comprobado (probar con valido.csv antes de nada)
- Que `setUserInput` acepte una selección con las 7 dimensiones sin tenerlas visibles en la tabla.
- Que funcione en historias "Optimized" y con modelo de una sola medida.
- `split("|")` y la llamada `getRowText(i)` por fila: si SAC Script no los acepta como aquí, hay que ajustar.
- Rendimiento: ~500 filas por submit es la referencia; 5.000+ filas pueden tardar minutos.
- No hay informe de filas rechazadas: solo el conteo `fallidas`.
- Las escrituras van a una versión privada hasta publicar; si el usuario cierra la historia a mitad, no se publica.
