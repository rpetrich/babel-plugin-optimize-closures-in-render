class MyComponent {
	render() {
		const { onSubmit, value, anotherValue } = this.props;

		const wrappedMethod = this._value === (this._value = value) & this._cached || (this._cached = () => this.someMethod(value));
		const boundMethod = this._anotherValue === (this._anotherValue = anotherValue) & (this._value2 === (this._value2 = value) & this._cached2) || (this._cached2 = this.someMethod.bind(this, value, anotherValue));

		return React.createElement("button", {
			onClick: this._anotherValue2 === (this._anotherValue2 = anotherValue) & (this._value3 === (this._value3 = value) & (this._onSubmit === (this._onSubmit = onSubmit) & (this._event2 === (this._event2 = event) & this._cached3))) || (this._cached3 = event => onSubmit(value, anotherValue, event)),
			onBlur: boundMethod
		});
	}
}

