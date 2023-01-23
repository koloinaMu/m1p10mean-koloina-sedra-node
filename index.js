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
	  dbo.collection("DepotVoiture").aggregate(
		 [ 
		 	{
				$unwind: "$paiements"
			},
			{
			    $unwind: "$paiements.datePaiement"
			},
			{
			    $unwind: "$paiements.montant"
			},		 	
		 	{ 
		 		$group : {
		 		 _id :{ $dateToString: {date: "$paiements.datePaiement", format: "%Y-%m"}},
		 		 count: { $sum: "$paiements.montant" }
		 		}
		 	},
		 	{		 		
		 		$sort:{ _id:1 } 
		 	}
		 ] 
		 ).toArray(function (err,ress) {
			db.close();
			const resultt = ress.find(({ _id }) => _id === '2023-01-23');
			var result=ress;
			var day = new Date((new Date().getFullYear()-1)+'-'+
				convertDizaine(new Date().getMonth()+1)+'-'+'01');
			var lastMonth = new Date();
			var nextMonth = new Date(day);
			console.log(nextMonth);
			console.log(lastMonth);
			var toutes=[];
			var i=0;
			while(nextMonth<=lastMonth){
				console.log(nextMonth);
				var dateCompare=nextMonth.getFullYear()+'-'+
					convertDizaine(nextMonth.getMonth()+1)
				var recherche=ress.find(({ _id }) => _id === dateCompare);
				if(recherche!=undefined){
					//toutes[i].count=recherche.count;
					toutes[i]={
						_id:dateCompare,
						count:recherche.count
					}
				}else{
					toutes[i]={
						_id:dateCompare,
						count:0
					}
				}
				i++;
				nextMonth.setMonth(nextMonth.getMonth() + 1);
			}
			console.log(toutes);			
			res.send(toutes);
		});
	}); 
});

function convertDizaine(chiffre) {
	if(chiffre<10) return '0'+chiffre;
	else return chiffre;
}

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
	  var depotFind={ utilisateur:depot.utilisateur, voiture:depot.voiture,dateSortie:null };
	  dbo.collection("DepotVoiture").findOne(depotFind,function (err,ressD) {
	  	//console.log(ressD);
	  	if(ressD==null){
	  		depot.dateDepot=date;
			  dbo.collection("DepotVoiture").insertOne(depot, function(err, ress) {
			    if (err) throw err;
			    var o_id = new mongo.ObjectId(ress.insertedId.toString());
			   // console.log(o_id);
			    //var query={utilisateur:  depot.utilisateur,voiture:depot.voiture};
			    var query={"utilisateur._id":o_id}; 
			    var dep={_id:o_id};
			    dbo.collection("DepotVoiture").findOne(dep,function (err,resFind) {
			    	var historique={depotVoiture:resFind,dateHistorique:date};
			    	dbo.collection("Historique").insertOne(historique,function(err,resHisto) { 
				    	db.close();
				    	res.send("insertion reussie");
				    });
			    });    
			    //res.send("Insertion reussie");
			  });
			}else{
				db.close();
				res.send("Votre voiture est au garage");
			}
	  });	  
	}); 
});

app.post('/reparations-courantes',jsonParser,function(req,res) {
	var utilisateur=req.body;
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		console.log(utilisateur);
		var query= {
			$and:[
			{utilisateur:utilisateur},
			{'dateSortie':{$exists:false}}
			]
		};
		dbo.collection("DepotVoiture").find(query).toArray(function (err,ress) {
			console.log(query);
			db.close();			
			res.send(ress);
		});
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

app.post('/paiement',jsonParser,function(req,res) {
	var paiement=req.body;
	console.log(paiement);
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var myquery = { _id: new mongo.ObjectId(paiement.id) };
	  //console.log(utilisateur._id);
	  var newvalues = { $push: {paiements:
	  	{
	  		datePaiement: new Date(),
	  		montant: paiement.montant,
	  		etat:0,
	  		couleur:'yellow'
	  	}
	   }  };
	  dbo.collection("DepotVoiture").updateMany(myquery, newvalues, function(err, ress) {
	    if (err) throw err;
	    //console.log(ress);
	    db.close();
	    res.send(ress);
	  });
	}); 
});

app.get('/factures-non-reglees',function(req,res) {
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		var query= {'factureReglee':{$exists:false}};
		dbo.collection("DepotVoiture").find(query).toArray(function (err,ress) {
			console.log(query);
			db.close();			
			res.send(ress);
		});
	})
});

app.post('/validerPaiement',jsonParser,function(req,res) {
	var paiement=req.body;
	console.log(paiement);
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mongomean");
	  var myquery = { _id: new mongo.ObjectId(paiement.id) };
	  //console.log(utilisateur._id);
	 /* var newvalues = { $set: {paiements:[
	  	{
	  		datePaiement: new Date(),
	  		montant: paiement.montant,
	  		etat:0,
	  		couleur:'yellow'
	  	}
	  ] } };*/
	  var newvalues={$pull:{"paiements":paiement.paiement}};
	  console.log(newvalues);
	    paiement.paiement.datePaiement=new Date(paiement.paiement.datePaiement);
	  dbo.collection("DepotVoiture").updateMany(myquery, newvalues, function(err, ress) {
	    if (err) throw err;
	    //console.log(ress);
	    paiement.paiement.etat=1;
	    paiement.paiement.couleur="green";
	    newvalues={$push:{"paiements":paiement.paiement}};
	    dbo.collection("DepotVoiture").updateMany(myquery,newvalues,function(err,ressPush){
	    	if (err) throw err;
		    db.close();
		    res.send(ressPush);
	    });
	  });
	}); 
});

app.post('/chiffreAffaire',jsonParser,function(req,res){
	var condition=req.body;
	console.log(condition);
	if(condition.option=='Mois'){
		MongoClient.connect(uri,function(err,db) {
			if (err) throw err;
	  		var dbo = db.db("mongomean");

			dbo.collection("DepotVoiture").aggregate(
			 [ 
			 	{
					$unwind: "$paiements"
				},
				{
				    $unwind: "$paiements.datePaiement"
				},
				{
				    $unwind: "$paiements.montant"
				},		 	
			 	{ 
			 		$group : {
			 		 _id :{ $dateToString: {date: "$paiements.datePaiement", format: "%Y-%m"}},
			 		 count: { $sum: "$paiements.montant" }
			 		}
			 	},
			 	{		 		
			 		$sort:{ _id:1 } 
			 	}
			 ] 
			 ).toArray(function (err,ress) {
				db.close();
				var day = new Date((new Date().getFullYear()-1)+'-'+
					convertDizaine(new Date().getMonth()+1)+'-'+'01');
				var lastMonth = new Date();
				var nextMonth = new Date(day);
				var toutesMois=[];
				var i=0;
				while(nextMonth<=lastMonth){
					console.log(nextMonth);
					var dateCompare=nextMonth.getFullYear()+'-'+
						convertDizaine(nextMonth.getMonth()+1)
					var recherche=ress.find(({ _id }) => _id === dateCompare);
					if(recherche!=undefined){
						//toutes[i].count=recherche.count;
						toutesMois[i]={
							_id:dateCompare,
							count:recherche.count
						}
					}else{
						toutesMois[i]={
							_id:dateCompare,
							count:0
						}
					}
					i++;
					nextMonth.setMonth(nextMonth.getMonth() + 1);
				}
				console.log(toutesMois);			
				res.send(toutesMois);
			});
		})
	} else{
		MongoClient.connect(uri, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("mongomean");
		  //console.log(utilisateur._id);
		  dbo.collection("DepotVoiture").aggregate(
			 [ 
			 	{
					$unwind: "$paiements"
				},
				{
				    $unwind: "$paiements.datePaiement"
				},
				{
				    $unwind: "$paiements.montant"
				},		 	
			 	{ 
			 		$group : {
			 		 _id :{ $dateToString: {date: "$paiements.datePaiement", format: "%Y-%m-%d"}},
			 		 count: { $sum: "$paiements.montant" }
			 		}
			 	},
			 	{		 		
			 		$sort:{ _id:1 } 
			 	}
			 ] 
			 ).toArray(function (err,ress) {
				db.close();
				var result=ress;
				var day = new Date('2023-01-01');
				var lastDay = new Date('2023-01-31');
				var nextDay = new Date(day);
				var toutes=[];
				var i=0;
				while(nextDay<=lastDay){
					var dateCompare=nextDay.getFullYear()+'-'+
						convertDizaine(nextDay.getMonth()+1)+'-'+
						convertDizaine(nextDay.getDate());
					var recherche=ress.find(({ _id }) => _id === dateCompare);
					if(recherche!=undefined){
						toutes[i]={
							_id:dateCompare,
							count:recherche.count
						}
					}else{
						toutes[i]={
							_id:dateCompare,
							count:0
						}
					}
					i++;
					nextDay.setDate(nextDay.getDate() + 1);
				}
				res.send(toutes);
			});
		});
	}
});

app.get('/tmpsReparationsMoyens',function(req,res){
	MongoClient.connect(uri,function (err,db) {
		if(err) throw err;
		var dbo=db.db("mongomean");
		var query= [ 
		 	{
				$unwind: "$dateDepot"
			},
			{
			    $unwind: "$dateSortie"
			},		 	
		 	{ 
		 		$group : {
		 		 _id :{ $dateToString: {date: "$dateSortie", format: "%Y-%m"}},
		 		 averageTime:
                    {
                       $avg:
                          {
                             $dateDiff:
                                {
                                    startDate: "$dateDepot",
                                    endDate: "$dateSortie",
                                    unit: "day"
                                }
                           }
                    }
		 		}
		 	},
		 	{		 		
		 		$sort:{ _id:1 } 
		 	}
		 ] ;
		dbo.collection("DepotVoiture").aggregate(query).toArray(function (err,ress) {
			db.close();		
			var day = new Date((new Date().getFullYear()-1)+'-'+
				convertDizaine(new Date().getMonth()+1)+'-'+'01');
			var lastMonth = new Date();
			var nextMonth = new Date(day);
			var toutesMois=[];
			var i=0;
			while(nextMonth<=lastMonth){
				//console.log(nextMonth);
				var dateCompare=nextMonth.getFullYear()+'-'+
					convertDizaine(nextMonth.getMonth()+1)
				var recherche=ress.find(({ _id }) => _id === dateCompare);
				if(recherche!=undefined){
					//toutes[i].count=recherche.count;
					toutesMois[i]={
						_id:dateCompare,
						count:recherche.averageTime
					}
				}else{
					toutesMois[i]={
						_id:dateCompare,
						count:0
					}
				}
				i++;
				nextMonth.setMonth(nextMonth.getMonth() + 1);
			}
			res.send(toutesMois);
		});
	})
});

app.listen(3000,function () {
	console.log("start app");
});
