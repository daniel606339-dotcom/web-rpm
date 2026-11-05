-- Santa Teresa de Jesús: Escolar Básica 1° a 6° grado (lista 2026). Generado el 04/11/2026.
-- Libros (librería AMPAC), uniformes y juegos van como "fuera". Textos redactados por RPM.

insert into web.utiles_listas (colegio_id,anio,grado,grado_slug,grado_orden,fuente_url,publicada)
select c.id,2026,v.g,v.gs,v.o,'https://www.stj.edu.py/wp-content/uploads/2025/12/Lista-de-Utiles-EEB-STJ-2026.pdf',true from (values
('1er grado','1er-grado',4),('2do grado','2do-grado',5),('3er grado','3er-grado',6),
('4to grado','4to-grado',7),('5to grado','5to-grado',8),('6to grado','6to-grado',9)
) v(g,gs,o) join web.utiles_colegios c on c.slug='colegio-santa-teresa-de-jesus';

with n(k,t,cod,alt,co,nota) as (values
('lapiz_papel','Lápiz de papel','LAPCONPUR',null,'igual',null),
('goma_blanca','Borrador blanco','1008420',null,'igual',null),
('sacapuntas_dep','Sacapuntas con depósito','1008471',null,'igual',null),
('tijera','Tijera punta redonda','9153745',null,'igual',null),
('regla15','Regla 15 cm','0000000000500',null,'igual',null),
('regla20','Regla 20 cm','PR91030',null,'equivalente','Ofrecemos regla de 30 cm'),
('regla30','Regla 30 cm','PR91030',null,'igual',null),
('regla_geom','Regla con figuras geométricas','7896640411435',null,'equivalente','Set de 4 reglas geométricas'),
('compas','Compás','COMPFABER740',null,'igual',null),
('transportador','Transportador','3154141463600',null,'igual',null),
('colores12','Lápices de colores x12','7891360638681','7891360577546','igual',null),
('lapiz_2b','Lápiz 2B','7891360548300',null,'equivalente',null),
('cartuchera','Cartuchera con cierre','0744.3',null,'igual',null),
('abaco','Ábaco pequeño','0000000000279',null,'equivalente','Ábaco de cuentas de colores'),
('crayones_gruesos12','Crayolas cortas y gruesas x12','HT141112EX','8851934710082','igual',null),
('tempera6','Témperas x6 colores','7754111164368',null,'igual',null),
('pincel12','Pincel de cerda chato n° 12','7891395012142',null,'igual',null),
('pincel8','Pincel de cerda redondo n° 8','7891395012128',null,'igual',null),
('vaso','Vasito plástico','0000000000627',null,'igual',null),
('adh_barra','Plasticola en barra','4893055800017',null,'equivalente','Ofrecemos barra de 9 g'),
('adh_liquido','Plasticola blanca','0000000000469',null,'equivalente','Ofrecemos 40 g'),
('isocola','Isocola (cola transparente)','40267227',null,'equivalente','Ofrecemos cola transparente Kofa 40 g'),
('plastilina_soft','Masa / plastilina Soft Acrilex (pote)','7891153073217',null,'igual',null),
('marc_gruesos12','Marcadores gruesos x12','MARESCJUMCOM12COL','7891360311171','equivalente','Opción B: Faber Castell escolar x12'),
('marc_superfino','Marcador fino permanente negro','7896979501227',null,'equivalente',null),
('marc_perm_negro','Marcador permanente negro punta gruesa','ESPDELGRAN',null,'igual',null),
('marc_pizarra','Marcador para pizarra','1008650',null,'igual',null),
('resaltador','Resaltador','HT805BLUE',null,'igual',null),
('corrector','Corrector en cinta','1008478',null,'igual',null),
('bic_negro','Bolígrafo negro','R11481',null,'igual',null),
('boli_borrable','Bolígrafo azul borrable','RH3009',null,'equivalente','Blíster de 3 colores'),
('boli_colores','Bolígrafos de colores (paquete)','RH3009',null,'equivalente','Blíster de 3 colores borrables'),
('cuad_dr100','Cuaderno 100 h doble raya tapa dura',null,null,'sin_catalogo',null),
('cuad_dr50','Cuaderno 50 h doble raya tapa dura',null,null,'sin_catalogo',null),
('cuad_100_cuad','Cuaderno 100 h cuadriculado tapa dura',null,null,'sin_catalogo',null),
('cuad_univ100_dr','Cuaderno universitario 100 h doble raya',null,null,'sin_catalogo',null),
('cuad_univ150_dr','Cuaderno universitario 150 h doble raya',null,null,'sin_catalogo',null),
('cuad_univ150_1r','Cuaderno universitario 150 h 1 raya',null,null,'sin_catalogo',null),
('cuad_univ50_dr','Cuaderno universitario 50 h doble raya',null,null,'sin_catalogo',null),
('cuad_univ100_cuad','Cuaderno universitario 100 h cuadriculado','HALCONCUADR96NEGR',null,'equivalente','Ofrecemos 96 hojas en lugar de 100'),
('cuad_univ100_1r','Cuaderno universitario 100 h 1 raya','HALCON96NEGRO',null,'equivalente','Ofrecemos 96 hojas en lugar de 100'),
('cuad_univ50_1r','Cuaderno universitario 50 h 1 raya','HALCONEGR',null,'equivalente','Ofrecemos 48 hojas en lugar de 50'),
('hojas_oficio100','Hojas blancas oficio x100','0000000000650',null,'igual',null),
('hojas_oficio150','Hojas blancas oficio x150','510500',null,'igual',null),
('hojas_dr_ofi50','Hojas doble raya oficio x50','R11523',null,'igual',null),
('hojas_cuad_ofi50','Hojas cuadriculadas oficio x50','0000000000651',null,'igual',null),
('carpeta_archiv','Carpeta archivadora oficio','R11744',null,'igual','Consultanos los colores'),
('biblio_fino','Bibliorato lomo fino rojo','113327','0000000000783','igual',null),
('folio','Folio oficio (unidad)','BORALACEL',null,'igual',null),
('cartulina_ofi_paq','Cartulinas de colores oficio (paquete)','7798039089525',null,'igual','Paquete de 10 colores'),
('cartulina_grande','Cartulina grande de color (plancha)','0000000000980',null,'equivalente','Consultanos los colores'),
('goma_eva_grande','Goma eva grande (40x50)','R11278',null,'equivalente','Consultanos los colores'),
('goma_eva_glitter','Goma eva con purpurina','R11642',null,'equivalente','Consultanos los colores'),
('sulfito','Papel sulfito','COLGIM60100',null,'igual',null),
('papel_glase','Papel glasé (paquete)','7794698000481',null,'equivalente',null),
('papel_chifon','Papel chifón / seda','117127',null,'equivalente','Paquete x10, consultanos el color'),
('cinta_embalaje','Cinta de embalaje','0000000000170',null,'igual',null),
('cinta_transp','Cinta ancha transparente','0000000000112',null,'igual',null),
('cinta_papel','Cinta de papel','0000000000150',null,'igual',null),
('cinta_doble_faz','Cinta doble faz','CINADHADE2F1930',null,'igual',null),
('postit_peq','Notas adhesivas pequeñas (señaladores)','SY3851',null,'equivalente',null),
('notas_grandes','Notas adhesivas de colores (aprox. 10x8 cm)','NOTPEDCOMPEQ',null,'equivalente','Ofrecemos 76x76 mm'),
('sobres','Sobres para carta (paquete)','000155R',null,'igual',null),
('dicc_esp','Diccionario de la Lengua Española','3968',null,'igual',null),
('dicc_sinon','Diccionario de sinónimos y antónimos','9789686321289',null,'igual',null),
('dicc_guarani','Diccionario guaraní','DICGUAÑEE',null,'igual',null)
),
l0(gs,u,f) as (values
('1er-grado','abaco*1 cuad_dr100*2 cuad_dr50*1 hojas_oficio100*1 carpeta_archiv*2 folio*5 cuad_univ100_dr*1 crayones_gruesos12*1 adh_barra*3 tijera*1 tempera6*1 pincel12*1 pincel8*1 vaso*1 cartulina_ofi_paq*3 biblio_fino*1 plastilina_soft*2 marc_gruesos12*1 cartuchera*1 lapiz_papel*2 goma_blanca*1 sacapuntas_dep*1 regla15*1 colores12*1','Libros de texto y plan lector (librería AMPAC)|Aprestamiento y calígrafo (librería AMPAC)|Block de Artes Plásticas y libro de Música (librería AMPAC)|Pizarra acrílica con marcadores (librería del colegio)|Juego didáctico|Libro de cuento|Hoppie y toallita|Uniformes'),
('2do-grado','cuad_dr100*2 cuad_univ100_dr*1 crayones_gruesos12*1 adh_barra*4 tijera*1 tempera6*1 pincel12*1 pincel8*1 vaso*1 cartulina_ofi_paq*3 carpeta_archiv*2 hojas_oficio100*1 hojas_dr_ofi50*2 cartulina_grande*2 goma_eva_grande*2 plastilina_soft*2 sulfito*1 folio*10 cinta_embalaje*1 marc_gruesos12*1 lapiz_papel*1 goma_blanca*1 sacapuntas_dep*1 regla15*1 colores12*1 cartuchera*1','Libros de texto, calígrafo y plan lector (librería AMPAC)|Libro Aprender Jugando 2 (Aramí)|Block de Artes Plásticas y libro de Música (librería AMPAC)|Juego didáctico|Libro de cuento|Hoppie, toallita y pañuelos|Uniformes'),
('3er-grado','cuad_100_cuad*1 regla_geom*1 cuad_dr100*1 dicc_esp*1 cuad_univ100_dr*1 crayones_gruesos12*1 adh_barra*2 tijera*1 tempera6*1 pincel12*1 pincel8*1 vaso*1 cartulina_ofi_paq*3 carpeta_archiv*2 plastilina_soft*2 hojas_oficio100*1 hojas_dr_ofi50*1 folio*10 cartulina_grande*2 sulfito*1 papel_glase*2 goma_eva_grande*1 papel_chifon*1 cinta_papel*1 cinta_embalaje*1 postit_peq*2 marc_gruesos12*1 marc_superfino*2 marc_pizarra*1 marc_perm_negro*1 adh_liquido*1 isocola*1 lapiz_papel*1 goma_blanca*1 sacapuntas_dep*1 regla20*1 colores12*1 cartuchera*1','Libros de texto, calígrafo y plan lector (librería AMPAC)|Billetes didácticos|Libro Aprender Jugando 3 (Aramí)|Block de Artes Plásticas y libro de Música (librería AMPAC)|Cartulinas con diseño|Juego didáctico y libro de cuentos|Termo y toallita|Biblia|Uniformes'),
('4to-grado','cuad_univ150_dr*1 dicc_esp*1 dicc_guarani*1 cuad_univ100_cuad*1 regla_geom*1 transportador*1 regla30*1 cuad_univ50_1r*2 cuad_univ50_dr*3 crayones_gruesos12*1 adh_barra*2 tijera*1 tempera6*1 pincel12*1 pincel8*1 vaso*1 cartulina_ofi_paq*3 carpeta_archiv*3 folio*10 hojas_dr_ofi50*1 hojas_cuad_ofi50*1 hojas_oficio100*2 notas_grandes*1 goma_eva_grande*2 cartulina_grande*2 boli_colores*1 marc_gruesos12*1 cinta_papel*1 cinta_transp*1 isocola*1 marc_superfino*1 marc_perm_negro*1 sobres*1 marc_pizarra*1 lapiz_papel*1 sacapuntas_dep*1 goma_blanca*1 boli_borrable*1 colores12*1 cartuchera*1','Libros de texto y plan lector (librería AMPAC)|Libros de inglés (según el nivel)|Block de Artes Plásticas y libro de Música (librería AMPAC)|Libro de Trabajo y Tecnología|Juego didáctico|Hoppie, toallita y pañuelos|Biblia|Uniformes'),
('5to-grado','cuad_univ100_cuad*1 compas*1 regla30*1 regla_geom*1 dicc_esp*1 dicc_sinon*1 cuad_univ150_dr*1 dicc_guarani*1 cuad_univ50_dr*3 cartulina_ofi_paq*5 cartulina_grande*7 cuad_univ50_1r*2 crayones_gruesos12*1 adh_barra*2 tijera*1 tempera6*1 pincel12*1 pincel8*1 vaso*1 carpeta_archiv*2 hojas_oficio150*1 hojas_cuad_ofi50*1 hojas_dr_ofi50*1 goma_eva_grande*2 goma_eva_glitter*1 sulfito*2 folio*10 marc_superfino*1 marc_perm_negro*2 cinta_transp*1 isocola*1 cinta_doble_faz*1 cinta_papel*1 resaltador*2 lapiz_papel*1 sacapuntas_dep*1 boli_borrable*1 goma_blanca*1 colores12*1 cartuchera*1','Libros de texto y plan lector (librería AMPAC)|Libros de inglés y Health (según el nivel)|Block de Artes Plásticas y libro de Música (librería AMPAC)|Libro de Trabajo y Tecnología|Cartulinas con diseño|Libro de cuento|Juego didáctico|Hoppie y toallita|Biblia|Uniformes'),
('6to-grado','cuad_univ100_cuad*1 compas*1 transportador*1 regla_geom*1 regla30*1 cuad_univ150_1r*1 dicc_esp*1 dicc_guarani*1 cuad_univ100_1r*1 cuad_univ50_1r*1 cuad_univ50_dr*2 cartulina_ofi_paq*4 sulfito*2 crayones_gruesos12*1 adh_barra*1 tijera*1 tempera6*1 pincel12*1 pincel8*1 vaso*1 papel_glase*2 lapiz_2b*1 carpeta_archiv*3 marc_perm_negro*1 marc_superfino*1 hojas_oficio100*1 cartulina_grande*1 goma_eva_glitter*2 goma_eva_grande*2 folio*10 cinta_transp*1 cinta_doble_faz*1 isocola*1 lapiz_papel*1 bic_negro*1 goma_blanca*1 sacapuntas_dep*1 adh_liquido*1 colores12*1 corrector*1 cartuchera*1','Libros de texto y plan lector (librería AMPAC)|Libros de inglés y Health (según el nivel)|Block de Artes Plásticas y libro de Música (librería AMPAC)|Libro de Trabajo y Tecnología|Revista vieja|Mi libro de oraciones|Uniformes')
),
r as (
  select gs, o*10 as o, split_part(x,'*',1) as k, split_part(x,'*',2)::int as c, null::text as fuera
  from l0, unnest(string_to_array(u,' ')) with ordinality as t(x,o)
  union all
  select gs, 1000 + o*10, null, 1, x
  from l0, unnest(string_to_array(nullif(f,''),'|')) with ordinality as t(x,o)
)
insert into web.utiles_renglones (lista_id,orden,texto,cantidad,tipo,cod_articulo,cod_alternativa,coincidencia,nota)
select l.id, r.o, coalesce(n.t, r.fuera), r.c, case when r.fuera is null then 'util' else 'fuera' end,
       n.cod, n.alt, coalesce(n.co,'sin_catalogo'), n.nota
from r left join n on n.k=r.k
join web.utiles_colegios c on c.slug='colegio-santa-teresa-de-jesus'
join web.utiles_listas l on l.colegio_id=c.id and l.anio=2026 and l.grado_slug=r.gs;
