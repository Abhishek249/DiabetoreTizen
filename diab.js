
$(document).ready(function() 
{	
		var db;
		var storeName="diab";
		var dArray=new Array();
		var preArray=new Array();
		var postArray=new Array();
		//var indexedDB = (window.indexedDB || window.mozIndexedDB);
		$("#main").hide();
		var openDb=function()
		{
			var request=indexedDB.open("diabetore",2);
			request.onsuccess = function()
			{
				db = request.result;
				return db;
			};
        
			
			request.onerror=function(){
				alert("Sorry,could not open database :(");
			};
			
			request.onupgradeneeded = function()
			{ 
				var db= request.onsuccess();
				
				//console.log("openDB.onupgradeneeded function");
				var store = db.createObjectStore(storeName, {keyPath: 'date'});
				var dateIndex = store.createIndex("date", "date",{unique: true});
  
							
			};   
		};
		
		function getObjectStore(store_name,mode)
		{
			var tx=db.transaction(store_name,mode);
			return tx.objectStore(store_name);
		}
		
		function addItems(date,pre,post)
		{
			//console.log("addition to db started");
			var obj={date:date,pre:pre,post:post};
			var store=getObjectStore(storeName,'readwrite');
			var req;
			try
			{
				req=store.add(obj);
			}catch(e)
			{
				if(e.name=='DataCloneError')
				alert("This engine doesn't know how to clone");
				throw(e);
			}
			req.onsuccess=function(evt)
			{
				alert("Addition successful :)");
								
			};
			req.onerror=function(evt)
			{
				alert("!Could not insert into DB :( ");
			};
			
		}
		
		function getItems(date)
		{	
			//console.log("retrieval started from db");
			var hdate=new Date();
			var store=getObjectStore(storeName,"readonly");
			var obj={date:date};
			var index=store.index("date");
			
			var request=index.get(date);
			request.onsuccess=function()
			{
				var matching=request.result;
				if(matching !== undefined)
				{
					alert("Fasting: "+matching.pre+"  mg/dL"+"     "+ "Post Prandial: "+matching.post+"  mg/dL");
					//$("#date").val($("#date").attr('placeholder'));
					
			  	}else
					alert("No data exists for this date!!");
				  
			};
		
		} 
		
		function showAll()
		{
			var objectStore = db.transaction(storeName).objectStore(storeName);
			$(".records").html("");
				var flag=0;
					
			objectStore.openCursor().onsuccess = function(event)
			{
				var cursor = event.target.result;
				if (cursor) 
				{	$('#add').attr('class','deactive');
					$('#show').attr('class','deactive');
					$('#back').attr('class','active');
					$("#inputs").hide();
					$('body').css("background","#F3EFAB");
					$("#main").show("slide",{direction:'right'});
					
					
					console.log("Date" + cursor.value.date + " Pre: " + cursor.value.pre +" Post: " + cursor.value.post);
					var row= ( cursor.value.date + "  FS: " + cursor.value.pre +"  PPS: " + cursor.value.post);
					$('.records').append('<div class="row">'+row+'</div>');
					
					cursor.continue();
					flag=1;	
				}
				if (flag==0)
				alert('Oops! Looks no records exist. :(');
				$("#back").click(function(){
					$('#main').hide();
                    $('body').css({"background-image":"url(bodybackgrounds/bg.jpg)","background-size":"100% 100%"}); 
					$('#back').attr('class','deactive');
					$('#inputs').show("slide",{direction:'left'});
					$('#add').attr('class','active');
					
					$('#show').attr('class','active');
				});
				
			};
				
		}
		
		
		function graphData()
		{	console.log("inside graphData");
			var flag=0;
			var objectStore = db.transaction(storeName).objectStore(storeName);
			objectStore.openCursor().onsuccess = function(event)
			{
				console.log('cursor opened successfully'+event);
				var cursor = event.target.result;
				if (cursor) 
				{
					$('#x-chart').hide();
					$('#myChart').show("slide",{direction:'right'});
					$('#labels').show("slide",{direction:'right'});
					$('body').css("background","#FFFDD0");
					dArray.push(cursor.value.date);
					console.log(cursor.value.date);
					
					preArray.push(cursor.value.pre);
					
					postArray.push(cursor.value.post);
										
					cursor.continue();
					flag=1;
					$("#graph").attr("class","active");
					console.log("class changed to active..");
					$('#add').attr('class','deactive');		
					$('#show').attr('class','deactive');		
					$('#showAll').attr('class','deactive');		
				
				}
				console.log(flag);
				if (flag==0)
				alert('Oops! Looks no records exist. :(');
				else if (cursor==null)
				{
				var ctx = document.getElementById("myChart").getContext("2d");
				var myNewChart = new Chart(ctx).Line(data);
				}
					
				
			};	

		
		}
		
		
		
		function clearObjectStore(store_name)
		{
			var store = getObjectStore(store_name, 'readwrite');
			var req = store.clear();
			req.onsuccess = function(evt)
			{
				//alert("ObjectStore Cleared..");
				alert("All data cleared...");
			};
			req.onerror = function (evt)
			{
				alert("! Object Store could not be cleared...");
			};
		}
		
		
		
		 

		$("#add").click(function(){
				
				//console.log("addEventListeners called...");
				if (document.getElementById('add').className=="active"){
				var date=document.getElementById('date').value;
				var pre=document.getElementById('pre').value;
				var post=document.getElementById('post').value;
				
				if(!date)
				{
					alert("Required fields missing..");
					return;
				}
				addItems(date,pre,post);
			}
				
		  
		});
		  
		$("#show").click(function(){
			if (document.getElementById('show').className=="active"){
			var date=new Date().toDateString();
			date = $('#date').val();
			
			if(!date)
				{
					alert("Please enter a valid date.");
					return;
				}
			getItems(date);}
		});
		  
		$("#showAll").click(function()
		  {
			if (document.getElementById('showAll').className=="active")
			showAll();
		});
				 
		  
		$("#delete").click(function()
		  {
		  
			//console.log("eventlistner called for deleting..");
			
			var r=confirm("Hey! Do you really want to clear everything ?");
			
			if(r==true)
			{
				clearObjectStore(storeName);
			}
			else
			{
				return;
			}
			
		});
		
		
        openDb();
        
	

		var data = {
		labels : dArray,
		datasets : [
		{
			fillColor : "rgba(220,0,220,0.5)",
			strokeColor : "rgba(0,0,0,1)",
			pointColor : "rgba(220,20,220,1)",
			pointStrokeColor : "#fff",
			data : preArray
		},
		{
			fillColor : "rgba(151,187,205,0.5)",
			strokeColor : "rgba(151,187,205,1)",
			pointColor : "rgba(151,187,205,1)",
			pointStrokeColor : "#fff",
			data : postArray
		}
		]
		}	;	

		$("#graph").click(function()
		{	
			console.log("inside graph click function");
			if (document.getElementById('back').className=="deactive")
			if(document.getElementById('graph').className=="deactive")
			{
				graphData();
				
				
					console.log("new Chart called..");
				dArray.length=0;
				preArray.length=0;
				postArray.length=0;
				
			}
			else
			{	$('#x-chart').show("slide",{direction:'left'});
				$('#myChart').hide();
				$('#labels').hide();
				$("#graph").attr("class","deactive");
				$('body').css({"background-image":"url(bodybackgrounds/bg.jpg)","background-size":"100% 100%"}); 
				
				$('#add').attr('class','active');
				$('#showAll').attr('class','active');
			$('#show').attr('class','deactive');
				
			}
		});

});
    
	
	
        
