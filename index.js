var express=require("express");
var app=express();
var url=require("url");
var cors=require('cors');
var Utilisateur=require('./objets/Utilisateur');
app.use(cors());
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var url = "mongodb://127.0.0.1:27017/";
const password = ("Kokoloina.2422");
const uri =
"mongodb+srv://Koloina:Kokoloina.2422@cluster0.6vrux.mongodb.net/?retryWrites=true&w=majority";
var md5=require("md5");
var nodemailer = require('nodemailer');


 
// create application/json parser
var jsonParser = bodyParser.json();
var MongoClient=mongo.MongoClient;
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/',function (req,res) {
	
	var depot=req.body;
	//console.log(depot);
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  //console.log(utilisateur._id);
	  var newvalues = { $set: {dateSortie: new Date() } };
	  dbo.collection("DepotVoiture").aggregate(
		 [ 
		 	{ 
		 		$group : {
		 		 _id :{ $dateToString: {date: "$dateDepot", format: "%Y-%m-%d"}},
		 		 count: { $count:{ } }
		 		} 
		 	}
		 ] 
		 ).toArray(function (err,ress) {
		 	if(err) res.send(err);
			db.close();
			console.log(ress);
			res.send(ress);
		});
	}); 
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
	  var query={mail:utilisateur.mail,mdp:md5(utilisateur.mdp),etat:1};
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
	    /* envoi mail de validation */
	    var transporter = nodemailer.createTransport({
		  service: 'gmail',
		  auth: {
		    user: 'rabenjamu@gmail.com',
		    pass: 'seykyfejxxueedtv'
		  }
		});

		var mailOptions = {
		  from: 'rabenjamu@gmail.com',
		  to: utilisateur.mail,
		  subject: 'Validation de votre compte',
		  text: 'Votre inscription a bien été validée, vous pouvez désormais vous connecter'
		};

		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		    res.send(error);
		  } else {
		    console.log('Email sent: ' + info.response);
		  	res.send('Email sent: ' + info.response);
		  }
		}); 
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
		var query={ utilisateur:utilisateur, depotSortie:null};
		dbo.collection("DepotVoiture").find(query).toArray(function (err,ress) {
			db.close();
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

app.get('/depotVoitureJour', function (req,res) {
	var depot=req.body;
	//console.log(depot);
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  //console.log(utilisateur._id);
	  var newvalues = { $set: {dateSortie: new Date() } };
	  dbo.collection("DepotVoiture").aggregate(
		 [ 
		 	{ 
		 		$group : {
		 		 _id :{ $dateToString: {date: "$dateDepot", format: "%Y-%m-%d"}},
		 		 count: { $count:{ } }
		 		}
		 	},
		 	{		 		
		 		$sort:{ count:1 } 
		 	}
		 ] 
		 ).toArray(function (err,ress) {
			db.close();
			console.log(ress);
			res.send(ress);
		});
	}); 
});

app.listen(3000,function () {
	console.log("start app");
});
