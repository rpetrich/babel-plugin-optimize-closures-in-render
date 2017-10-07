module.exports = function({ types, template }) {
	return {
		visitor: {
			ClassMethod(methodPath) {
				if (methodPath.node.key.name !== "render") {
					return;
				}
				let i = 0;
				const that = this;
				function cachePathOnThis(path) {
					let shouldReplace = true;
					let dependentValues = [];
					// Find dependent values from the render scope
					path.traverse({
						MemberExpression(path) {
							path.skip();
						},
						Identifier(identifierPath) {
							const name = identifierPath.node.name;
							const binding = identifierPath.scope.getBinding(name);
							if (binding) {
								let bindingPath = binding.path;
								while (bindingPath && bindingPath != path) {
									if (bindingPath === methodPath) {
										if (binding.constant) {
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
						}
					});
					if (shouldReplace) {
						that.usedHelpers = true;
						const lookupArguments = [types.thisExpression(), types.numericLiteral(i)];
						if (dependentValues.length) {
							lookupArguments.push(types.arrayExpression(dependentValues));
						}
						// Try to find this expression in the cache
						path.replaceWith(types.logicalExpression(
							"||",
							types.callExpression(types.identifier("__render_lookup"), lookupArguments),
							types.assignmentExpression("=", types.memberExpression(types.identifier("__render_pending"), types.identifier("_")), path.node)
						));
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
			},
			Program: {
				exit(path) {
					if (this.usedHelpers) {
						const body = path.get("body.0");
						body.insertBefore(template(`var __render_pending, __render_lookup = (function() {
							// Try using WeakMaps
							var map;
							if (typeof WeakMap != "undefined") {
								map = new WeakMap();
							}
							return function(target, nodeIndex, expectedValues) {
								var targetCache = map ? (map.get(target) || map.set(target, [])) : (target.__render_cache || (target.__render_cache = []));
								// Lookup the cache for the particular node
								var nodeCache = targetCache[nodeIndex];
								// Check if all the dependent values match
								if (expectedValues && nodeCache) {
									for (var i = 0; i < expectedValues.length; i++) {
										if (nodeCache.v[i] !== expectedValues[i]) {
											nodeCache = 0;
											break;
										}
									}
								}
								// Return the cached value we found
								if (nodeCache) {
									return nodeCache._;
								}
								// Prepare a new cache for the node and make it pending
								__render_pending = targetState[nodeIndex] = { v: expectedValues };
							}
						})();`)());
						path.stop();
					}
				}
			}
		}
	};
}
