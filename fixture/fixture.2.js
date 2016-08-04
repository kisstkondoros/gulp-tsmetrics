"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fixture_1 = require('./fixture');
var FooBar = (function (_super) {
    __extends(FooBar, _super);
    function FooBar() {
        _super.call(this);
        this.content = ["Foo", "Bar"];
    }
    return FooBar;
}(fixture_1.Foo));
//# sourceMappingURL=fixture.2.js.map