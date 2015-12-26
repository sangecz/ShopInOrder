myUtils = {


    hasDuplicates : function( A ) {
        var i, j, n;
        n=A.length;
        // to ensure the fewest possible comparisons
        for (i=0; i<n; i++) {                    // outer loop uses each item i at 0 through n
            for (j=i+1; j<n; j++) {              // inner loop only compares items j at i+1 to n
                if (A[i].id==A[j].id) return true;
            }	}
        return false;
    }
};