const margin = { top: 30, right: 30, bottom: 30, left: 30 }
const width = 400 - margin.left - margin.right;
const height = 150 - margin.top - margin.bottom;
let slope = 0, intercept = 0

const svg = d3.select("#canvas")
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 400 150")
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let points = []
console.log(points);


const xScale = d3.scaleLinear()
  .domain([-10, 10])
  .range([0, width]);

const yScale = d3.scaleLinear()
  .domain([-10, 10])
  .range([height, 0]);

const xAxis = d3.axisBottom(xScale).ticks(10).tickSize(0);
const yAxis = d3.axisLeft(yScale).ticks(10).tickSize(0);

function drawPoints() {
    svg.selectAll(".point")
      .data(points)
      .enter().append("circle")
      .attr("class", "point")
      .attr("id", (d, i) => "point_" + i)
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", 2.5)
      .style("fill", "steelblue")
      .on("click", onClickPoint)
  }

function findIntersectionPoints(m, c) {
    // Define the boundaries of the box
    const minX = -10;
    const maxX = 10;
    const minY = -10;
    const maxY = 10;

    // Initialize an array to store the intersection points
    let intersectionPoints = [];

    // Calculate intersection points with the four sides of the box
    // Left side (x = minX)
    let yLeft = m * minX + c;
    if (yLeft >= minY && yLeft <= maxY) {
        intersectionPoints.push([minX, yLeft]);
    }

    // Right side (x = maxX)
    let yRight = m * maxX + c;
    if (yRight >= minY && yRight <= maxY) {
        intersectionPoints.push([maxX, yRight]);
    }

    // Top side (y = maxY)
    let xTop = (maxY - c) / m;
    if (xTop >= minX && xTop <= maxX) {
        intersectionPoints.push([xTop, maxY]);
    }

    // Bottom side (y = minY)
    let xBottom = (minY - c) / m;
    if (xBottom >= minX && xBottom <= maxX) {
        intersectionPoints.push([xBottom, minY]);
    }

    // Filter out points outside the box boundaries
    intersectionPoints = intersectionPoints.filter(point => {
        let [x, y] = point;
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    });
    
    intersectionPoints.sort((a, b) => {
        if (a[0] !== b[0]) {
            return a[0] - b[0]; // Sort by the first element
        } else {
            return a[1] - b[1]; // If first elements are equal, sort by the second element
        }
    });
    return intersectionPoints;
}

function calculateRegression(){
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    let n = points.length;
    points.forEach(point => {
        sumX += point[0];
        sumY += point[1];
        sumXY += point[0] * point[1];
        sumX2 += point[0] * point[0];
    })
    // console.log(sumX, sumY, sumXY, sumX2)
    slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX **2);
    intercept = (sumY - slope * sumX) / n;
    // console.log(slope, intercept);

    let regressionLine = svg.selectAll(".regression-line")
    .data([1]) // Use dummy data to ensure only one line is drawn

    // regression line points
    res = findIntersectionPoints(slope, intercept)
    // console.log('res', res);
    if(res.length>0){
        regressionLine.enter().append("line")
            .attr("class", "regression-line")
            .merge(regressionLine)
            .transition()
            .duration(500)
            .attr("x1", xScale(res[0][0]))
            .attr("y1", yScale(res[0][1]))
            .attr("x2", xScale(res[1][0]))
            .attr("y2", yScale(res[1][1]))
            .style("stroke", "red")
            .style("stroke-width", 2);
    }
}

function removeAction(){
    // Remove all points
    points = [];
    svg.selectAll(".point").remove();
    svg.selectAll(".perpendicular-line").remove();

    // Remove regression line
    svg.selectAll(".regression-line").remove();
}

function addAxisGridTicks(){
    // add x-axis and y-axis  
    svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "7");

    svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .selectAll("text")
    .style("font-size", "7");


    // add 2-d plane canvas
    svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "white")
    .style("stroke", "black");

    // add lines passing through origin
    svg.append("line")
    .attr("x1", xScale(-10))
    .attr("y1", yScale(0))
    .attr("x2", xScale(10))
    .attr("y2", yScale(0))
    .style("stroke", "black")
    .style("stroke-width", 1);

    svg.append("line")
    .attr("x1", xScale(0))
    .attr("y1", yScale(-10))
    .attr("x2", xScale(0))
    .attr("y2", yScale(10))
    .style("stroke", "black")
    .style("stroke-width", 1);


    // add horizontal grid lines
    svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""))
    .selectAll("line")
    .style("stroke", "lightgrey")
    .style("stroke-width", "0.5px")
    .style("stroke-opacity", 1);

    // Draw vertical grid lines
    svg.append("g")
    .attr("class", "grid")
    .call(d3.axisBottom(xScale).tickSize(height).tickFormat(""))
    .selectAll("line")
    .style("stroke", "lightgrey")
    .style("stroke-width", "0.5px")
    .style("stroke-opacity", 1);


}

function redraw() {
    // Redraw points
    svg.selectAll(".point").remove(); // Remove existing points
    calculateRegression(); // Recalculate regression line
    drawPoints(); // Redraw points

    // Redraw regression line
}

function onClickPoint(point, ind) {
     // Retrieve the id of the clicked circle element
     let pointId = d3.select(this).attr("id");
     // Extract the index from the id
     let index = parseInt(pointId.split("_")[1]);
     
     console.log('onpoint click', points, 'pointId', pointId, 'index', index);
     
     points.splice(index, 1); // Remove the point from the list
     if(points.length < 2){
        svg.selectAll(".regression-line").remove();
     }
     redraw(); //
}

function onClickSVG(event) {
    let coords = d3.pointer(event);
    let x = xScale.invert(coords[0]);
    let y = yScale.invert(coords[1]);

    let isOnCircle = event.target.classList.contains("point");
    let isOnRegressionLine = event.target.classList.contains("regression-line");

    if (!isOnCircle && !isOnRegressionLine) {
        console.log('svg onpoint click', x, y, event);
        // Add the new point to the list
        points.push([x, y]);
    
        redraw(); // Redraw the points and regression line
    }
}

svg.on("click", function(event) {onClickSVG(event)});
addAxisGridTicks()