'use strict';
var timerId;

function getExtensionId() {
	return chrome.runtime.id;
}

function getClient() {
	return APP_KEYS[getExtensionId()];
}
function getAuthUrl() {
	return 'https://' + getClient().host + '/login/oauth2?state=jibberish617&client_id=' + getClient().id;
}
function getTokenUrl() {
	return 'https://api.' + getClient().host + '/oauth2/access_token?client_id=' + getClient().id + '&client_secret=' + getClient().secret + '&grant_type=authorization_code&code=';
}

function startRequest() {
	stopRequest();
	// instead of writing badgeTest as ? while processing, i'd like to rotate hte badge icon
	chrome.browserAction.setBadgeText({text:'?'});
	getStatus();
	timerId = window.setTimeout(startRequest, getClient().interval);
}

function stopRequest() {
	window.clearTimeout(timerId);
}

function getStatus() {
	if (localStorage.hasOwnProperty(TOKEN_NAMESPACE)) {
		var tokenData = JSON.parse(localStorage.getItem(TOKEN_NAMESPACE));
		/**
			Content-Type: application/json;charset=UTF-8
			Authorization: Bearer 9BwUG2zsmtjoxW83uUHg10YySwhiEow7
		*/
		var ref = new Firebase('wss://developer-api.nest.com');
		ref.authWithCustomToken(tokenData.access_token, function(error, data) {
			if (error) {
				authorizeUser();
			}
		});
		ref.on('value', function(snapshot) {
			var data = snapshot.val();
			if (data.hasOwnProperty('devices') && data.devices.hasOwnProperty('thermostats')) {
				var thermo = data.devices.thermostats[Object.keys(x.devices.thermostats)[0]];
				loadBadge(thermo);
			}
		});
	} else {
		stopRequest();
		authorizeUser();
	}
}

function loadBadge(data) {
	var colorObj = {color:'#000'};
	// always grabs first thermostat, hopefully it's the one the user wants
	var thermostat = data.thermostatList[0];
	if (thermostat.ambient_temperature_f < thermostat.target_temperature_f) {
		colorObj.color = '#03f';
	} else if (thermostat.ambient_temperature_f > thermostat.target_temperature_f) {
		colorObj.color = '#f71';
	}
	chrome.browserAction.setBadgeBackgroundColor(colorObj);
	chrome.browserAction.setBadgeText({text:data.ambient_temperature_f});
	chrome.browserAction.setTitle({'title':'Nest (v' + chrome.app.getDetails().version + ')\n' + new Date().toTimeString()});
}

function authorizeUser() {
	console.log(getAuthUrl());
	chrome.identity.launchWebAuthFlow(
		{'url': getAuthUrl(), 'interactive': true},
		function(responseUrl) {
			if (responseUrl && responseUrl.search('code=') >= 0) {
				console.log(responseUrl);
				var code = responseUrl.substring(responseUrl.search('code=') + 5);
				$.post(getTokenUrl() + code)
					.success(function(data){
						console.log("authorizeUser: post.success()");
						localStorage.setItem(TOKEN_NAMESPACE, JSON.stringify(data));
						startRequest();
					})
					.fail(function(data){
						console.log("authorizeUser: post.fail()", data);
						stopRequest();
					});
			}
		}
	);
}

chrome.browserAction.onClicked.addListener(function(){
	stopRequest();
	startRequest();
	chrome.tabs.query({url:"https://home.nest.com/*"}, function(result) {
		if (result.length === 0) {
			chrome.tabs.create({url: "https://home.nest.com"});
		} else {
			var tab = result.shift();
			chrome.tabs.update(tab.id, {selected: true});
		}
	});
});

startRequest();