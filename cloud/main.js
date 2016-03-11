Parse.Cloud.afterSave("ShoppingList", function(request) {

	if (request.object.get("isShared")) {
		
		var currentUser = request.user.get("email");
		var users = request.object.get("users");

		for (var i = users.length - 1; i >= 0; i--) {
			if (users[i] === currentUser) {
				users.splice(i, 1);
				break;
			}
		}

		var objectId = request.object.id;

		var userQuery = new Parse.Query(Parse.User);
		userQuery.containedIn("email", users);

		var pushQuery = new Parse.Query(Parse.Installation);
		pushQuery.matchesQuery("user", userQuery);

		Parse.Push.send({
			where: pushQuery,
			data: {
				action: "list_changed",
				objectId: objectId,
				currentUser: currentUser
			}
		}, {
			success: function() {
			},
			error: function(error) {
			}
		});

	}

});

Parse.Cloud.afterDelete("ShoppingList", function(request) {

	if (request.object.get("isShared")) {
		
		var currentUser = request.user.get("email");
		var users = request.object.get("users");

		for (var i = users.length - 1; i >= 0; i--) {
			if (users[i] === currentUser) {
				users.splice(i, 1);
				break;
			}
		}

		var listName = request.object.get("name");
		
		if (listName == null) {
			listName = request.object.get("timeInMill");
		};

		var userQuery = new Parse.Query(Parse.User);
		userQuery.containedIn("email", users);

		var pushQuery = new Parse.Query(Parse.Installation);
		pushQuery.matchesQuery("user", userQuery);

		Parse.Push.send({
			where: pushQuery,
			data: {
				action: "list_deleted",
				listName: listName,
				currentUser: currentUser
			}
		}, {
			success: function() {
			},
			error: function(error) {
			}
		});

	}

});

Parse.Cloud.define("notifyExcludedUser", function(request, response) {

	var userToNotify = request.params.userToNotify;
	var listName = request.params.listName;
	var user = request.params.user;

	var userQuery = new Parse.Query(Parse.User);
	userQuery.equalTo("email", userToNotify);

	var pushQuery = new Parse.Query(Parse.Installation);
	pushQuery.matchesQuery("user", userQuery);

	Parse.Push.send({
		where: pushQuery,
		data: {
			action: "excluded_from_list",
			listName: listName,
			user: user
		}
	}, {
		success: function() {
			response.success();
		},
		error: function(error) {
			response.error(error);
		}
	});
});

Parse.Cloud.define("siteverify", function(request, response) {

	var resp = request.params.resp;

	Parse.Cloud.httpRequest({
		url: "https://www.google.com/recaptcha/api/siteverify",
		method: "POST",
		params: {"secret": "6LeQJhgTAAAAABjxfKXpAUrstF1k_my1jknvrHik", "response": resp}
	}).then(function(httpResponse) {
		// success
		response.success(httpResponse.text);
	}, function(httpResponse) {
		// error
		response.error("Request failed with response code " + httpResponse.status);
	});
});