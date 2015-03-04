var Image = require('parse-image');
 
var Mandrill = require('mandrill');
var _ = require('underscore');

Mandrill.initialize('mxhWmtMyRCF56l7Ax6ksSA');
 
Parse.Cloud.afterSave('File', function(request, response){
    var f = request.object;
    if(!f.get('image')){
        response.error('File must have an image object.');
        return;
    }
    //Create recipient image
    var cropped = new Image();
 
    //Looks very messy but it is just a long data buffer
    Parse.Cloud.httpRequest({
        url: f.get('image').url()
    }).then(function(response){
        return cropped.setData(response.buffer);
    }).then(function(image){
        console.log("Image is " + image.width() + "x" + image.height() + ".");
        var w = image.width();
        var h = image.height();
        var defaults = {width: 500, height: 500};
 
        if(w >= 500 && h <= 500){
            return image.crop({width: h, height: h});
        }else if( h>= 500 && w <= 500){
            return image.crop({width: w, height: w});
        }else if(w > 500 && h > 500){
            return image.crop(defaults);
        }else{
            return image;
        }
    }).then(function(image){
        console.log("Image is cropped " + image.width() + "x" + image.height() + ".");
        //Save croped file
        return image.data();
    }).then(function(buffer){
        return (new Parse.File('cropped.jpg', {base64: buffer.toString('base64')})).save();
    }).then(function(c){
        f.set('cropped', c);
 
        return f.save();
    }).then(function(){
        return cropped;
    }).then(function(image){
        return image.scale({ width: 100, height: 100 });
    }).then(function(image){
        return image.data();
    }).then(function(buffer){
        return (new Parse.File('thumbnail.jpg', {base64: buffer.toString('base64')})).save();
    }).then(function(resized){
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
                       email: "clubpremier@zoewater.mx",
                       name: "Zoe Water Movil"
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

Parse.Cloud.job('mergePOS', function(request, status) {
    var Pos = Parse.Object.extend('POS2');
    var addAll = function(pos){
        var list = [];
        _.each(pos, function(p){
            if(p.lat && p.lng){
                var point = new Parse.GeoPoint({latitude: parseFloat(p.lat, 10), longitude: parseFloat(p.lng, 10)});
                var posObject = new Pos();

                posObject.set(p);
                posObject.set('location', point);

                list.push(posObject);
            }else{
                console.log('Skipping object due to malformed position');
                console.log(p);
            }
        });

        Parse.Cloud.useMasterKey();
        Parse.Object
            .saveAll(list)
            .then(function(){
                console.log('All objects where saved');
                console.log('Total POS saved: ' + list.length);
                status.success('Successs');
            })
            .fail(function(e){
                console.log('An error has occurred while saving POS objects');
                console.log(e);
                status.error('Could not complete mergePOS Background Job Save');
            });
        
    };

    Parse.Cloud.httpRequest({
        url: "http://zoewater.com.mx/sellers-distros.php",
        success: function(httpResponse){
            var pos = JSON.parse(httpResponse.text);
            var POS = new Parse.Query(Pos);

            POS
                .limit(1000)
                .count()
                .then(function(count){
                    if(count > 0){
                        POS
                            .find()
                            .then(function(results){
                                if(results.length){
                                    Parse.Object
                                        .destroyAll(results)
                                        .then(function(){
                                            addAll(pos);
                                        })
                                        .fail(function(e){
                                            console.log('An error has ocurred while destroying POS objects.');
                                            console.log(e);
                                            status.error('Could not complete mergePOS Background Job');
                                        });
                                }else{
                                    addAll(pos);
                                }
                            })
                            .fail(function(e){
                                console.log('An error has ocurred while destroying POS objects.');
                                console.log(e);
                                status.error('Could not complete mergePOS Background Job');
                            });
                    }else{
                        addAll(pos);
                    }
                })
                .fail(function(e){
                    console.log('An error has ocurred removing all POS objects');
                    console.log(e);
                    status.error('Could not complete mergePOS Background Job');
                });
        },
        error: function(e){
            status.error('Could not complete mergePOS Background Job: ' + e.status);
        }
    });
});