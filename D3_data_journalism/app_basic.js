var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Pull data from csv, then add to chart
d3.csv("D3_data_journalism/data/data.csv").then(function(stateData, err) {
  if (err) throw err;

  // parse data
  stateData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
  });
  
  // create scale functions
  var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(stateData, d => d.poverty))
    .range([0, chartWidth]);
    
  var yLinearScale = d3.scaleLinear()
    .domain(d3.extent(stateData, d => d.healthcare))
    .range([chartHeight, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    chartGroup.append("g")
        .attr("transform", `translate (0, ${chartHeight})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // append x axis label
    chartGroup.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`)
        .attr("x", 0)
        .attr("y", 20)
        .classed("aText", true)
        .classed("active", true)
        .text("In Poverty (%)")
    
    // append y axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (chartHeight / 2))
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
        .attr("cy", d => xLinearScale(d.healthcare))
        .attr("r", 15)
        .classed("stateCircle", true);
    
    var circlesText = circlesGroup.append("g")
      .selectAll("text")
      .data(stateData)
      .enter()
      .append("text", d => d.abbr)
      .classed("stateText", true);
  
}).catch(function(err) {
  console.log(err)
});