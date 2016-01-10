/**
 * Created by sange on 08/01/16.
 */

module.exports = {

    isArray: function(o){
        return Object.prototype.toString.call(o) === '[object Array]';
    },

    isNumber: function(o) {
        return /^\d+$/.test(o);
    },

    isJSON: function(text){
        try {
            JSON.parse(text);
            return true;
        } catch (error){
            return false;
        }
    },

    hasDuplicates: function(arr) {
        var i, j, n;
        n=arr.length;
        // to ensure the fewest possible comparisons
        for (i=0; i<n; i++) {                    // outer loop uses each item i at 0 through n
            for (j=i+1; j<n; j++) {              // inner loop only compares items j at i+1 to n
                if (arr[i]==arr[j]) return true;
            }	}
        return false;
    }


};