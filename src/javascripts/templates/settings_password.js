define(["jade"],function(jade){

return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

jade_mixins["submitButton"] = function(text){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<div class=\"text-center\"><button type=\"submit\" class=\"button button-outline button-light\">");
if ( !text)
{
buf.push("Cambiar");
}
else
{
buf.push("" + (jade.escape((jade_interp = text) == null ? '' : jade_interp)) + "");
}
buf.push("</button></div>");
};
buf.push("<div class=\"scroll-content\"><div class=\"page-content\"><form class=\"row\"><div class=\"col\"><div class=\"padding\"><div class=\"list\"><label class=\"item item-input\"><input id=\"password\" type=\"password\" placeholder=\"Contraseña\"/></label></div><div class=\"list\"><label class=\"item item-input\"><input id=\"passwordConfirmation\" type=\"password\" placeholder=\"Contraseña\"/></label></div>");
jade_mixins["submitButton"]();
buf.push("</div></div></form></div></div>");;return buf.join("");
};

});
