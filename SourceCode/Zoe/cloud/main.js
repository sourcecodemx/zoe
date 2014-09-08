var Image = require('parse-image');

var Mandrill = require('mandrill');
Mandrill.initialize('mxhWmtMyRCF56l7Ax6ksSA');

Parse.Cloud.afterSave('File', function(request, response){
	var f = request.object;
	if(!f.get('image')){
		response.error('File must have an image object.');
		return;
	}

	//Looks very messy but it is just a long data buffer
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
	if (request.object.existed()) {
		return;
	}

	var user = request.object;
	var email = user.get('email');

	if(!email){
		response.error("Uh oh, something went wrong");
	}else{
		Mandrill.sendTemplate({
			message: {
				subject: "Registro Zoe Water Movil",
				from_email: 'app@zoewater.mx',
				from_name: 'Zoe Water Movil',
				to: [
					{
						email: email,
						name: user.get('full_name')
					}
				]
			},
			template_name: 'zoewelcome',
			template_content: [
				{
					"name": user.get('username')
				}
			],
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
	var p = request.params;

	if(!p.phone || !p.email || !p.name){
		response.error("Uh oh, something went wrong");
	}else{
		var text = ['<p>Nombre: ' + p.name, 'Email: ' + p.email, 'Telefono: ' + p.phone + '</p>'];

		Parse.Cloud.httpRequest({
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: 'https://mandrillapp.com/api/1.0/messages/send.json',
			body: {
				key: "mxhWmtMyRCF56l7Ax6ksSA",
				message: {
				  html: text.join('<br />'),
				  subject: "Solicito Informacion (via app)",
				  from_email: "app@zoewater.com.mx",
				  from_name: "Zoe Water Movil",
				  to: [
				    {
				       email: "jaime.tanori@gmail.com",
				       name: "Jaime Tanori"
				    }
				  ]
				}
			},
			success: function(httpResponse) {
				response.success('Mensaje enviado');
				console.log(httpResponse);
			},
			error: function(httpResponse) {
				response.error('No hemos podido enviar su mensaje');
				console.error(httpResponse);
			}
		});
	}
	
});