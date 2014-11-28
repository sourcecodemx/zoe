define(["jade"],function(jade){

return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div id=\"offline\" class=\"offline offline-ui\"><div class=\"offline-ui-content\"></div><div class=\"offline-ui-retry\"></div></div><div class=\"scroll-content\"><div class=\"page-content\"><div class=\"padding\"><p>El nombre Zoé viene del griego “llena de vida”. Zoé Water busca conquistar a los  consumidores ávidos de productos que sean benéficos para la salud física y mental, usando la tecnología de purificación más avanzada del momento.</p><p>El valor agregado que tiene, es precisamente el agua alcalina, reconocida a nivel mundial por la capacidad de disminuir la acidez, eliminar los desechos naturales del cuerpo y por contribuir a una mejor oxigenación de la sangre en el cuerpo humano.</p><img src=\"images/about_ph.png\" class=\"full-image\"/><p>Zoé Water, con su pH de 8.5 hidrata de una forma eficaz, manteniendo tu cuerpo en equilibrio. </p><img src=\"images/about_bottles.jpg\" class=\"full-image rounded\"/><br/><br/><br/><br/></div></div></div>");;return buf.join("");
};

});
