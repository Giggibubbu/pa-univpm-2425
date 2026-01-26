export class User{
    private _name: string;
    private _surname: string;
    constructor(name:string, surname:string){                
        this._name = this.validatorStr(name);
        this._surname = this.validatorStr(surname);
    }

    get name():string{
        return this._name;
    }
    set name(name:string){
        this._name = this.validatorStr(name);
    }
    get surname():string{
        return this._surname;
    }
    set surname(surname:string){
        this._surname = this.validatorStr(surname);
    }

    private validatorStr(value:string, minLen=3):string|never{
        const val:string = value.trim();
        if(val.length >= minLen)
            return val;        
        throw new Error("invalid name");
    }
    public print(): void{
        console.log(this);
    }
}

const p1 = new User("adriano","mancini");

describe("user test", () =>{
    let p1:User;
    beforeEach( ()=>{
        console.log("run...");
        p1 = new User("adriano","mancini");
    });
    test('constructor', () => {
        expect(p1.name).toBe("ciccio");
        expect(p1.surname).toBe("lillo");        
    }); 
    test('constructor', () => {        
       expect(() => {p1.name = ""}).toThrow(Error);
       expect(() => {p1.surname = ""}).toThrow(Error);
    }); 
});
describe("user test exp", ()=>{
    test('exception', () =>{
        expect( () => new User("","")).toThrow(Error);
    });  
});