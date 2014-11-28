define(["jade"],function(jade){

return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"scroll-content\"><div class=\"page-content animated\"><form class=\"row\"><br/><div class=\"col\"><div class=\"padding\"><div class=\"list\"><label class=\"item item-input\"><input id=\"name\" type=\"text\" placeholder=\"Nombre completo\"/></label></div><div class=\"list\"><label class=\"item item-input\"><input id=\"email\" type=\"email\" placeholder=\"Correo electronico\"/></label></div><div class=\"list\"><label class=\"item item-input\"><input id=\"phone\" type=\"tel\" placeholder=\"Telefono\"/></label></div><div class=\"text-center\"><button type=\"submit\" class=\"button button-outline button-light\">Enviar</button></div></div></div></form></div></div>");;return buf.join("");
};

});
