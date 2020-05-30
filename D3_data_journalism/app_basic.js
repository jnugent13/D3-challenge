var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create x and y scales for data
// function used for updating x-scale var upon click on axis label
function xScale(stateData) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([0, d3.min(stateData, d => d.poverty)])
      .range([0, width]);
  
    return xLinearScale;
  };

  function yScale(stateData) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.min(stateData, d => d.healthcare)])
      .range([height, 0]);
  
    return yLinearScale;
  };

// Pull data from csv, then add to chart
d3.csv("D3_data_journalism/data/data.csv").then(function(stateData, err) {
    if (err) throw err;

    // parse data
    stateData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xScale(stateData));
    var leftAxis = d3.axisLeft(yScale(stateData));

    // append x axis
    chartGroup.append("g")
        .call(bottomAxis)
        .attr("transform", `translate (0, ${height})`);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // append x axis label
    chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .classed("aText", true)
        .classed("active", true)
        .text("In Poverty (%)")
    
    // append y axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("aText", true)
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    // append circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 10)
        .classed("stateCircle", true);
    
    var circlesText = circlesGroup.append("text")
        .data(stateData)
        .classed("stateText", true);

});