function nameFromPath(path) {
	if (path.isIdentifier()) {
		return path.node.name;
	}
	if (path.node.id) {
		return path.node.id.name;
	}
	if (path.parentPath.isObjectProperty() && !path.parent.computed && path.parent.key.type == "Identifier") {
		return path.parent.key.name;
	}
	if (path.parentPath.isVariableDeclarator() && path.parent.id.type == "Identifier") {
		return path.parent.id.name;
	}
	if (path.parentPath.isAssignmentExpression()) {
		if (path.parent.right === path.node) {
			return nameFromPath(path.parentPath.get("left"));
		}
	}
	if (path.parentPath.isJSXExpressionContainer()) {
		return nameFromPath(path.parentPath);
	}
	if (path.parentPath.isJSXAttribute() && path.parent.name.type == "JSXIdentifier") {
		return path.parent.name.name;
	}
	return "ref";
}

function patchMethod(methodPath, types) {
	let i = 0;
	let usedHelpers = 0;
	function cachePathOnThis(path) {
		let shouldReplace = true;
		let dependentValues = [];
		let dependsOnThis = false;
		let skipThis = 0;
		let _thisIndex = -1;
		// Find dependent values from the render scope
		path.traverse({
			FunctionExpression: {
				enter(expressionPath) {
					skipThis++;
				},
				exit(expressionPath) {
					skipThis--;
				}
			},
			Identifier(identifierPath) {
				const name = identifierPath.node.name;
				const binding = identifierPath.scope.getBinding(name);
				if (binding) {
					let bindingPath = binding.path;
					while (bindingPath && bindingPath != path) {
						if (bindingPath === methodPath) {
							if (binding.constant) {
								// Possibly treat arguments named as _this specially
								if (name === "_this" && skipThis === 0) {
									_thisIndex = dependentValues.length;
								}
								// Found a constant from the render scope, include it in the cache check
								dependentValues.push(identifierPath.node);
							} else {
								// binding was not constant, do not optimize this
								shouldReplace = false;
								identifierPath.stop();
							}
							break;
						}
						bindingPath = bindingPath.parentPath;
					}
				}
			},
			ThisExpression(path) {
				if (skipThis === 0) {
					// Bind expression or direct child arrow function, using this
					dependsOnThis = true;
				} else if (skipThis === 1) {
					// Direct child normal function, using this
					shouldReplace = false;
					path.stop();
				}
			}
		});
		if (!skipThis && _thisIndex !== -1) {
			// Rewrite pseudo-_this parameter back into this
			dependentValues.splice(_thisIndex, 1);
			dependsOnThis = true;
			path.traverse({
				FunctionExpression(path) {
					path.skip();
				},
				Identifier(path) {
					if (path.node.name === "_this") {
						path.replaceWith(types.thisExpression());
					}
				}
			});
		}
		if (shouldReplace) {
			usedHelpers = true;
			const lookupArguments = [types.thisExpression(), types.numericLiteral(i)];
			if (path.isCallExpression() && path.get("callee").isMemberExpression() && !path.node.callee.computed && path.node.callee.property.name == "bind") {
				// Replace .bind calls
				lookupArguments.push(path.node.callee.object);
				if (path.node.arguments.length && (path.node.arguments.length != 1 || path.node.arguments[0].type !== "ThisExpression")) {
					lookupArguments.push(types.arrayExpression(path.node.arguments));
				}
				path.replaceWith(types.callExpression(types.identifier("__render_bind"), lookupArguments));
			} else if (path.isFunctionExpression() || path.isArrowFunctionExpression()) {
				// Replace function expressions
				const id = methodPath.scope.generateUidIdentifier(nameFromPath(path) || "ref");
				const init = path.node;
				if (dependentValues.length || dependsOnThis) {
					lookupArguments.push(id);
					if (dependentValues.length) {
						lookupArguments.push(types.arrayExpression([types.thisExpression()].concat(dependentValues)));
					}
					path.replaceWith(types.callExpression(types.identifier("__render_bind"), lookupArguments));
				} else {
					path.replaceWith(id);
				}
				const params = dependentValues.concat(init.params);
				const body = init.body.type == "BlockStatement" ? init.body : types.blockStatement([types.returnStatement(init.body)]);
				methodPath.scope.parent.push({ id, init: types.functionExpression(init.id, params, body, init.generator, init.async) });
			} else {
				// How did we get here?
				return;
			}
			i++;
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
	return usedHelpers;
}

module.exports = function({ types, template }) {
	return {
		visitor: {
			ClassMethod(path) {
				if (path.node.key.name === "render") {
					this.usedHelpers |= patchMethod(path, types);
				}
			},
			FunctionExpression(path) {
				const parentPath = path.parentPath;
				if (parentPath.isAssignmentExpression()) {
					const leftPath = parentPath.get("left");
					if (leftPath.isMemberExpression() && !leftPath.node.computed && leftPath.node.property.name == "render") {
						const objectPath = leftPath.get("object");
						if (objectPath.isMemberExpression() && !objectPath.node.computed && objectPath.node.property.name == "prototype") {
							if (patchMethod(path, types)) {
								this.usedHelpers = true;
							}
						}
					}
				}
			},
			Program: {
				exit(path) {
					if (this.usedHelpers) {
						const body = path.get("body.0");
						body.insertBefore(template(`var __render_bind = (function() {
							// Try using WeakMaps
							var map = typeof WeakMap != "undefined" && new WeakMap();
							return function(target, nodeIndex, func, boundValues) {
								var targetCache;
								if (map) {
									(targetCache = map.get(target)) || (map.set(target, targetCache = []));
								} else {
									targetCache = target.__render_cache || (target.__render_cache = []);
								}
								// Lookup the cache for the particular node
								var nodeCache = targetCache[nodeIndex];
								// Check if all the dependent values match
								if (nodeCache) {
									if (boundValues) {
										for (var i = 0; i < boundValues.length; i++) {
											if (nodeCache.v[i] !== boundValues[i]) {
												nodeCache.v = boundValues;
												return nodeCache._ = func.bind.apply(func, boundValues);
											}
										}
									}
									return nodeCache._;
								}
								var result = func.bind.apply(func, boundValues || [target]);
								targetCache[nodeIndex] = { v: boundValues, _: result };
								return result;
							}
						})();`)());
						path.stop();
					}
				}
			}
		}
	};
}
