var express=require("express");
var app=express();
//var url=require("url");
var cors=require('cors');
var Utilisateur=require('./objets/Utilisateur');
var reparationPrix=require('./objets/ReparationPrix');
app.use(cors());
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var uri = "mongodb://127.0.0.1:27017/";
//const password = ("Kokoloina.2422");
/*const uri =
"mongodb+srv://sedra:C6fyXVofJ4sunFqw@cluster0.a5zbvu8.mongodb.net/?retryWrites=true&w=majority";*/
var md5=require("md5");

 
// create application/json parser
var jsonParser = bodyParser.json();
var MongoClient=mongo.MongoClient;
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/',function (req,res) {
	//console.log(uri);
	MongoClient.connect(uri, function(err, db) {
		console.log("inside connect");
	  if (err) {
	  	console.log(err);
	  	throw err;
	  }
	  var dbo = db.db("mongomean");
	 // console.log(table);
	   dbo.collection("SuperAdmin").find({}).toArray(  function(err, ress) {
	    if (err){
	    	res.send(null);
	    } 
	    db.close();
	    res.send((ress));
	  });
	}); 
	//res.send("let's see");
});

app.post('/inscription',jsonParser,function (req,res) {
	var utilisateur=req.body;
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  utilisateur.mdp=md5(utilisateur.mdp);
	  utilisateur.etat=0;
	  dbo.collection("Utilisateur").insertOne(utilisateur, function(err, ress) {
	    if (err) throw err;
	    var o_id = new mongo.ObjectId(ress.insertedId.toString());
	    var query={mail:  utilisateur.mail,mdp:utilisateur.mdp};
	    dbo.collection("Utilisateur").findOne(query,function (err,resFind) {	    	
		    if (err){
		    	res.send(null);
		    } 
	    	res.send(JSON.stringify(resFind));
	    });	  
	    db.close();
	    reponse=utilisateur;
	  });
	}); 
});

app.post('/connexion',jsonParser, function (req,res) {
	var utilisateur=req.body;
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var query={mail:utilisateur.mail,mdp:md5(utilisateur.mdp)};
	  var table="Utilisateur";
	  if(utilisateur.type==1){
	  	table="SuperAdmin";
	  }
	 // console.log(table);
	  reponse= dbo.collection(table).findOne(query,  function(err, ress) {
	    if (err){
	    	res.send(null);
	    } 
	    console.log(ress);
	    db.close();
	    res.send(JSON.stringify(ress));
	  });
	}); 
});

app.post('/update',jsonParser, function (req,res) {
	var utilisateur=req.body;
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var myquery = { _id: new mongo.ObjectId(utilisateur._id) };
	  //console.log(utilisateur._id);
	  var newvalues = { $set: {type: utilisateur.type, etat:1 } };
	  dbo.collection("Utilisateur").updateOne(myquery, newvalues, function(err, ress) {
	    if (err) throw err;
	   // console.log(ress);
	    db.close();
	    res.send("okey");
	  });
	}); 
});


app.get('/utilisateurs',function(req,res) {
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		dbo.collection("Utilisateur").find({}).toArray(function (err,ress) {
			db.close();
			res.send(ress);
		})
	})
});

app.post('/depot-voiture',jsonParser,function (req,res) {
	var depot=req.body;
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var date=new Date();
	  depot.dateDepot=date;
	  depot.dateSortie=null;
	  depot.dateReception= null;
	  dbo.collection("DepotVoiture").insertOne(depot, function(err, ress) {
	    if (err) throw err;
	    var o_id = new mongo.ObjectId(ress.insertedId.toString());
	    var query={utilisateur:  depot.utilisateur,voiture:depot.voiture,dateDepot:date};
	    dbo.collection("DepotVoiture").findOne(query,function (err,resFind) {	    	
		    if (err){
		    	res.send(null);
		    } 
	    	res.send(JSON.stringify(resFind));
	    });	  
	    db.close();
	  });
	}); 
});

app.post('/reparations-courantes',jsonParser,function(req,res) {
	var utilisateur=req.body;
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		var query={ utilisateur:utilisateur, dateSortie:null };
		dbo.collection("DepotVoiture").find(query).toArray(function (err,ress) {
			db.close();
			res.send(ress);
		})
	})
});

// atelier----------------------------------------------------------------------

app.post('/receptionner_vehicule/:id',jsonParser, function (req,res) {
	var depot=req.body;
	//console.log('id '+ depot._id);
	var id=req.params.id;
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var myquery = { _id: new mongo.ObjectId(id) };
	  //console.log(utilisateur._id);
	  var date= new Date(); 
	  depot.dateReception = date;

	  var newvalues = { $set: { dateReception : date } };
	  dbo.collection("DepotVoiture").updateOne(myquery, newvalues, function(err, ress) {
	    if (err) throw err;
	   // console.log(ress);
	    db.close();
	    res.send(ress);
	  });
	}); 
});

app.get('/les_depots',function(req,res) {
	//var utilisateur=req.body;
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		var query={dateReception: null};
		dbo.collection("DepotVoiture").find(query).toArray(function (err,ress) {
			db.close();
			res.send(ress);
		})
	})
});

app.get('/dans_atelier',function(req,res) {
	//var utilisateur=req.body;
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		var query={ dateReception: {$ne : null } , dateSortie: null  };
		dbo.collection("DepotVoiture").find(query).toArray(function (err,ress) {
			db.close();
			res.send(ress);
		})
	})
});

app.get('/les_pieces',function(req,res) {
	//var utilisateur=req.body;
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		var query={ };
		dbo.collection("Piece").find(query).toArray(function (err,ress) {
			db.close();
			res.send(ress);
		})
	})
});

app.post('/modifier_avancement/:avancement/:idReparation/:idDepot',jsonParser, function (req,res) {
	var depot=req.body;
	//console.log('id '+ depot._id);
	var idDepot=req.params.idDepot;
	var avancement=Number(req.params.avancement);
	var idReparation=req.params.idReparation;
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var myquery = { _id: new mongo.ObjectId(idDepot), 'reparation._id': idReparation.toString()};
	  //console.log(utilisateur._id);
	  
	  //var date= new Date(); 
	  //depot.dateReception = date;

	  var newvalues = { $set: { 'reparation.$.avancement': avancement } };
	  dbo.collection("DepotVoiture").updateOne(myquery, newvalues, function(err, ress) {
	    if (err) throw err;
	   // console.log(ress);
	    db.close();
	    res.send(ress);
	  });
	}); 
});


app.post('/ajouter_pieces/:idPiece/:nom/:prix/:idDepot',jsonParser, function (req,res) {
	var depot=req.body;
	//console.log('id '+ depot._id);
	var idDepot=req.params.idDepot;
	var idPiece=req.params.idPiece;
	var nom=req.params.nom;
	var prix=req.params.prix;
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var myquery = { _id: new mongo.ObjectId(idDepot) };
	

	  var newvalues = { $push: {piece: {'_id': idPiece, 'nom': nom , 'prix': prix  } } };
	  dbo.collection("DepotVoiture").updateOne(myquery, newvalues, function(err, ress) {
	    if (err) throw err;
	   // console.log(ress);
	    db.close();
	    res.send(ress);
	  });
	}); 
});




//-------------------------------------------------
app.post('/ajouterreparationchoisissez/:idDepot/:idReparation/:nom/:prix',jsonParser, function (req,res) {
	var depot=req.body;
	//console.log('id '+ depot._id);
	var idDepot=req.params.idDepot;
	var idReparation=req.params.idReparation;
	var nom=req.params.nom;
	var prix=req.params.prix;
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var myquery = { _id: new mongo.ObjectId(idDepot) };
	  //console.log(utilisateur._id);
	  
	  var date= new Date(); 
	  depot.dateReception = date;

	//reparation= reparationPrix.getReparationPrix_FromId(idReparation);

	  var newvalues = { $push: {reparation: {'_id': idReparation, 'nom': nom , 'prix': prix , 'avancement': 0 } } };
	  dbo.collection("DepotVoiture").updateOne(myquery, newvalues, function(err, ress) {
	    if (err) throw err;
	   // console.log(ress);
	    db.close();
	    res.send(ress);
	  });
	}); 
});




app.get('/reparation_prix',function(req,res) {
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		dbo.collection("reparationPrix").find({}).toArray(function (err,ress) {
			db.close();
			res.send(ress);
		})
	})
});

app.post('/recuperer_voiture/:id',jsonParser, function (req,res) {
	var depot=req.body;
	//console.log('id '+ depot._id);
	var id=req.params.id;
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var myquery = { _id: new mongo.ObjectId(id) };
	  //console.log(utilisateur._id);
	  var date= new Date(); 
	  depot.dateSortie = date;

	  var newvalues = { $set: { dateSortie : date } };
	  dbo.collection("DepotVoiture").updateOne(myquery, newvalues, function(err, ress) {
	    if (err) throw err;
	   // console.log(ress);
	    db.close();
	    res.send(ress);
	  });
	}); 
});



app.post('/facturation',jsonParser,function(req,res) {
	var mail=req.body;
	//id= utilisateur._id;
	//console.log(id);
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		var query={'utilisateur.mail': mail};
		//{ Qty: { $eq: 100 }}
		dbo.collection("facture").find(query).toArray(function (err,ress) {
			
			res.send(ress);
		})
	})
});


app.post('/recherche',jsonParser,function(req,res) {
	var aPropos=req.body;
	var voiture={};
	var requete='';	
	if(aPropos.couleur=="Couleur"){
		aPropos.couleur="";		
	}
	var reqq={
		$and: [
		    { 'voiture.immatriculation': { $regex: aPropos.immatriculation, $options: 'i' } },
		    { 'voiture.couleur': { $regex: aPropos.couleur, $options: 'i' } }
		]
	};
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		//console.log(reqq);
		dbo.collection("DepotVoiture").find(reqq).toArray(function (err,ress) {
			db.close();
			res.send(ress);
		})
	})
});

app.post('/sortieVoiture',jsonParser, function (req,res) {
	var depot=req.body;
	//console.log(depot);
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var myquery = { _id: new mongo.ObjectId(depot._id) };
	  //console.log(utilisateur._id);
	  var newvalues = { $set: {dateSortie: new Date() } };
	  dbo.collection("DepotVoiture").updateOne(myquery, newvalues, function(err, ress) {
	    if (err) throw err;
	    //console.log(ress);
	    db.close();
	    res.send(ress);
	  });
	}); 
});

app.listen(3000,function () {
	console.log("start app");
});
