Sea
===

Sea - AngularJS REST/ORM framework

Sea is an AngularJS framework to manage resources served by a REST service. It is also an ORM where you can define models and their relationships with other models.

Sea provide a easy way to define models and to interact with them. You can retrieve, create, update and delete resources in a clean and fast way

To use the see framework you have to import the file in your page and inject it as a dependence of your application.
As Sea framework use the ngResource Angular module, you have to import it on your page too.

```
<script type="text/javascript" src="path/to/angular.min.js"></script>
<script type="text/javascript" src="path/to/angular-resource.min.js"></script>
<script type="text/javascript" src="path/to/sea.js"></script>
<script type="text/javascript">
    var myApp = angular.module("myApp", ["seaModel"]);
</script>
```

# Model

One model is a Class that represent your resource, and usually represents one of the application model.

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

In this example we have defined a angular factory called 'House' that return our model, which has four attributes and two methods.

Now, lat's use our new model.

```
(function (angular) {
    "use strict";
    
    angular.module("myApp").controller("MyController", ["$scope", "Hose",
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

$seaModel.newModel is the method called to define a new model and its prototype is `$seaModel.newModel(object declaration, [object settings])`. the first parameter is the model declaration object, which have to define two required attributes, 'name' and 'fields'.

The 'name' attribute is obviously the model name. It is required because the framework use it to manage and reference the model internally. It is also used to create relationships, as we'll see further ahead.

The 'fields' attribute is obviously the fields of our model. It can contain how many fields as you want, and each field can be any primitive type or functions, but they can never be an object. If a field is defined as a function, it have to return a primitive value that will be assigned to field definitely when a new model instance is instantiated.

There are tow more attributes that are able to be defined in the fields declaration objects, 'methods' and 'url';
