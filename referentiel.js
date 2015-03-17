var mongoose = require('mongoose');
var db = require('./libs/db.js');
var Poste = require('./models/poste');
var fs = require('fs');
var config = require('./config')["development"];

db.connect(config.mongoUrl);

var content = fs.readFileSync(__dirname+'/refs/ciats.csv','UTF-8');
    var tmp = content.split('\n'); var tab = [];

    var tmp2, dpt, label;
    
    for(var i=0; i<tmp.length; i++){
        if(tmp[i] !="" && tmp[i] != "\r\n"){
            tmp2 = tmp[i].split(";");
            var ville = {};
           

            
            var departement = tmp2[6].replace('"', "");
            departement = departement.replace('"',"");
            if (departement.length == 5)
                departement = departement.substring(0, 2);
            if (departement.length == 4)
                departement = '0'+departement.substring(0, 1);
            

            var splitlabel = tmp2[7].split(" ")[0];
            if (departement == dpt && splitlabel == label && splitlabel != '"Paris'){
                    continue;  
            } else {
                console.log(tmp2[7]);
                for(j = 0; j < tmp2.length; j++){   
                        switch(j){
                            case 6:
                           
                            ville.codePostal = tmp2[j].replace('"', "");
                            ville.codePostal = ville.codePostal.replace('"',"");
                            if (ville.codePostal.length == 5)
                                ville.departement = ville.codePostal.substring(0, 2);
                            if (ville.codePostal.length == 4)
                                ville.departement = '0'+ville.codePostal.substring(0, 1);
                                dpt = ville.departement;
                            break;
                            case 7:
                            label = tmp2[j].split(" ")[0];
                            ville.label = tmp2[j].replace('"', "");
                            ville.label = ville.label.replace('"',"");
                            ville.label = ville.label.replace('\\',"");
                            break;
                            case 8:
                            ville.geocodage_espg = tmp2[j].replace('"', '');
                            ville.geocodage_espg = ville.geocodage_espg.replace('"','');
                            break;
                            case 9:
                            ville.geocodage_x = tmp2[j].replace('"', '');
                            ville.geocodage_x = ville.geocodage_x.replace('"','');
                            break;
                            case 10:
                            ville.geocodage_y = tmp2[j].replace('"', '');
                            ville.geocodage_y = ville.geocodage_y.replace('"','');
                            break;
                            case 11:
                            ville.geocodage_x_GPS = tmp2[j].replace('"', '');
                            ville.geocodage_x_GPS = ville.geocodage_x_GPS.replace('"','');
                            break;
                            case 12:
                            ville.geocodage_y_GPS = tmp2[j].replace('"', '');
                            ville.geocodage_y_GPS = ville.geocodage_y_GPS.replace('"','');
                            break;
                        }
                }
            }
        }
            tab.push(ville);
    }


    for(var i=0;i<tab.length;i++){
 
        var poste = new Poste(tab[i]);
        poste.save(function(error, data){
            if(error)
                console.error(error);
            
        });
    }