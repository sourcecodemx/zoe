define(["jade"],function(jade){

return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div id=\"offline\" class=\"offline offline-ui\"><div class=\"offline-ui-content\"></div><div class=\"offline-ui-retry\"></div></div><div class=\"scroll-content has-tabs\"><div class=\"page-content\"><div id=\"pics\" class=\"clearfix\"></div></div><div class=\"ion-infinite-scroll\"><div class=\"scroll-infinite\"><div class=\"scroll-infinite-content\"><div class=\"icon ion-loading-d icon-refreshing\"></div><div class=\"h5\">Cargando...</div></div></div></div></div><div id=\"tabs\" class=\"tabs tabs-dark tabs-icon-top\"><a id=\"take\" class=\"tab-item\"><i class=\"icon ion-ios7-camera-outline\"></i>Tomar Foto</a><a id=\"grab\" class=\"tab-item\"><i class=\"icon ion-ios7-photos-outline\"></i>Subir Foto</a></div>");;return buf.join("");
};

});
