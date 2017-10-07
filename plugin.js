module.exports = function({ types, template }) {
	function thisMember(memberIdentifier) {
		return types.memberExpression(types.identifier("this"), memberIdentifier);
	}
	function cachedOnThis(node, propertyIdentifier, cacheIdentifiers) {
		const left = Object.keys(cacheIdentifiers).reduce((expression, name) => types.binaryExpression("&", types.binaryExpression("===", thisMember(cacheIdentifiers[name]), types.assignmentExpression("=", thisMember(cacheIdentifiers[name]), types.identifier(name))), expression), thisMember(propertyIdentifier));
		return types.logicalExpression("||", left, types.assignmentExpression("=", thisMember(propertyIdentifier), node));
	}
	return {
		visitor: {
			ClassMethod(methodPath) {
				if (methodPath.node.key.name !== "render") {
					return;
				}
				function cachePathOnThis(path) {
					let shouldReplace = true;
					let cacheIdentifiers = {};
					path.traverse({
						MemberExpression(path) {
							path.skip();
						},
						Identifier(identifierPath) {
							const name = identifierPath.node.name;
							const binding = identifierPath.scope.getBinding(name);
							if (binding && binding.constant) {
								let bindingPath = binding.path;
								while (bindingPath) {
									if (bindingPath === methodPath) {
										cacheIdentifiers[name] = identifierPath.scope.generateUidIdentifier(name);
										break;
									}
									bindingPath = bindingPath.parentPath;
								}
							} else {
								shouldReplace = false;
								identifierPath.stop();
							}
						}
					});
					if (shouldReplace) {
						path.replaceWith(cachedOnThis(path.node, path.scope.generateUidIdentifier("cached"), cacheIdentifiers));
						path.skip();
					}
				}
				methodPath.traverse({
					// Arrow functions
					ArrowFunctionExpression: cachePathOnThis,
					// Functions
					FunctionExpression(path) {
						cachePathOnThis(path);
						path.skip();
					},
					// Call expressions
					CallExpression(path) {
						const callee = path.get("callee");
						// But only calls to bind
						if (callee.isMemberExpression() && !callee.node.computed && callee.node.property.name == "bind") {
							cachePathOnThis(path);
						}
					}
				});
			}
		}
	};
}
