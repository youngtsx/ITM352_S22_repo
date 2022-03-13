var attributes = "Tiffany;20;20.5;-19.5";
var parts_array = attributes.split(";");

parts_array.forEach(checkIt);

pieces.forEach((item,index) => {console.log(`part ${index} is ${(isStringNonNegInt(item)?'a':'not a')} quantity`);} )

function isStringNonNegInt(q, returnErrors = false) { 
    //this function checks if the string is a non negative integer
    errors = []; // assume no errors at first
    if(Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if(q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

    return  (returnErrors ? errors : (errors.length == 0));
}
function checkIt(item, index){
    console.log(`part ${index} is ${(isStringNonNegInt(item)?'a':'not a')} quantity`);
}