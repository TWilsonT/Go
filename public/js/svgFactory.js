/* Source: SEng 299 Lab 4 */


//  Namespace for SVG elements
var SVGNameSpace = "http://www.w3.org/2000/svg";

/**
 * Makes a new SVG line object and returns it. 
 *
 * @param x1 {number} 
 * @param y1 {number}
 * @param x2 {number}
 * @param y2 {number}
 * @param color {string} the color of the line
 * @param stroke {number} the thickness of the line.
 * @returns {object}
 */
function makeLine(x1, y1, x2, y2, color, stroke) {
    var line = document.createElementNS(SVGNameSpace, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.style.stroke = color || "#000000";
    line.style.strokeWidth = stroke || 2;
    return line;
}

/**
 * Makes and returns a new SVG rectangle object. 
 * 
 * @param x {number} the x position of the rectangle.
 * @param y {number} the y position of the rectangle.
 * @param w {number} the width of the rectangle.
 * @param h {number} the height of the rectangle.
 * @param c {string} the color of the rectangle. 
 * 
 * @return {object} 
 */
function makeRectangle(x, y, w, h, c) {
	//make bacgroud whiteSpac
	//TODO
    var rect = document.createElementNS(SVGNameSpace, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", w);
    rect.setAttribute("height", h);
    rect.style.fill = c;
    return rect;
}

/**
 * Makes and returns a new SVG circle object. 
 * 
 * @param x {number} the x position of the circle.
 * @param y {number} the y position of the circle.
 * @param r {number} the radius 
 * @param c {number} the color 
 * @param stroke {number} the thickness of the line.
 * 
 * @return {object} 
 */
function makeCircle(x, y, r, c, stroke) {
    var circ = document.createElementNS(SVGNameSpace, "circle");
    circ.setAttribute("cx", x);
    circ.setAttribute("cy", y);
    circ.setAttribute("r", r);
    circ.style.fill = c;
    circ.style.stroke = stroke;
    circ.style.strokeWidth = 3;
    return circ;
}

/**
 * Makes an SVG element. 
 * 
 * @param w {number} the width
 * @param h {number} the height 
 * 
 * @return {object} 
 */
function makeSVG(w, h) {
    var s = document.createElementNS(SVGNameSpace, "svg");
    s.setAttribute("width", w);
    s.setAttribute("height", w);
    s.setAttribute('xmlns', SVGNameSpace);
    s.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
    return s;
}