
# Sea configuration

A conventional client-side ORM has to be configured to get working.
Sea also has to be configured to get working, but it has its own default configuration.

Over this page, we will see which configurations cam be changed and what is their default values.

***

## $seaModelProvider

As a AngularJs module, Sea provides a provider. This provider has only one method
that should be called to configure the Global Settings of the Sea module.

This settings also can be changed for each model definition. See [Model](/model/) for more informations.

### .settings(defSettings)

The .settings(defSettings) method receives only one parameter, that should be an object with the following attributes:

&nbsp;

`url`

- type: `string|function`
- optional: `yes`

default: 

	function (name) {
		return '/' + name.uncapitalize() + '/:id/';
	}

This attribute define the default URL for each model. When a new model is created, the Sea consults this attribute to define which URL will be used for this model.

If this attribute is setted as a function, Sea calls it passing the model name as parameter and uses the returned value as URL. If it is a string, Sea just uses it.

&nbsp;

`urlPrefix`

- type: `string`
- optional: `yes`
- default: `''`

This attribute define the default prefix of the URL for all models. This attribute is prepended to the URL attribute.

It is useful when your api is exposed on a sub-path of your domain, e.g. my.domain.com/api/. On this case, the urlPrefix attribute should be setted as '/api'.

&nbsp;

`methods`

- type: `object`
- optional: `yes`

default:

	{
		'get': {method: 'GET'},
		'create': {method: 'POST'},
		'update': {method: 'PUT'},
		'query': {method: 'GET', isArray: true},
		'remove': {method: 'DELETE'},
		'delete': {method: 'DELETE'}
	}
	
This attribute is used as the *action* parameter of the [$resource](https://docs.angularjs.org/api/ngResource/service/$resource) service of the ngResource angular module.

For mor details, see the [$resource](https://docs.angularjs.org/api/ngResource/service/$resource) documentation

***

## Calculating the URL

As we previously saw, there are two attributes related to the URL, `url` and `urlPrefix`.
Sea uses this two attributes to calculate the model's URL, and it simply concatenates this two values.
Therefore, the resulting URL always will be equals `urlPrefix + url`.

## Example

	var myModule = angular.module('myModule', ['seaModel']);

	myModule.config(function ($seaModelProvider) {
		$seaModelProvider.settings({
			urlPrefix: '/dashboard/api'
		});
	});

