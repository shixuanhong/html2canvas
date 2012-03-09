/*
  html2canvas @VERSION@ <http://html2canvas.hertzen.com>
  Copyright (c) 2011 Niklas von Hertzen. All rights reserved.
  http://www.twitter.com/niklasvh
  
  Contributor(s):
      Niklas von Hertzen <http://www.twitter.com/niklasvh>
      André Fiedler      <http://www.twitter.com/sonnenkiste>

  Released under MIT License
 */

(function(){
    
_html2canvas.Generate = {};

/*
-webkit-gradient(radial, 45 45, 10, 52 50, 30, from(rgb(167, 211, 12)), color-stop(0.9, rgb(1, 159, 98)), to(rgba(1, 159, 98, 0))), -webkit-gradient(radial, 105 105, 20, 112 120, 50, from(rgb(255, 95, 152)), color-stop(0.75, rgb(255, 1, 136)), to(rgba(255, 1, 136, 0))), -webkit-gradient(radial, 95 15, 15, 102 20, 40, from(rgb(0, 201, 255)), color-stop(0.8, rgb(0, 181, 226)), to(rgba(0, 201, 255, 0))), -webkit-gradient(radial, 0 150, 50, 0 140, 90, from(rgb(244, 242, 1)), color-stop(0.8, rgb(228, 199, 0)), to(rgba(228, 199, 0, 0)))

-webkit-radial-gradient(50% 50%, ellipse cover, rgb(149, 149, 149) 0%, rgb(13, 13, 13) 48%, rgb(47, 123, 216) 50%, rgb(10, 10, 10) 64%, rgb(78, 78, 78) 80%, rgb(56, 56, 56) 87%, rgb(27, 27, 27) 100%)
-webkit-radial-gradient(75% 19%, ellipse closest-side, rgb(171, 171, 171), rgb(0, 0, 255) 33%, rgb(153, 31, 31) 100%)
-webkit-radial-gradient(75% 19%, ellipse closest-corner, rgb(171, 171, 171), rgb(0, 0, 255) 33%, rgb(153, 31, 31) 100%)
-webkit-radial-gradient(75% 19%, ellipse farthest-side, rgb(171, 171, 171), rgb(0, 0, 255) 33%, rgb(153, 31, 31) 100%)
-webkit-radial-gradient(75% 19%, ellipse farthest-corner, rgb(171, 171, 171), rgb(0, 0, 255) 33%, rgb(153, 31, 31) 100%)
-webkit-radial-gradient(75% 19%, ellipse contain, rgb(171, 171, 171), rgb(0, 0, 255) 33%, rgb(153, 31, 31) 100%)
-webkit-radial-gradient(75% 19%, ellipse cover, rgb(171, 171, 171), rgb(0, 0, 255) 33%, rgb(153, 31, 31) 100%)
-webkit-radial-gradient(100% 19%, ellipse cover, rgb(171, 171, 171), rgb(0, 0, 255) 33%, rgb(153, 31, 31) 100%)
-webkit-radial-gradient(0% 19%, ellipse cover, rgb(171, 171, 171), rgb(0, 0, 255) 33%, rgb(153, 31, 31) 100%)
-webkit-radial-gradient(0% 0%, circle cover, rgb(171, 171, 171), rgb(0, 0, 255) 33%, rgb(153, 31, 31) 100%)
*/

var reGradients = [
    /^(-webkit-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,
    /^(-o-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,
    /^(-webkit-gradient)\((linear|radial),\s((?:\d{1,3}%?)\s(?:\d{1,3}%?),\s(?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)-]+)\)$/,
    /^(-moz-linear-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)]+)\)$/,
    /^(-webkit-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(ellipse|circle)\s(contain|cover|farthest-corner|closest-corner|farthest-side|closest-side)((?:,\s(?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}%)?)+)\)$/
];

/*
 * TODO: Add IE10 vendor prefix (-ms) support
 * TODO: Add W3C gradient (linear-gradient) support
 * TODO: Add radial gradient parsing
 * TODO: Maybe some RegExp optimizations are possible ;o)
 */
_html2canvas.Generate.parseGradient = function(css, bounds) {  
    var gradient, i, len = reGradients.length, m1, stop, m2, m2Len, step, m3;
    
    for(i = 0; i < len; i+=1){
        m1 = css.match(reGradients[i]);
        if(m1) break;
    }
    
    if(m1) {
        switch(m1[1]) {
            case '-webkit-linear-gradient':
            case '-o-linear-gradient':
                
                gradient = {
                    type: 'linear',
                    x0: null,
                    y0: null,
                    x1: null,
                    y1: null,
                    colorStops: []
                };
                
                // get coordinates
                m2 = m1[2].match(/\w+/g);
                if(m2){
                    m2Len = m2.length;
                    for(i = 0; i < m2Len; i+=1){
                        switch(m2[i]) {
                            case 'top':
                                gradient.y0 = 0;
                                gradient.y1 = bounds.height;
                                break;
                                
                            case 'right':
                                gradient.x0 = bounds.width;
                                gradient.x1 = 0;
                                break;
                                
                            case 'bottom':
                                gradient.y0 = bounds.height;
                                gradient.y1 = 0;
                                break;
                                
                            case 'left':
                                gradient.x0 = 0;
                                gradient.x1 = bounds.width;
                                break;
                        }
                    }
                }
                if(gradient.x0 === null && gradient.x1 === null){ // center
                    gradient.x0 = gradient.x1 = bounds.width / 2;
                }
                if(gradient.y0 === null && gradient.y1 === null){ // center
                    gradient.y0 = gradient.y1 = bounds.height / 2;
                }
                
                // get colors and stops
                m2 = m1[3].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g);
                if(m2){
                    m2Len = m2.length;
                    step = 1 / Math.max(m2Len - 1, 1);
                    for(i = 0; i < m2Len; i+=1){
                        m3 = m2[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/);
                        if(m3[2]){
                            stop = parseFloat(m3[2]);
                            if(m3[3] === '%'){
                                stop /= 100;
                            } else { // px - stupid opera
                                stop /= bounds.width;
                            }
                        } else {
                            stop = i * step;
                        }
                        gradient.colorStops.push({
                            color: m3[1],
                            stop: stop
                        });
                    }
                }
                break;
                
            case '-webkit-gradient':
                
                gradient = {
                    type: m1[2],
                    x0: 0,
                    y0: 0,
                    x1: 0,
                    y1: 0,
                    colorStops: []
                };
                
                // get coordinates
                m2 = m1[3].match(/(\d{1,3})%?\s(\d{1,3})%?,\s(\d{1,3})%?\s(\d{1,3})%?/);
                if(m2){
                    gradient.x0 = (m2[1] * bounds.width) / 100;
                    gradient.y0 = (m2[2] * bounds.height) / 100;
                    gradient.x1 = (m2[3] * bounds.width) / 100;
                    gradient.y1 = (m2[4] * bounds.height) / 100;
                }
                
                // get colors and stops
                m2 = m1[4].match(/((?:from|to|color-stop)\((?:[0-9\.]+,\s)?(?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)\))+/g);
                if(m2){
                    m2Len = m2.length;
                    for(i = 0; i < m2Len; i+=1){
                        m3 = m2[i].match(/(from|to|color-stop)\(([0-9\.]+)?(?:,\s)?((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\)/);
                        stop = parseFloat(m3[2]);
                        if(m3[1] === 'from') stop = 0.0;
                        if(m3[1] === 'to') stop = 1.0;
                        gradient.colorStops.push({
                            color: m3[3],
                            stop: stop
                        });
                    }
                }
                break;
                
            case '-moz-linear-gradient':
                
                gradient = {
                    type: 'linear',
                    x0: 0,
                    y0: 0,
                    x1: 0,
                    y1: 0,
                    colorStops: []
                };
                
                // get coordinates
                m2 = m1[2].match(/(\d{1,3})%?\s(\d{1,3})%?/);
                
                // m2[1] == 0%   -> left
                // m2[1] == 50%  -> center
                // m2[1] == 100% -> right
                
                // m2[2] == 0%   -> top
                // m2[2] == 50%  -> center
                // m2[2] == 100% -> bottom
                
                if(m2){
                    gradient.x0 = (m2[1] * bounds.width) / 100;
                    gradient.y0 = (m2[2] * bounds.height) / 100;
                    gradient.x1 = bounds.width - gradient.x0;
                    gradient.y1 = bounds.height - gradient.y0;
                }
                
                // get colors and stops
                m2 = m1[3].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}%)?)+/g);
                if(m2){
                    m2Len = m2.length;
                    step = 1 / Math.max(m2Len - 1, 1);
                    for(i = 0; i < m2Len; i+=1){
                        m3 = m2[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/);
                        if(m3[2]){
                            stop = parseFloat(m3[2]);
                            if(m3[3]){ // percentage
                                stop /= 100;
                            }
                        } else {
                            stop = i * step;
                        }
                        gradient.colorStops.push({
                            color: m3[1],
                            stop: stop
                        });
                    }
                }
                break;
                
            case '-webkit-radial-gradient':
                console.log(m1);
                
                gradient = {
                    type: 'radial',
                    x0: 0,
                    y0: 0,
                    x1: bounds.width,
                    y1: bounds.height,
                    cx: 0,
                    cy: 0,
                    rx: 0,
                    ry: 0,
                    colorStops: []
                };
                
                // center
                m2 = m1[2].match(/(\d{1,3})%?\s(\d{1,3})%?/);
                if(m2){
                    gradient.cx = (m2[1] * bounds.width) / 100;
                    gradient.cy = (m2[2] * bounds.height) / 100;
                }
                
                // size
                m2 = m1[3].match(/ellipse|circle/);
                m3 = m1[4].match(/contain|cover|farthest-corner|closest-corner|farthest-side|closest-side/);
                if(m2 && m3){
                    switch(m3[0]){
                        case 'farthest-corner':
                        case 'cover': // is equivalent to farthest-corner
                            var tl = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.cy, 2));
                            var tr = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                            var br = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                            var bl = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.cy, 2));
                            gradient.rx = gradient.ry = Math.max(tl, tr, br, bl);
                            break;
                        case 'closest-corner':
                            var tl = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.cy, 2));
                            var tr = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                            var br = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                            var bl = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.cy, 2));
                            gradient.rx = gradient.ry = Math.min(tl, tr, br, bl);
                            break;
                        case 'farthest-side':
                            if(m2[0] == 'circle'){
                                gradient.rx = gradient.ry = Math.max(
                                    gradient.cx,
                                    gradient.cy,
                                    gradient.x1 - gradient.cx,
                                    gradient.y1 - gradient.cy
                                );
                            } else { // ellipse
                            
                                h2clog('No ellipse gradient supported by now, cause canvas can´t draw ellipse :(');
                                
                                gradient.rx = Math.max(
                                    gradient.cx,
                                    gradient.x1 - gradient.cx
                                );
                                gradient.ry = Math.max(
                                    gradient.cy,
                                    gradient.y1 - gradient.cy
                                );
                            }
                            break;
                        case 'closest-side':
                        case 'contain': // is equivalent to closest-side
                            if(m2[0] == 'circle'){
                                gradient.rx = gradient.ry = Math.min(
                                    gradient.cx,
                                    gradient.cy,
                                    gradient.x1 - gradient.cx,
                                    gradient.y1 - gradient.cy
                                );
                            } else { // ellipse
                            
                                h2clog('No ellipse gradient supported by now, cause canvas can´t draw ellipse :(');
                            
                                gradient.rx = Math.min(
                                    gradient.cx,
                                    gradient.x1 - gradient.cx
                                );
                                gradient.ry = Math.min(
                                    gradient.cy,
                                    gradient.y1 - gradient.cy
                                );
                            }
                            break;
                        
                        // TODO: add support for "30px 40px" sizes (webkit only)
                    }
                }
                
                // color stops
                m2 = m1[5].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}%)?)+/g);
                if(m2){
                    m2Len = m2.length;
                    step = 1 / Math.max(m2Len - 1, 1);
                    for(i = 0; i < m2Len; i+=1){
                        m3 = m2[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/);
                        if(m3[2]){
                            stop = parseFloat(m3[2]);
                            if(m3[3]){ // percent
                                stop /= 100;
                            }
                        } else {
                            stop = i * step;
                        }
                        gradient.colorStops.push({
                            color: m3[1],
                            stop: stop
                        });
                    }
                }
                break;
        }
    }
    
    console.log(gradient);
    
    return gradient;
};

_html2canvas.Generate.Gradient = function(src, bounds) {
    var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    gradient, grad, i, len, img;
    
    canvas.width = bounds.width;
    canvas.height = bounds.height;
    
    gradient = _html2canvas.Generate.parseGradient(src, bounds);
    
    img = new Image();
    
    if(gradient && gradient.type === 'linear'){
        grad = ctx.createLinearGradient(gradient.x0, gradient.y0, gradient.x1, gradient.y1);
        
        for (i = 0, len = gradient.colorStops.length; i < len; i+=1) {
            try {
                grad.addColorStop(gradient.colorStops[i].stop, gradient.colorStops[i].color);
            }
            catch(e) {
                h2clog(['failed to add color stop: ', e, '; tried to add: ', gradient.colorStops[i], '; stop: ', i, '; in: ', src]);
            }
        }
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, bounds.width, bounds.height);
    
        img.src = canvas.toDataURL();
    } else if(gradient && gradient.type === 'radial'){
        grad = ctx.createRadialGradient(gradient.cx, gradient.cy, 0, gradient.cx, gradient.cy, gradient.rx);
        
        for (i = 0, len = gradient.colorStops.length; i < len; i+=1) {
            try {
                grad.addColorStop(gradient.colorStops[i].stop, gradient.colorStops[i].color);
            }
            catch(e) {
                h2clog(['failed to add color stop: ', e, '; tried to add: ', gradient.colorStops[i], '; stop: ', i, '; in: ', src]);
            }
        }
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, bounds.width, bounds.height);
    
        img.src = canvas.toDataURL();
    }
    
    return img;
};

_html2canvas.Generate.ListAlpha = function(number) {
    var tmp = "",
    modulus;
    
    do {
        modulus = number % 26; 
        tmp = String.fromCharCode((modulus) + 64) + tmp;
        number = number / 26;
    }while((number*26) > 26);
   
    return tmp;  
};

_html2canvas.Generate.ListRoman = function(number) {
    var romanArray = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"],
    decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
    roman = "",
    v,
    len = romanArray.length;

    if (number <= 0 || number >= 4000) { 
        return number;
    }
    
    for (v=0; v < len; v+=1) {
        while (number >= decimal[v]) { 
            number -= decimal[v];
            roman += romanArray[v];
        }
    }
        
    return roman;
   
};

})();