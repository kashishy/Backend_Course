/*var reac = {
    perimeter: (x,y) => (2*(x+y)),
    area: (x,y) => (x*y)
};*/

var reac = require('./reactangle');

function calculate(l,b){
    console.log("Area of reactangle with l = "+l+" and b = "+b);
    reac(l,b, (err, reactangle) => {
        if(err) {
            console.log("ERROR "+err.message);
        }
        else{
            console.log("Area of reactangle "+ reactangle.area());
            console.log("Perimeter of reactangle "+ reactangle.perimeter());
        }
    });
    console.log("This message after callback");

    /*if(l<=0 || b<=0){
        console.log("Length and breath should be greater than 0");
    }
    else{
        console.log("Area is "+reac.area(l,b));
        console.log("Perimeter is "+reac.perimeter(l,b));
    }*/
}
calculate(2,3);
calculate(5,8);
calculate(-1,2);