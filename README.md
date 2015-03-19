Sea
===

Sea - AngularJS REST/ORM framework

Sea is an AngularJS framework to manage resources served by a REST service. It is also an ORM where you can define models and their relationships with other models.

Sea provides an easy way to define models and to interact with them. You can retrieve, create, update and delete resources in a clean and fast way

### Installing

```
bower install sea
```

To use See framework you have to import the file on your page and inject it as a dependence of your application.
As Sea framework uses the ngResource Angular module, you have to import it on your page too.

```
<script type="text/javascript" src="path/to/angular.min.js"></script>
<script type="text/javascript" src="path/to/angular-resource.min.js"></script>
<script type="text/javascript" src="path/to/sea.js"></script>
<script type="text/javascript">
    var myApp = angular.module("myApp", ["seaModel"]);
</script>
```

# Model

One model is a Class that represents your resource, and usually represents one of the application model.

Let's see an example of how to define a model.

```
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
```

In this example we have defined an angular factory called 'House' that returns our model, which has four attributes and two methods.

Now, let's use our new model.

```
(function (angular) {
    "use strict";
    
    angular.module("myApp").controller("MyController", ["$scope", "House",
    function ($scope, House) {
        $scope.house = new House({
            address: "Rio de Janeiro, Brazil",
            color: "white"
        });
        
        console.log($scope.house.id); //> $scope.house.id == 0
        
        $scope.doors = 2;
        $scope.windows = 8;
        
        $scope.logMyCollor();
        $scope.paint("blue");
        
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
```

### $seaModel.newModel

$seaModel.newModel is the method called to define a new model and its prototype is `$seaModel.newModel(object declaration, [object settings])`. the first parameter is the Model declaration object, which has to define two required attributes, 'name' and 'fields'.

The 'name' is the Model name. It is required because the framework uses it to manage and reference the model internally. It is also used to create relationships, as we will see ahead.

The 'fields' attribute is our Model fields. It can contain as many fields as you want, and each field can be any primitive type or functions, but they can never be an object. If a field is defined as a function, it has to return a primitive value that will be definitely assigned to the field when a new model instance is instantiated.

There are two more attributes that can be defined in the fields declaration objects, 'methods' and 'url';

The 'methods' attribute is an optional object which contains only methods, and they can be considered instance methods. All model instances have access to these methods;

The 'url' attribute is optional and has to be a string representing the resource endpoint. By default, Sea calculates the url as '/' + model_name.uncapitalize() + '/:id/'. The :id is replaced by the instance id when any instance operation is performed. 

The 'settings' parameter is used to configure the ngResource service to this specifc model. We will see more details about it ahead.

### $seaModel.belongsTo

Sea also is an ORM, and tries to connect the models. Let's see an example of how to connect one model with other:

```
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
```

In this example we have created a new model called Person, and we added a relational field 'belongs to' to it. It means that each person can belong to a house.

The $seaModel.belongsTo method returns another method that instantiate a relational object that manages this relationship. It receives just one parameter that can be the Model itself or the name of a Model. Use the name instead the Model when you want to refer to a Model not yet declared or to refer to the Model itself.

Let's see an example of how to use this field

```
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
```

```
<div ng-controller="MyController">
	<h2>{{ person.name }}</h2>
	{{ person.lastname }} <br />
	{{ person.age }} <br />
	<h3>{{ person.name }}'s house</h3>
	{{ person.house.address }} <br />
    {{ person.house.color }}
</div>
```

Here we have a new Person instantiated setting the house to 3. It means that the house with id equals to 3 will be loaded to the field. But do not worry, Sea do a lazy load of relational attributes. When angular renders the template and asks for the house attribute, Sea will return an empty instance of House and will request the House data.

As the relational field is lazy loaded, if you want to access its inner controller, you can use the Model instance method get, like in the following example:

```
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
```

There is the get and set method for all Model instances, and it works for any field, but it is more convenient to use the dot syntax, unless in case of accessing a relational field, as we previously exemplified.

The get method can receive more two parameters that should be callback functions, but these functions are only used for relational fields. If the relational field was already loaded, then the success callback will be called immediately. If the relational field was not loaded, the get method will return an empty Model instance and call the success callback with the filled instance after the data load.

### $seaModel.hasMany

We saw how to connect the Person model to the House model. But what if i want to have access to the list of people how are living in the same house?

We have to connect the House model with the Person model by the $seaModel.hasMany method.

Again, an example is the best explanation:

```
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
```

Easy. isn't it?

$seaModel.hasMany method has to receive two parameters, the Model or Model name, and the related field.

The related field indicates which field in the Person model will be used to connect the Models. So, when you require to access the list of people in a house, SeaModel will query the people by the 'house' attribute.

The 'people' field will be an array of Person instances.
