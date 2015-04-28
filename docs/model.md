
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

# Declaring a Model

A Sea Model represents a kind or type of resources provided by a REST Service.
Each model has its own URL to access the resources. To know how Sea calculates 
the url, consult [Calculating the url](configuration/#calculating-the-url).

To declare a new Sea Model, use the `newModel` method:

## `$seaModel.newModel (declaration [, settings])`

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
		Each attribute can be of any primitive type, or a function that returns a primitive type.
		Each function will be called when a new Model instance is created and its instance will
		be passed as argument. The return will be used as the initial value of the attribute.
		This funcions can not be used to define behaviors.
		This is the function signature `function (instance) { return <primitive type>; }`.
		To access a instance attribute, consult [Model Instance](#model-instance)
	- `methods`:
		- type: `object`
		- optional: `yes`
		- description: An object with only functions. These functions will be attached to the
		Model prototype, and they can be accessed directly from a Model instance.
	- `url`:
		- type: `string|function`
		- optional: `yes`
		- description: Define de Model URL. This parameters does not affect the Global Setting, only the Model setting.
		For more details, consult [$seaModelProvider](/configuration/#seamodelprovider) and [calculating the URL](/configuration/#calculating-the-url)	

&nbsp;

`settings`

- type: `object`
- optional: `yes`
- description: Set the Model setting, without affect the Global Setting.
This object has the same attributes of the parameter passed to `$seaModelProvider.settings()` method.
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

# Model Class

Each model is declared as a Class, because of this you can instantiate new objects using the 'new' keyword.

A Model Class also have two class methods:

&nbsp;

`.query([params] [, success_cb [, error_cb]])`

&nbsp;

`.get(id [, success_cb [, error_cb]])`

&nbsp;

# Model Instance

&nbsp;

`.id`

&nbsp;

`.<field_name>`

&nbsp;

`._url`

&nbsp;

`.isNew`

&nbsp;

`.isLoaded`

&nbsp;

`.modelName`

&nbsp;

`.<method_name>()`

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

