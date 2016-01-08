/**
 * Created by sange on 08/01/16.
 */

module.exports = {

    isArray: function(o){
        return Object.prototype.toString.call(o) === '[object Array]';
    },

    isNumber: function(o) {
        return /^\d+$/.test(o);
    }


};