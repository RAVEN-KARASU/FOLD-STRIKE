// Authored comic scenes. Choices explore different claims; the fight is not a treatment model.
(function(){
 const pair=text=>text.split('\n').map(t=>{const [label,response]=t.split('=>');return {label,response};});
 const entry=(taunt,reply,pre,after,post)=>({taunt,reply,pre:pair(pre),after,post:pair(post)});
 const scenes={
 egfr:entry('¡Nadie cruza mi puerta sin un mensaje! Soy EGFR, una antena que recibe señales de crecimiento.','Entonces eres el receptor, no la señal. No te llamaré HER2 solo por llevar una armadura parecida.',`Tu parecido con HER2 basta para reconocerte=>¡Trampa de portero! Somos de la familia ErbB, pero nuestras superficies no son idénticas. El parecido no demuestra que tu anticuerpo se una a mí.
Tienes una parte fuera y otra dentro=>Buen plano. Un receptor de membrana puede conectar un mensaje exterior con una respuesta interior. ¡Una puerta con dos lados!
Eres quien transporta oxígeno=>Ese no es mi papel. Participar en recibir señales es distinto de transportar el oxígeno de la sangre.
Tus señales deben ser siempre dañinas=>La ciudad necesita crecer y reparar tejidos. El contexto y la regulación importan: una función útil no es una amenaza permanente.`, 'EGFR baja el plano: «Te ganaste el paso. No confundiste una función con una condena».',`EGFR y HER2: dos nombres del mismo personaje=>Tacha esa frase. Comparten familia, no identidad. HER3 volverá a poner a prueba esa distinción.
Dibujemos la membrana entre ambos lados=>Así tu mapa explica por qué hablamos de una región externa y otra interna.
El anticuerpo reconoce a toda la familia=>No. Reconoce una superficie concreta; el parentesco no sustituye esa prueba.
Guardemos el plano y busquemos a HER3=>Aquí está tu pase. La siguiente torre tiene otro nombre y otros compañeros.`),
 her3:entry('¡Una red no la gana un solista! Soy HER3 y trabajo en el barrio de la familia ErbB.','Tu sombra apunta hacia HER2. Conoceré tus alianzas sin confundir a los participantes.',`Si colaboras con HER2, eres HER2=>¡Ni con la misma capa! Dos proteínas pueden colaborar sin ser la misma. Sus identidades no desaparecen al unirse.
Quiero conocer a tus compañeros=>Ahora hablas de una red. Estudiar las interacciones ayuda a entender cómo se transmite una señal.
Tu número 3 significa mayor poder=>El nombre no es un nivel de combate. Distingue un miembro de la familia, no su fuerza.
Me basta con seguir tu color=>Estas paletas ayudan en el juego. No son colores universales de las proteínas ni prueban su función.`, 'HER3 recoge su capa: «Una alianza no borra las diferencias. Lleva esa idea a la sala de máquinas».',`Hagamos un mapa con conexiones=>Un mapa de relaciones cuenta algo que una lista de nombres no puede mostrar por sí sola.
Los colores son datos biológicos=>No conserves esa conclusión. En esta edición son una elección visual.
Ordenemos los receptores por número de poder=>HER3 no es un nivel superior a HER2. El número no mide eso.
Sigamos hacia la pieza interna de HER2=>La escalera conduce a su dominio quinasa: una parte situada dentro de la célula.`),
 her2kinase:entry('¡CLONK! Yo vigilo la sala de máquinas. Soy un dominio de HER2: una región con una tarea propia.','Mi anticuerpo reconoce una zona exterior. Este panel interior no es su lugar de unión.',`Meteré el anticuerpo hasta el panel=>Los anticuerpos de esta ruta reconocen regiones externas de HER2, no este dominio intracelular.
Separaré exterior e interior en el plano=>¡Buen dibujo! Una proteína puede tener regiones a distintos lados de una membrana.
Dominio significa reino enemigo=>Aquí significa una región de la proteína. El castillo es nuestra manera de representar la aventura.
Este cristal debe contener todo HER2=>El modelo representa el dominio quinasa. Un depósito PDB puede contener solo una parte de una proteína.`, 'La quinasa apaga los engranajes: «Conocer una pieza no equivale a haber visto toda la máquina».',`Anotemos que este modelo es un fragmento=>Esa precisión permite consultar la ficha sin confundir parte y molécula completa.
Nuestro objetivo sigue en la cara externa=>La azotea final nos devolverá a la región que reconocen los anticuerpos elegidos.
Todo anticuerpo entra a cualquier sala=>Reconocimiento y acceso son preguntas distintas. No se resuelven por llevar una capa de héroe.
Una pieza no permite aprender nada=>Estudiar un dominio puede responder preguntas concretas, aunque no represente toda la molécula.`),
 her2:entry('¡Mi nombre estaba en todos tus mapas! En ciertos tumores, demasiadas antenas HER2 favorecen señales de crecimiento.','No vine a derribar cualquier antena. Vine a reconocerte con precisión.',`Trastuzumab y pertuzumab usan el mismo sitio=>Se unen a zonas diferentes de mi región externa. Compartir diana no obliga a compartir sitio de unión.
Dos zonas distintas, una misma diana=>¡Descifraste la azotea! Distintos anticuerpos pueden reconocer regiones diferentes de HER2.
HER2 solo existe en células tumorales=>No conviertas la historia en esa regla. HER2 tiene funciones biológicas; la cantidad y regulación importan en ciertos tumores.
Ganar la pelea demostrará una cura=>Demostrará que superaste un juego. Las afirmaciones sobre tratamientos necesitan investigación y evidencia.`, 'HER2 desmonta su corona: «Encontraste la diana sin confundirla con sus vecinos. Esa fue tu hazaña».',`Se derribaron todas las antenas=>Ese no fue el objetivo. Aprendiste a distinguir una diana dentro de una red.
Dos anticuerpos, dos puntos de encuentro=>Un buen titular: una proteína tiene distintas zonas accesibles al reconocimiento.
HER2 es culpable en cualquier situación=>Una proteína no tiene intenciones. Su función, regulación y contexto importan.
Un mapa que abre nuevas preguntas=>Estructura, función y contexto: esas tres pistas seguirán contigo. ¡Azotea conquistada!`),
 il6:entry('¡WII-UU! Atención, tejido. Soy IL-6, una citocina: una proteína mensajera entre células.','Busco a TNF. Que tu radio suene fuerte no basta para demostrar que eres tú.',`La voz más fuerte siempre es TNF=>Intensidad y nombre son cosas distintas. IL-6 y TNF son proteínas diferentes.
Investiguemos la palabra citocina=>Significa mensajera entre células. No todas las citocinas transmiten exactamente la misma información.
El número 6 indica nivel de emergencia=>No es una escala de peligro. Es parte del nombre que identifica a IL-6.
Desconectemos todas las radios=>También impedirías avisos útiles. Primero identifica qué señal estudias y en qué contexto aparece.`, 'IL-6 entrega una grabación: «Escuchar mejor fue más útil que gritarme».',`IL-6: mensajera distinta de TNF=>Etiqueta correcta. Así podrás comparar las próximas señales sin mezclarlas.
TNF, porque hablaba de inflamación=>Dos voces pueden participar en la inflamación y seguir siendo distintas. Cambia esa etiqueta.
Mensaje perjudicial en todos los casos=>La defensa y reparación también necesitan comunicación. El contexto importa.
Comparemos esta grabación con IL-1 beta=>La siguiente locutora tiene nombre propio y otra parte de la conversación.`),
 il1b:entry('¡PUM! Yo también tengo noticias. Soy IL-1 beta, otra mensajera que participa en la inflamación.','Reconozco el tema de la noticia, pero no te confundiré con IL-6 ni TNF.',`Eres IL-6 con otro traje=>Somos proteínas distintas. Aparecemos en el mismo barrio porque nuestras señales están relacionadas.
Eres una pieza de la conversación inflamatoria=>Una red incluye varias citocinas y receptores. No se resume en un único personaje.
Eres el receptor donde termina TNF=>Ese papel lo verás en TNFR1. Yo soy mensajera, no ese receptor.
Eres la diana final de mi anticuerpo=>En este capítulo adalimumab o infliximab buscan TNF. Este combate es una estación educativa, no una unión terapéutica.`, 'IL-1 beta deja el megáfono: «Tu mapa ya tiene varias voces. No las borres para que parezca más fácil».',`Basta memorizar inflamación y olvidar nombres=>Esa palabra agrupa procesos con participantes diferentes. Saber quién es quién evita errores.
Dibujemos mensajeros y receptores por separado=>Esa diferencia será clave frente al guardián TNFR1.
Todas las citocinas sirven al mismo anticuerpo=>Compartir categoría no convierte a todas en la misma diana. El reconocimiento es específico.
Llevemos el mensaje hasta el timbre TNFR1=>La pista encaja: ahora conocerás al receptor, no a otro nombre para TNF.`),
 tnfr1:entry('¡DING! Yo recibo la llamada. Soy TNFR1, un receptor de TNF. No soy quien lleva el mensaje.','El visitante y la puerta cumplen tareas diferentes. No cambiaré sus etiquetas.',`La R señala un receptor=>La R te da una pista sobre mi papel. TNF y TNFR1 no son dos nombres de la misma molécula.
La puerta es el mensajero disfrazado=>Un receptor y una molécula que se une a él son participantes diferentes.
Mi anticuerpo busca el timbre=>Los anticuerpos elegidos en esta ruta reconocen TNF. Nuestro encuentro sirve para comprender la red.
Un complejo es una molécula con muchos nombres=>Un complejo puede reunir distintas moléculas. Hay que identificar sus participantes y cadenas.`, 'TNFR1 abre la verja: «La llamada venía de dentro. Pero yo era el receptor, no la voz».',`Dibujemos dos moléculas unidas=>Ese dibujo puede mostrar una interacción sin borrar la identidad de cada participante.
Una unión fusiona los nombres=>No. Unirse no convierte a dos participantes en una sola identidad molecular.
Solo se puede estudiar un receptor entero=>También se estudian fragmentos: este modelo procede de un dominio soluble del receptor.
Sigamos la llamada hasta TNF=>Mantén separadas la señal y la puerta que la recibe. La central está delante.`),
 tnf:entry('¡TRES VOCES, UN NOMBRE! Mis copias pueden reunirse en un trímero: un grupo de tres. Soy TNF.','Mi misión no era apagar cada defensa del barrio. Era encontrar a este mensajero.',`Tres copias son tres proteínas sin relación=>En un trímero como este se reúnen copias del mismo tipo. Cantidad de copias e identidad son cosas distintas.
Te distingo de tu receptor TNFR1=>Adalimumab e infliximab reconocen TNF. Ya separas al mensajero del receptor.
Toda inflamación debe desaparecer=>También ayuda a responder a daños y defendernos. Su regulación y contexto importan.
Tu modelo reproduce toda la inflamación=>Una red inflamatoria real incluye muchas moléculas, células y procesos. Esta pelea solo representa una parte de la historia.`, 'El coro baja el volumen: «Identificaste la señal sin borrar a sus vecinos. La central reconoce tu precisión».',`Varias copias pueden formar un conjunto=>Esa organización aporta información que no se ve mirando solo una cadena aislada.
TNF y TNFR1 quedaron fusionados=>No los fusiones en el mapa. La unión no elimina su identidad.
El marcador demuestra un tratamiento=>El marcador mide una partida. La investigación comprueba efectos y resultados por otras vías.
Mensajeros, receptores y contexto=>¡Central superada! Tu mapa conserva las diferencias de las cuatro estaciones.`),
 pdl1:entry('¡CLAC! Con mi pase puedo encontrarme con PD-1 y participar en una señal de freno. Soy PD-L1.','Necesito distinguir la tarjeta del lector. Una letra pequeña puede cambiar toda la misión.',`PD-L1 es el receptor PD-1=>La L te da una pista: soy un ligando. PD-1 es el receptor con el que puedo unirme.
La tarjeta representa un ligando=>Ligando significa una molécula que se une a otra. Aquí importa para regular las defensas.
Pembrolizumab busca esta tarjeta=>En esta ruta reconoce PD-1. Participar en una misma interacción no significa ser la misma diana.
Los tumores inventaron todos los frenos=>Los controles tienen funciones normales. Algunas células tumorales pueden aprovechar esas señales.`, 'PD-L1 devuelve las etiquetas: «No dejaste que una letra pequeña te engañara».',`Busquen al receptor, no confundan el pase=>Tu anticuerpo sigue el camino hacia PD-1. Esa distinción orienta la búsqueda.
Todas las tarjetas son idénticas=>PD-L2 es otro ligando. La siguiente portadora tiene diferencias que estudiar.
Un freno siempre es enemigo=>También ayuda a evitar respuestas excesivas. Su papel depende del contexto.
Podemos estudiar la superficie de contacto=>Las estructuras ayudan a examinar cómo se relacionan las moléculas que se unen.`),
 pdl2:entry('¡OTRA CREDENCIAL! Yo también puedo unirme a PD-1. Mira el sello: este modelo procede de una estructura de ratón.','La procedencia del archivo es una pista, no un detalle para esconder.',`Ignoremos el organismo de origen=>La especie es parte de la información del depósito y ayuda a interpretar el modelo.
Eres otro ligando de PD-1=>Un receptor puede relacionarse con más de un ligando. Eso no vuelve idénticos a PD-L1 y PD-L2.
Si viene de ratón, no permite aprender nada=>Puede aportar información. Debemos conocer sus límites y no asumir que representa exactamente todo lo humano.
El 2 significa el doble de freno=>El nombre no mide potencia. Identifica una proteína distinta de PD-L1.`, 'PD-L2 estampa tu pase: «Leíste la letra pequeña. Eso también es explorar».',`Modelo de ratón, origen declarado=>Así quien consulte el retrato podrá saber qué estructura se utilizó.
Humano porque se parece al anterior=>El parecido visual no cambia la procedencia del depósito.
Mismo lector, misma identidad del ligando=>Compartir receptor no convierte a todos sus ligandos en una sola proteína.
Comparemos especies con datos=>Buena pregunta científica. Comparar exige mirar evidencia, no solo el dibujo del juego.`),
 ctla4:entry('¡ALTO! No todas las barreras pertenecen al mismo puesto. Soy CTLA-4, otro regulador de las defensas.','No te llamaré PD-1 solo porque ambos participen en un control.',`Dos frenos son intercambiables=>Compartir una función general no hace iguales sus moléculas ni sus interacciones.
Distingamos cada punto de control=>CTLA-4 y PD-1 son participantes distintos. Tu mapa no debe mezclarlos.
Pembrolizumab reconoce cualquier freno=>En esta ruta la diana es PD-1. Yo soy una estación de comparación, no su sustituto.
Una pieza explica toda la red=>También importan las conexiones y el contexto. Un control no representa toda la respuesta de las defensas.`, 'CTLA-4 aparta la barrera: «Pasaste por controles diferentes sin cambiarles el nombre».',`Mantengamos dos casillas en el mapa=>Comparar no significa mezclar. Conserva una para CTLA-4 y otra para PD-1.
Guardemos todo bajo la etiqueta enemigo=>Perderías sus funciones normales y las diferencias entre participantes.
La complejidad impide aprender=>Podemos dividir la pregunta en partes. Cada encuentro te enseñó una distinción manejable.
Lleguemos a PD-1 con el mapa completo=>Recuerda qué receptor busca tu anticuerpo. La última barrera está delante.`),
 pd1:entry('¡ÚLTIMO CONTROL! Los frenos también protegen. Regulo la respuesta de ciertas células de las defensas.','Y algunas células tumorales aprovechan esas señales. No vine a destruir a la patrulla que te lleva.',`Ataquemos a toda célula que lleve PD-1=>Confundirías diana molecular y célula. Pembrolizumab reconoce PD-1; esa célula no es el enemigo de esta historia.
Estudiemos dónde se une pembrolizumab=>Las estructuras de complejos ayudan a observar la zona de contacto. Reconocimiento es la palabra clave.
Tu nombre muerte celular explica todo=>Los nombres tienen historia y no cuentan todas las funciones. Aquí nos interesa tu papel regulador.
Un tumor no puede aprovechar un freno=>Esas señales pueden ser aprovechadas en ciertos contextos tumorales. Útil y problemático no son etiquetas permanentes.`, 'PD-1 recoge la barrera: «No venciste por acelerar a ciegas. Supiste qué control estabas mirando».',`Una patrulla sin ningún control=>La regulación sigue siendo necesaria. Estudiamos una interacción concreta, no la eliminación de todos los controles.
Ligandos y receptor con nombres propios=>PD-L1 y PD-L2 por un lado, PD-1 por otro. Ahora tu mapa conserva quién es quién.
Una cura probada por el marcador=>Las afirmaciones sobre tratamientos necesitan evidencia fuera del juego. El marcador cuenta victorias de una partida.
Una nueva pregunta sobre la unión=>Esa pregunta conecta el cómic con la biología estructural. ¡Aduana superada!`),
 vegfr1:entry('¡SPLASH! Soy el buzón del primer canal. Recibo señales de la familia VEGF; no soy la carta.','No te confundiré con VEGF-A aunque compartan letras.',`La R identifica al receptor=>Mensajero y receptor forman lados distintos de una conversación. Esa R ayuda a recordar mi papel.
Tú transportas la sangre=>No soy un vaso ni la sangre. Soy una proteína receptora en una red relacionada con los vasos.
Tú eres VEGF-A=>Ese nombre corresponde a una señal. La ruta de ranibizumab termina en ella, no en mí.
Prohibamos todos los vasos nuevos=>Formar vasos también participa en procesos normales. Hay que preguntar dónde, cuándo y cómo se regula.`, 'VEGFR1 entrega un mapa seco: «Primero distinguimos quién envía y quién recibe».',`Un receptor junto a una señal separada=>Así no confundes el buzón con la carta que recibe.
VEGF-A con una armadura nueva=>Cambiar el disfraz no cambia el dato: son proteínas diferentes.
Un enemigo sin función normal=>La red también cumple tareas necesarias. Nuestro duelo representa un papel, no una maldad biológica.
Una pista hacia VEGF-C=>Una familiar distinta espera río arriba. Presta atención a la letra final.`),
 vegfc:entry('¡NO BORRES LA C! Compartimos familia, pero no somos fotocopias. Mi nombre no termina en A.','Un buen atajo empieza por leer bien el destino.',`Seguiré la C como si fuera la A=>Acabarías identificando a otro miembro de la familia. Los nombres completos importan.
Compararé los dos miembros=>Compartir familia no implica que cada anticuerpo reconozca a ambos. Comparar abre esa pregunta.
Me guiaré solo por la silueta=>El dibujo del juego no basta para identificar una molécula. Consulta su estructura y su ficha.
Todo VEGF debe ser un receptor=>VEGF-C es una señal. Los receptores tienen nombres como VEGFR1 y VEGFR2.`, 'VEGF-C enrolla el plano: «Leer una letra te ahorró perderte en todo un río».',`Conservemos los nombres completos=>Ese pequeño detalle evita confundir familiares.
Toda familia hace exactamente lo mismo=>Las funciones pueden relacionarse sin ser idénticas. No reduzcas a todos a una única casilla.
Separemos VEGF de VEGFR=>La siguiente estación vuelve a ser un receptor. Esa distinción servirá otra vez.
Marquemos VEGF-A como destino=>La brújula sigue apuntando a la diana de ranibizumab en esta ruta.`),
 vegfr2:entry('¡PUENTE CERRADO! Soy la segunda estación receptora, VEGFR2. No soy VEGFR1 ni la señal VEGF-A.','Tres nombres parecidos, tres casillas distintas. Ya aprendí a mirar las etiquetas.',`VEGFR2 es un receptor=>Contraseña aceptada. Recibo señales de esta familia; no soy el mismo objeto que la señal.
El número 2 te hace el jefe final=>El número no decide el papel en este capítulo ni mide potencia. El destino es VEGF-A.
Ranibizumab viene por este puente=>Reconoce VEGF-A en esta ruta. Mi encuentro sirve para separar receptores y señales.
Una red con varios receptores es un error=>Las redes biológicas pueden tener varios receptores y señales. Esa diversidad también se estudia.`, 'VEGFR2 baja el puente: «Ya puedes encontrar al maestro de obras sin confundirlo con sus estaciones».',`Receptor 1 y receptor 2 por separado=>Compartir una familia de señales no borra sus diferencias.
Una flecha explica toda la biología=>Un dibujo sencillo ayuda, pero puede omitir conexiones. Debemos recordar sus límites.
La señal VEGF-A sigue al final=>Ahora sabes qué clase de molécula estás buscando.
Menos vasos siempre será mejor=>Los tejidos necesitan vasos. El lugar, la cantidad y la regulación importan.`),
 vegfa:entry('¡BOOM! Soy VEGF-A, el maestro de obras. Angiogénesis es el nombre de la formación de vasos nuevos.','Ni todos los canales sobran ni todo plano debe ejecutarse. Hoy te encontramos a ti.',`Angiogénesis significa cualquier crecimiento=>Es más concreto: formación de vasos sanguíneos nuevos. No es un sinónimo de todo crecimiento celular.
Los vasos nuevos también ayudan a reparar=>Sí. Esta actividad también participa en procesos normales de reparación de tejidos.
Ranibizumab reconoce VEGF-A aquí=>Esa es la diana que marcaba el mapa. No eran los receptores que encontraste antes.
La retina y cualquier cáncer son lo mismo=>Compartir una molécula o proceso no vuelve iguales los contextos. Esta aventura está situada en la retina.`, 'VEGF-A guarda el compás: «Aprendiste a leer el plano antes de prohibir toda construcción».',`VEGF-A es una señal, no un vaso=>La señal participa en la conversación; el vaso es una estructura del tejido.
Construir más siempre mejora el barrio=>No siempre. Lugar, cantidad y regulación influyen en el resultado.
Una foto PDB explica una enfermedad entera=>Una estructura aporta información molecular. Comprender una enfermedad necesita más datos y escalas.
Señal, familiares y receptores reconocidos=>Cuatro estaciones, una distinción cada vez. ¡Atlas de la retina completado!`),
 il4:entry('¡TAN-TÁN! Soy IL-4, una mensajera de las defensas. Participo en conversaciones relacionadas con respuestas alérgicas.','Una señal de la orquesta, no toda la orquesta. Leeré tu partitura antes de tocar.',`El 4 cuenta cuántas alergias causas=>Es parte del nombre de la proteína. No cuenta enfermedades ni mide poder.
IL-4 es distinta de IgE=>No soy el anticuerpo IgE que busca omalizumab. Esa diferencia guía la misión.
Omalizumab reconoce toda señal del teatro=>Compartir un contexto no basta. El reconocimiento de una diana es más concreto.
La alergia tiene muchos participantes=>Intervienen señales y células; un solo personaje no explica toda la respuesta.`, 'IL-4 cede la batuta: «No confundiste dirigir una parte con ser toda la orquesta».',`IL-4, mensajera de esta red=>Buen programa: dice qué papel estudias sin convertirlo en toda la historia.
IgE con otro número=>IgE es un anticuerpo; IL-4 es otra proteína mensajera.
Cuatro puntos de peligro=>Los números del nombre no son una clasificación de peligro.
Escuchemos después a IL-13=>Su instrumento se relaciona con esta conversación, pero tendrás que distinguirlo.`),
 il13:entry('¡NO SOY UN ECO IDÉNTICO! Mis funciones se relacionan con las de IL-4, pero soy IL-13, otra proteína.','Comparar no será repetir tu nombre con un número distinto.',`IL-13 e IL-4 son intercambiables=>Funciones relacionadas no implican identidad completa. No somos el mismo personaje.
Escuchemos lo común y lo diferente=>Esa comparación abre preguntas útiles sin borrar las diferencias moleculares.
Trece significa más fuerte que cuatro=>Los nombres no son estadísticas de combate. Esos números no ordenan nuestra potencia.
IgE debe ser otra interleucina numerada=>IgE pertenece a los anticuerpos. No es otra IL numerada de esta conversación.`, 'IL-13 deja sonar la última nota: «El público ya distingue dos instrumentos».',`Una tarea relacionada no significa identidad=>Esa idea evita errores al interpretar redes de proteínas.
Podemos intercambiar nombres sin perder datos=>Perderías precisamente qué molécula estás estudiando.
Los colores indican la potencia real=>En este juego colores y fuerza son decisiones de diseño, no mediciones biológicas.
Busquemos el receptor donde se une IgE=>El próximo escenario es FcεRI. Será otro papel dentro de la misma historia.`),
 fceri:entry('¡ASIENTO RESERVADO! Mi nombre se lee Fc épsilon R uno. Soy un receptor que se une a IgE con alta afinidad.','El asiento no es quien viene a sentarse. Explícame esa palabra: afinidad.',`Es amistad entre personajes=>La comparación es simpática, pero aquí describe lo favorable que es una unión molecular.
Describe una unión favorable=>Esa es la idea. No implica voluntad: las moléculas no eligen amigas como nosotros.
Significa que eres IgE=>La afinidad describe una relación entre participantes; no los vuelve idénticos.
Omalizumab busca el asiento=>En esta ruta reconoce IgE, no este receptor. Estamos a una puerta de la diana.`, 'FcεRI aparta la silla: «Nombrar una unión es más preciso que llamar amigas a dos moléculas».',`Receptor e IgE son participantes distintos=>El dibujo conserva así quién se une a quién.
Afinidad es una emoción molecular=>En ciencia no significa cariño. Recuerda su relación con la unión molecular.
El modelo puede mostrar solo una región=>La ficha identifica el dominio extracelular y la cadena utilizados. Una región no equivale a toda la proteína.
Abramos el telón donde espera IgE=>El último encuentro será anticuerpo frente a anticuerpo.`),
 ige:entry('¡FWOOSH! Yo también soy un anticuerpo. Ahora otra proteína de reconocimiento viene a reconocerme. Soy IgE.','No es una contradicción. Ser un anticuerpo no impide tener una superficie que otro reconozca.',`Veo una IgE completa con piernas=>Este encuentro usa un fragmento Fc de IgE. Las extremidades son una adaptación del juego, no parte de la estructura observada.
Un anticuerpo puede ser diana de otro=>Esa es la clave de omalizumab e IgE. Identidad y reconocimiento son preguntas distintas.
Toda IgE es un villano por naturaleza=>Las proteínas no tienen intenciones. Personificamos funciones para contar una historia, pero la biología requiere contexto.
Un fragmento no aporta ninguna pista=>Una parte bien identificada puede responder preguntas sobre estructura o contacto. No hace falta confundir parte y todo.`, 'IgE cierra el telón: «La sorpresa no era mi fuerza. Era reconocer a una reconocedora».',`Todos los anticuerpos son iguales=>Compartir familia no significa reconocer las mismas dianas ni tener superficies idénticas.
La ficha debe aclarar el fragmento utilizado=>Así se puede consultar el depósito PDB y distinguir la estructura original de la adaptación jugable.
Una alergia se reduce a esta pelea=>Nuestra historia simplifica una red compleja. La partida no reproduce todos sus procesos.
El viaje termina con una nueva pregunta=>¡Buen final para un héroe científico! Distinguiste mensajeros, receptores y anticuerpos. Ahora puedes explorar sus estructuras.`),
 };
 const openings={
 her2:{scene:'¡KRAK! La ciudad de las antenas no duerme. Mensajes de crecimiento saltan de torre en torre. HER2 vigila la última azotea.',hero:'No derribaré toda la ciudad. Encontraré la antena correcta.',boss:'¡Mis vecinos custodian el camino! Si confundes nuestros nombres, jamás llegarás a mi torre.',question:'El equipo espera tu primera orden.',choices:pair(`Sigamos el mensaje entre las torres=>Empezarás por EGFR, pasarás por HER3 y entrarás en una región interna de HER2. Una red se entiende distinguiendo sus participantes.
Derribemos cualquier antena parecida=>La ciudad necesita señales para funcionar. Tu anticuerpo reconoce una zona concreta; parecerse no basta.
Busquemos dos entradas a HER2=>Trastuzumab y pertuzumab reconocen regiones externas diferentes de HER2. Dos puntos de encuentro, una misma diana.
Estudiemos primero el mapa PDB=>PDB guarda estructuras moleculares. El cuerpo del luchador parte de esas coordenadas; sus extremidades y poderes son nuestra ficción.`)},
 tnf:{scene:'¡WII-UU! La alarma no deja dormir al distrito. En la central manda TNF, el portavoz de tres voces.',hero:'Una alarma ayuda en una emergencia. Pero necesitamos saber quién sigue enviando la señal.',boss:'¡No me llames incendio! Soy un mensajero. Primero distingue mis avisos de los de IL-6 e IL-1 beta.',question:'¿Cómo investigamos la central?',choices:pair(`Cortemos la corriente de todo el barrio=>También perderías avisos útiles. La misión es reconocer TNF, no eliminar toda inflamación.
Identifiquemos cada voz de la radio=>IL-6, IL-1 beta y TNF son proteínas diferentes. Compartir una emergencia no nos hace idénticas.
Busquemos al equipo de tres=>Las copias de TNF pueden reunirse en trímeros: grupos de tres. No significa que sean tres identidades distintas.
Preguntemos quién recibe las llamadas=>Encontrarás a TNFR1, un receptor. El mensajero lleva la señal; el receptor la recibe.`)},
 pd1:{scene:'¡CLAC! Una barrera detiene a la patrulla. PD-L1 y PD-L2 muestran credenciales; al fondo espera PD-1.',hero:'Soy pembrolizumab. Mi destino es PD-1, pero debo distinguirlo de las tarjetas que recibe.',boss:'¡La prudencia también protege! Las defensas necesitan controles, aunque ciertas células tumorales puedan aprovechar esas señales de freno.',question:'La barrera baja. ¿Qué propones?',choices:pair(`Quitemos todos los frenos=>Una patrulla sin controles puede causar daños. Estudiaremos uno concreto, no borraremos toda regulación.
Sigamos las tarjetas hasta el lector=>PD-L1 y PD-L2 son ligandos que pueden unirse a PD-1. Este último es el receptor.
Ataquemos a las células que lleven PD-1=>No son el enemigo de esta historia. Pembrolizumab reconoce una diana molecular; no estamos cazando a esa patrulla.
Comparemos este puesto con CTLA-4=>Hay varios puntos de control. CTLA-4 será otro guardián, distinto de PD-1.`)},
 vegf:{scene:'¡SPLASH! Nuevos canales cruzan los planos del ojo. La sangre lleva recursos, pero construir demasiado o en el lugar equivocado puede traer problemas.',hero:'Soy ranibizumab. Busco VEGF-A entre familiares y estaciones receptoras.',boss:'¡Soy el maestro de obras! También participo en procesos normales. Una capa de villano no vuelve malvada a una proteína.',question:'¿Qué orden damos a la expedición?',choices:pair(`Prohibamos construir cualquier vaso=>Los tejidos necesitan sangre. Esta ruta de la retina enseña a reconocer VEGF-A, no a borrar todos los vasos.
Revisemos quién manda los planos=>VEGF-A es una señal; VEGFR1 y VEGFR2 son receptores. Estudiarás ambos lados de esa conversación.
Sigamos cualquier pista que diga VEGF=>Mira las letras completas. VEGF-C y VEGF-A son miembros diferentes de una familia.
Llevemos oxígeno a las estaciones=>Los vasos transportan sangre con oxígeno y nutrientes. VEGF no es ese oxígeno: es una señal.`)},
 ige:{scene:'¡ACHÍS! El teatro del estornudo toca a todo volumen. IL-4 e IL-13 discuten la partitura. Tras el telón espera IgE.',hero:'Soy omalizumab. Antes de encontrar a IgE, distinguiré mensajeros y receptores.',boss:'¡Sorpresa! Yo también soy un anticuerpo. Explica cómo una reconocedora puede ser reconocida.',question:'El público espera. ¿Por dónde empezamos?',choices:pair(`Declaremos enemigo a todo el polen=>La alergia implica una respuesta a sustancias que suelen ser inofensivas. No basta con ponerle un disfraz de villano al polen.
Escuchemos a IL-4 e IL-13 por separado=>Son mensajeras distintas; ninguna es IgE. Cada músico tiene su propia parte.
Busquemos el asiento donde se une IgE=>Encontrarás al receptor FcεRI. Será importante distinguir el asiento de su invitada.
Preparemos un anticuerpo contra otro=>Omalizumab reconoce IgE. Pertenecer a la familia de los anticuerpos no impide esa unión.`)}
 };
 const line=(speaker,text)=>({speaker,text}),choice=(text,choices)=>({...line('hero',text),choices});
 const previous=CampaignStory;
 window.CampaignStory={chapters:previous.chapters,encounters:scenes,openings,
  lines(ch,stage,kind){const c=openings[ch.id],e=scenes[ch.bosses[Math.min(stage,3)]];
   if(kind==='intro')return [line('narrator',c.scene),line('hero',c.hero),line('boss',c.boss),choice(c.question,c.choices),line('hero','¡En marcha! Escuchemos al primer guardián.'),line('narrator','Una ficción con moléculas reales: los combates representan el desafío de aprender, no un tratamiento.')];
   if(kind==='pre')return [line('narrator',`${ProteinCampaign.actor(ch.bosses[stage]).name} entra en la viñeta. ${stage===3?'La última puerta del capítulo está delante.':'Una nueva pista bloquea el camino.'}`),line('boss',e.taunt),line('hero',e.reply),choice('¿Cómo responde nuestro equipo?',e.pre),line('boss',stage===3?'¡Última página del capítulo! Demuestra tu precisión en la arena.':'¡La puerta se gana en la arena! Conserva esa pista para después del duelo.')];
   return [line('narrator',e.after),choice('El equipo prepara su informe. ¿Qué comunica?',e.post),line('hero','Guardemos la pista en el mapa. La próxima pregunta será diferente.'),line('narrator',stage===3?'El emblema de esta expedición queda marcado. El equipo se reúne para continuar el viaje.':`La puerta se abre: ${stage+1} de cuatro encuentros superados. Otra silueta espera en la siguiente viñeta.`)];
  }
 };
})();
