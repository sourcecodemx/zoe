var Image = require('parse-image');
var Mandrill = require('mandrill');

Parse.Cloud.afterSave('File', function(request, response){
	var f = request.object;
	if(!f.get('image')){
		response.error('File must have an image object.');
		return;
	}

	//Looks very messy but it is a long data buffer
	Parse.Cloud.httpRequest({
		url: f.get('image').url()
	}).then(function(response){
		return (new Image()).setData(response.buffer);
	}).then(function(image){
		return image.scale({ width: 100, height: 100 });
	}).then(function(image){
		return image.data();
	}).then(function(buffer){
		return (new Parse.File('thumbnail.jpg', {base64: buffer.toString('base64')})).save();
	}).then(function(resized){
		console.log('Thumbnail created');
		f.set('thumbnail', resized);

		return f.save();
	}).then(function(){
		console.log('Thumbnail added to the File record.');
		response.success();
	}, function(error){
		console.log('Error creating thumbnail.');
		response.error(error);
	});
});

Parse.Cloud.afterSave('_User', function(request){
	var user = request.object;
	var email = user.get('email');

	Mandrill.initialize('mxhWmtMyRCF56l7Ax6ksSA');

	if(!email){
		response.error("Uh oh, something went wrong");
	}else{
		Mandrill.sendEmail({
			message: {
				text: 'Gracias por usar nuestra aplicacion',
				subject: "Zoe Water Movil",
				from_email: 'jaime.tanori@gmail.com',
				from_name: 'Zoe Water Movil',
				to: [
					{
						email: email,
						name: user.get('full_name')
					}
				]
			},
			async: true
		},{
			success: function(httpResponse) {
				console.log(httpResponse);
				console.log("Mensaje Enviado");
			},
			error: function(httpResponse) {
				console.error(httpResponse);
				console.error("No hemos podido enviar su mensaje, por favor intente de nuevo.");
			}
		});
	}
});

Parse.Cloud.define('contact', function(request, response){
	Mandrill.initialize('mxhWmtMyRCF56l7Ax6ksSA');

	var p = request.params;

	if(!p.phone || !p.email || !p.name){
		response.error("Uh oh, something went wrong");
	}else{
		Mandrill.sendEmail({
			message: {
				text: p.phone,
				subject: "Zoe Water Premier",
				from_email: p.email,
				from_name: p.name,
				to: [
					{
						email: "jaime.tanori@gmail.com",
						name: "Jaime Tanori"
					}
				]
			},
			async: true
		},{
			success: function(httpResponse) {
				console.log(httpResponse);
				response.success("Mensaje Enviado");
			},
			error: function(httpResponse) {
				console.error(httpResponse);
				response.error("No hemos podido enviar su mensaje, por favor intente de nuevo.");
			}
		});
	}
	
});