export class Foo {
    protected content: string[] = ["foo"];
    public toString() {
        var toUpper = function (op) { return op.toUpper() };
        var combine = (op1: string, op2: string): string => {
            return op1 + op2;
        }

        return this.content.reduce(combine, "");
    }
}