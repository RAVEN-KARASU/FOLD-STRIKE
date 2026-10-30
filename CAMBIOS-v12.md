# FOLD//STRIKE — actualización 12

## Presentación por inactividad

El vídeo proporcionado, `spot_foldstrike.mp4`, está integrado en `assets/video/` sin recodificarlo. Después de 40 segundos sin interacción en los menús, se reproduce a pantalla completa conservando su proporción.

Mover el ratón, tocar la pantalla, pulsar una tecla o utilizar el mando devuelve al mismo menú. La pulsación que cierra el vídeo no confirma una selección accidentalmente. Al terminar el spot se regresa al menú y comienza una nueva espera de 40 segundos.

El vídeo respeta el volumen de música y la desactivación de sonido. La música del menú se pausa durante el spot y continúa desde su posición al regresar. En un navegador que bloquee la reproducción automática con sonido, el spot puede reproducirse silenciado; el lanzador de escritorio ya permite el audio automático.

No se activa durante combates, pausa, diálogos, créditos, presentación de logos ni salas remotas. Los ajustes abiertos y la selección actual se conservan al regresar.

## Interfaz y transiciones

- Eliminados los números decorativos de los cuatro botones principales.
- Eliminada la barra superior duplicada de ajustes y controles. Estos accesos se conservan en el inicio y en la pausa.
- Las transiciones mantienen la pantalla original hasta llegar a negro. Ya no crean copias que pierdan los estilos actuales o el contenido de los lienzos animados.

## Ejecutable

Usa **FOLD-STRIKE-v12.exe**, ubicado junto a `index.html`. El ejecutable anterior estaba abierto durante la actualización y se conservó para no interrumpir esa sesión. El nuevo servidor reconoce MP4 y sirve sus fragmentos correctamente.

Para futuras compilaciones, `desktop/build.ps1` genera el nombre habitual `FOLD-STRIKE.exe` cuando ese archivo no está en uso. Mantén siempre el ejecutable junto al resto de archivos del juego.

Verificaciones y capturas: `../analisis_sf3/arcade_v12/`.
