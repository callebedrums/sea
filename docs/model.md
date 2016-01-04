
Sea Model
===========

A conventional client-side ORM tries to map an Object Oriented
approach to a database schema. To do this, the ORM maps a
Class to a database table, the attributes to the table columns,
and the Class instances to table rows.

Sea does the same thing, but instead to map the Object Oriented
approach to a database, it maps to a REST Service. It makes ajax
calls instead to run SQL commands.

Sea also has the concepts of Models, Instances and Attributes.

Over this document, you will see how to declare a Sea Model,
how to connect models using relational attributes, and how to use this models.

***

# Declaring a Model

A Sea Model represents a kind or type of resources provided by a REST Service.
Each model has its own URL to access the resources. To know how Sea calculates 
the url, consult [Calculating the endpoint](configuration/#calculating-the-endpoint).

To declare a new Sea Model, use the `newModel` method:

## `$seaModel.newModel (declaration [, config])`

This method returns a Sea Model Class that has methods to access the resources and
can be instantiated to represent a single resource.

It receives two parameters:

&nbsp;

`declaration`

- type: `object`
- optional: `no`
- attributes:
	- `name`:
		- type: `string`
		- optional: `no`
		- description: Define the Model name. Sea uses this name internally to
		manage the models and manage the relationships. It has to be unique.
	- `fields`:
		- type: `object`
		- optional: `no`
		- description: This parameters define the attributes of the model instances.
		Each attribute can be of any type, including objects and functions.
		Each function will be called when a new Model instance is created and its instance will
		be passed as argument. The return will be used as the initial value of the attribute.
		This funcions can not be used to define behaviors.
		This is the function signature `function (instance) { return <any type>; }`.
		To access an instance attribute, consult [Model Instance](#model-instance)
	- `methods`:
		- type: `object`
		- optional: `yes`
		- description: An object with only functions. These functions will be attached to the
		Model prototype, and they can be accessed directly from a Model instance.
	- `endpoint`:
		- type: `string|function`
		- optional: `yes`
		- description: Define de Model endpoint. This parameters does not affect the Global Configuration, only the Model configuration.
		For more details, consult [$seaModelProvider](/configuration/#seamodelprovider) and [calculating the endpoint](/configuration/#calculating-the-endpoint)	

&nbsp;

`config`

- type: `object`
- optional: `yes`
- description: Set the Model configuration without affect the Global Configuration.
This object has the same attributes of the parameter passed to `$seaModelProvider.config()` method.
For mor details, consult [$seaModelProvider](/configuration/#seamodelprovider)

&nbsp;

### Example

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

On this example, we defined a new Sea model named 'House'. As the Sea was designed
to work with [AngularJs](https://angularjs.org/), we defined and returned the model
in a angular [Factory](https://docs.angularjs.org/guide/providers), so we can inject
it as dependency in any controller or service we  have declared.

The 'House' model has four instance attributes and two instance methods.

Its URL will be `http://myDomain.com/house/:id/`

&nbsp;

***

# Relationship

When you are defining a new model, Sea provides a way to you connect two or more
models. You can define relationships.

For now, Sea provides two relationship kinds: `belongsTo`, connects an instance
to another single instance; `hasMany`, connects an instance to one or more instances.
This relationships should be defined as fields of the models.

## `$seaModel.belongsTo(model)`

This method returns a 'belongsTo' relationship. Each instance of this model will have
a connection to another single instance of another model. This kind of relationship
is usually used when the model has a foreign key to another model. On this case, Sea
expects to receive an id from the server as the field value, however, when you access
the field, you will see an instance of the connected model.

&nbsp;

`model`

- type: `string|<Sea Model>`
- description: model's name or model's class

&nbsp;

### Example

	(function () {
		"use strict";
		
		angular.module("myApp").factory("FlightAttendant", ["$seaModel", "Plane",
		function ($seaModel, Plane) {
		    return $seaModel.newModel({
		        name: "FlightAttendant",
		        fields: {
		            name: "",
		            age: "",
		            plane: $seaModel.belongsTo(Plane),
		        }
		    });
		}])
	} (angular));

&nbsp;

## `$seaModel.hasMany(model, related_field)`

This method returns a 'hasMany' relationship. Each instance of this model will have a
connection to many other instances of another model. This kind of relationship
is usually used when the foreign key is in the connected model. On this case, Sea
expects to receive an array of id's from the server as the field value, however, when
you access the field, you will see an array of instances of the connected model.

&nbsp;

`model`

- type: `string|<Sea Model>`
- description: model's name or model's class

&nbsp;

`related_field`

- type: `string`
- description: the field of the connected model used to establish the relationship

&nbsp;

### Example

	(function () {
		"use strict";
		
		angular.module("myApp").factory("Plane", ["$seaModel",
		function ($seaModel) {
		    return $seaModel.newModel({
		        name: "FlightAttendant",
		        fields: {
		            number: "",
		            compay: "",
		            crew: $seaModel.hasMany('FlightAttendant'),
		        }
		    });
		}])
	} (angular));

&nbsp;

***

# Model Class

Each model is declared as a Class, so you can instantiate new objects using the 'new' keyword.

`new <modal_name>([data])`

The constructor receives just one optional parameter `data` and returns the model instance.

- `data`
	- type: `object`
	- description: The initial data of the instance

&nbsp;

A Model Class also have two class methods:

&nbsp;

`.query([params] [, success_cb [, error_cb]])`

This method is destinated to query on the server for model instances.
It sends a GET request to the model endpoint and returns an array of model instances.
As it is lazy load, the returned array will be empty, and it will be filled on the return of the request.
Each field in the `params` object will compose the query string of the request.

- `params`:
	- type: `object`
	- optional: `yes`
	- description: An object with the filter parameters to compose the request query string
- `success_cb`:
	- type: `function(result, responseHeaders)`
	- optional: `yes`
	- description: The success callback to be called on the success response. It shall receive the populated array of instance and the HTTP response headers.
- `error_cb`:
	- type: `function(httpResponse)`
	- optional: `yes`
	- description: The error callback to be called on the error response. It shall receive the HTTP response.

&nbsp;

`.get(id [, success_cb [, error_cb]])`

This method is destinated to retrieve only one single model instance from the server.
It sends a GET request to the model instance endpoint and returns an model instance.
As it is lazy load, the returned model instance will have its attributes setted to the default values.
After the return of the request, the instance attributes will be filled with the response values.

- `id`:
	- type: `string|int`
	- optional: `no`
	- description: The unique identifier of the instance to be retrieved
- `success_cb`:
	- type: `function(instance, responseHeaders)`
	- optional: `yes`
	- description: The success callback to be called on the success response. It shall receive the instance returned from the server and the HTTP response headers.
- `error_cb`:
	- type: `function(httpResponse)`
	- optional: `yes`
	- description: The error callback to be called on the error response. It Shall receive the HTTP response.

&nbsp;

***

# Model Instance

All model instances have the following methods and attributes.

&nbsp;

`.id`

All instance have an unique identifier and it is accessed by the attribute `id`.
For new instances, the id value will be zero. After a save operation, the id will be filled
with the value returned by the server.

The id field is used to calculate the instance URL to operate over it.
It also compose the JSON sent to and received by the server, except in the create operation, when the id is not defined yet.

&nbsp;

`.<field_name>`

All instances will have attributes as defined in the Model definition. You can use this attributes to get and set their values.

In the case of a belongsTo relationship attribute, it is possible to set it to an instance of the related model, or an id that identify the instance.
If an id is setted to the attribute, the Sea will create an empty instance of the related model and attribute the id value to this instance.

In the case of a hasMany relationship attribute, its value have to be an array of related model instances.

&nbsp;

`._endpoint`

The read only endpoint configured to that instance. All instance of the same model have the same value for this attribute;

&nbsp;

`.isNew`

Read only attribute that indicates if the instance is new or note. In other words, it indicates if there is an server resource corresponding to the instance.
Basically, it indicates if the id is equal zero.

&nbsp;

`.isLoaded`

Read only attribute that indicates if the instace is loaded. It may have an id setted to id, but was not loaded from the server yet.

&nbsp;

`.modelName`

Read only attribute that identify the Model name of the instance. You can use this attribute to identify the instances and handle them properly.

&nbsp;

`.<method_name>()`

All instances will have methods as defined in the Model definition. You can call them as instance methods.

&nbsp;

`.toJS()`

&nbsp;

`.toJSON()`

&nbsp;

`.get(field [, success_cb [, error_cb]])`

&nbsp;

`.set(field [, value])`

&nbsp;

`.setFields(obj)`

&nbsp;

`.load([success_cb [, error_cb]])`

&nbsp;

`.save([success_cb [, error_cb]])`

&nbsp;

`.remove([success_cb [, error_cb]])`

