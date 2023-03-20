import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indiancurrency'
})
export class CurrenecyPipe implements PipeTransform {
  transform(input:number) {
    // return items.filter(item => item.id == id)[0];
    // console.log(input);
    
    if (! isNaN(input) && input !== null) {
        var currencySymbol = '₹';
        //var output = Number(input).toLocaleString('en-IN');   <-- This method is not working fine in all browsers!           
        var result = input?.toString().split('.');

        var lastThree = result[0]?.substring(result[0].length - 3);
        var otherNumbers = result[0]?.substring(0, result[0].length - 3);
        if (otherNumbers != '')
            lastThree = ',' + lastThree;
        var output = otherNumbers?.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
        
        if (result.length > 1) {
            output += "." + result[1];
        }            

        return currencySymbol + output;
    }
  }
}