day = 26;
month = 1;
year = 2002;

step1 = 02;
step2 = parseInt(step1/4); //0
step3= step2+step1; //2
step8= step3+day; //28
step9= step8-1; //not a leap year
step10 = step9 % 7; 
console.log(step10); //6