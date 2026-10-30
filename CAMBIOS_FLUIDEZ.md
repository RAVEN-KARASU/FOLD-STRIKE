**Primera mejora de fluidez — 25 de octubre de 2026**

La base de desarrollo pasa a ser Protein Fighter. SF III sirve como referencia de
respuesta, claridad de las poses y ritmo del combate. Esta revisión no incorpora
código, imágenes, audio ni datos de movimientos de SF III.

Cambios aplicados:

- Dibujo con objetivo de 60 actualizaciones por segundo, también en pantallas
  táctiles. El modo automático baja a 30 ante carga sostenida y vuelve a intentar
  60 cuando dispone de margen. Se mantiene el límite de resolución móvil.
- Reloj de combate fijo a 60 Hz, incluidas las pausas de impacto. Un golpe durante
  un cuadro que recupera varios pasos detiene los pasos siguientes correctamente.
- Respuesta de las articulaciones mediante la solución exacta de un resorte
  amortiguado, reduciendo el retraso de las poses respecto a su objetivo.
- Partículas y ondas avanzan según el tiempo de presentación; ya no duran el
  doble solo porque se dibujen a 30 en lugar de 60.
- Los cálculos de confianza y mapas tienen una frecuencia propia, dejando más
  tiempo para dibujar el movimiento. Los envíos de estado se programan por tiempo,
  conservando el objetivo de 15 por segundo con distintos refrescos de pantalla.

Para probar, desde esta carpeta:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abrir `http://localhost:8000/?fps`. El indicador distingue el objetivo de dibujo
de las imágenes realmente dibujadas. Comparar con `?fps&render=60` y
`?fps&render=30` si hace falta aislar la frecuencia de presentación.

**Validación:** pruebas del reloj entre 20 y 144 Hz, ajuste automático de dibujo,
cadencia de envíos y pruebas existentes de geometría de las dos proteínas. Prueba
en Edge con WebGL2 de movimiento, puño, patada, salto, bloqueo, pausa, reanudación,
impactos y ausencia de errores de JavaScript. Una GFP de los archivos de prueba
se importó y se animó; se comprobó movimiento táctil en un viewport móvil emulado.
Los resultados están en `../analisis_sf3/fluidez_protein/resultados.json`.

No es una medición de rendimiento en un teléfono físico. El navegador de prueba
utiliza renderizado por software; no permite prometer 60 FPS de juego. Tampoco se
probó una partida remota entre dispositivos. Ambos participantes deben usar la
misma revisión, porque la respuesta de las poses influye en el contacto molecular.

**Para acercarse más a SF III:** el siguiente trabajo es diseñar poses legibles de
anticipación, contacto y recuperación, y revisar sus ventanas junto con las
colisiones. Después conviene definir un perfil de combate con saltos, buffer de
entradas, cancelaciones, dash y parry coherentes, manteniendo un modo accesible
para difusión científica. Menús, selección, escenarios y música constituyen otra
etapa; no se han rediseñado en esta revisión.

Se guardó una copia de los cuatro archivos originales modificados en
`../analisis_sf3/fluidez_protein/originales/`, con sus hashes SHA-256.
