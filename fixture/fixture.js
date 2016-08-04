"use strict";
var Foo = (function () {
    function Foo() {
        this.content = ["foo"];
    }
    Foo.prototype.toString = function () {
        var toUpper = function (op) { return op.toUpper(); };
        var combine = function (op1, op2) {
            return op1 + op2;
        };
        return this.content.reduce(combine, "");
    };
    return Foo;
}());
exports.Foo = Foo;
//# sourceMappingURL=fixture.js.map