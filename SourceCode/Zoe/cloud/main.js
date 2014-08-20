var Image = require('parse-image');

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