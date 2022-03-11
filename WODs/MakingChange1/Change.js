/* coin amounts*/
quarter = 25;
dime = 10;
nickel = 5;
penny = 1;

/*change*/
change = 84;

/* making change*/

quarter_return = parseInt(change/quarter);
remainder = change%quarter;
dime_return = parseInt(remainder/dime);
remainder = change%dime;
nickel_return = Math.round(remainder/nickel);
penny_return = Math.round(change%5);

/* print */
console.log(`The change is ${change}, ${quarter_return} quarters, ${dime_return} dimes, ${nickel_return} nickels, and ${penny_return} pennies.`)