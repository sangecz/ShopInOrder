var myToast = {

    last : {
        bottom: false,
        top: true,
        left: false,
        right: true
    },

    toastPosition : angular.extend({}, this.last),

    getToastPosition : function() {
        myToast.sanitizePosition();
        return Object.keys(myToast.toastPosition)
            .filter(function(pos) { return myToast.toastPosition[pos]; })
            .join(' ');
    },

    sanitizePosition: function() {
        var current = myToast.toastPosition;
        if ( current.bottom && last.top ) current.top = false;
        if ( current.top && last.bottom ) current.bottom = false;
        if ( current.right && last.left ) current.left = false;
        if ( current.left && last.right ) current.right = false;
        myToast.last = angular.extend({},current);
    },

    showToast : function(msg, $mdToast){
        $mdToast.show(
            $mdToast.simple()
                .textContent(msg)
                .position(myToast.getToastPosition())
                .hideDelay(2000)
        );
    }

};