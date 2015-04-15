# Sea

Sea - AngularJS REST/ORM framework

Sea is an AngularJS framework to manage resources served by a REST service. It is also an ORM where you can define models and their relationships with other models.

Sea provides an easy way to define models and to interact with them. You can retrieve, create, update and delete resources in a clean and fast way

***

## Installing

You can download the sea package from [github](https://github.com/callebedrums/sea), or install it from bower

	bower install sea

To use See framework you have to import the file on your page and inject it as a dependence of your application.
As Sea framework uses the ngResource Angular module, you have to import it on your page too.

	<script type="text/javascript" src="path/to/angular.min.js"></script>
	<script type="text/javascript" src="path/to/angular-resource.min.js"></script>
	<script type="text/javascript" src="path/to/sea.js"></script>
	<script type="text/javascript">
		var myApp = angular.module("myApp", ["seaModel"]);
	</script>

***

## Model

One model is a Class that represents your resource, and usually represents one of the application model.

Let's see an example of how to define a model.

	(function () {
		"use strict";
		
		angular.module("myApp").factory("House", ["$seaModel", function ($seaModel) {
		    return $seaModel.newModel({
		        name: "House",
		        fields: {
		            address: "",
		            color: "",
		            doors: 0,
		            windows: 0
		        },
		        methods: {
		            logMyColor: function () {
		                console.log(this.color);
		            },
		            paint: function (color) {
		                this.color = color;
		            }
		        }
		    });
		}])
	} (angular));
	
In this example we have defined an angular factory called 'House' that returns our model, which has four attributes and two methods.

Now, let's use our new model.

	(function (angular) {
		"use strict";
		
		angular.module("myApp").controller("MyController", ["$scope", "House",
		function ($scope, House) {
		    $scope.house = new House({
		        address: "Rio de Janeiro, Brazil",
		        color: "white"
		    });
		    
		    console.log($scope.house.id); //> $scope.house.id == 0
		    
		    $scope.house.doors = 2;
		    $scope.house.windows = 8;
		    
		    $scope.house.logMyCollor();
		    $scope.house.paint("blue");
		    
		    // call POST http://domain/house
		    $scope.house.save(function (house, responseHeaders) {
		        console.log("callback");
		        console.log($scope.house.id); //> $scope.house.id != 0
		        
		        $scope.house.doors = 3;
		        
		        // call PUT http://domain/house/:id
		        $scope.house.save();
		    });
		    
		    // call GET http://domain/house/2
		    $scope.house2 = House.get(2, function () { // retrive a house with id=2;
		    
		        // call DELETE http://domain/house/2
		        $scope.house2.remove();
		    }); 
		    
		    // call GET http://domain/house
		    $scope.houses = Houses.query(function (houses, responseHeaders) { // retrive all houses;
		        console.log($scope.houses.length);
		    }); 
		}]);
	} (angular));

### Relationship

We can define relationship between our models

#### BelongsTo

	(function () {
		"use strict";
		
		angular.module("myApp").factory("Person", ["$seaModel", "House", function ($seaModel, House) {
		    return $seaModel.newModel({
		        name: "Person",
		        fields: {
		            name: "",
		            lastname: "",
		            age: 0,
		            house: $seaModel.belongsTo(House)
		        }
		    });
		}])
		
	} (angular));
	
In this example we have created a new model called Person, and we added a relational field 'belongs to' to it. It means that each person can belong to a house.

Let's see an example of how to use this field

	(function (angular) {
		"use strict";
		
		angular.module("myApp").controller("MyController", ["$scope", "House", "Person",
		function ($scope, House, Person) {
		    $scope.person = new Person({
		    	name: 'Callebe',
		    	lastname: 'Gomes',
		    	age: 26,
		    	house: 3 //> i'm setting the Callebe's house as he house of id 3;
		    }); 
		    
		    $scope.person.house = 4; //> moving to another house :)
		    
		    var house = new House({id:5});
		    
		    $scope.person.house = house; //> moving to another house again:)
		}]);
	} (angular));

On HTML:

	<div ng-controller="MyController">
	<h2>{{ person.name }}</h2>
	{{ person.lastname }} <br />
	{{ person.age }} <br />
	<h3>{{ person.name }}'s house</h3>
	{{ person.house.address }} <br />
	{{ person.house.color }}
	</div>

As the relational field is lazy loaded, if you want to access its inner controller, you can use the Model instance method get, like in the following example:

	(function (angular) {
		"use strict";
		
		angular.module("myApp").controller("MyController", ["$scope", "House", "Person",
		function ($scope, House, Person) {
		    $scope.person = new Person({
		    	name: 'Callebe',
		    	lastname: 'Gomes',
		    	age: 26,
		    	house: 3 //> i'm setting the Callebe's house as he house of id 3;
		    }); 
		    
		    var house = $scope.person.get('house', function (house_obj, httpHeaders) {
		    	console.log('house loaded');
		    }, function (httpResponse) {
		    	console.log('error to load house');
		    });
		}]);
	} (angular));
	
#### HasMany

We saw how to connect the Person model to the House model. But what if i want to have access to the list of people how are living in the same house?

	(function () {
		"use strict";
		
		angular.module("myApp").factory("House", ["$seaModel", function ($seaModel) {
		    return $seaModel.newModel({
		        name: "House",
		        fields: {
		            address: "",
		            color: "",
		            doors: 0,
		            windows: 0,
		            people: $seaModel.hasMany('Person', 'house')
		        },
		        methods: {...}
		    });
		}])
	} (angular));
	
Easy. isn't it?

