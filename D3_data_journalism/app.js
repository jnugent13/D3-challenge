var svgWidth = 960;
var svgHeight = 520;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
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

// Append an SVG group to hold chart and shift it by top and left margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

//Update x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain(d3.extent(stateData, d => d[chosenXAxis]))
      .range([0, chartWidth]);
  
    return xLinearScale;
};

//Update y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain(d3.extent(stateData, d => d[chosenYAxis]))
      .range([chartHeight, 0]);
  
    return yLinearScale;
};

//Update xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    
      return xAxis;
};

//Update yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    
      return yAxis;
};

// function used for updating  tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;
  
    if (chosenXAxis === "poverty") {
      xLabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        xLabel = "Age:";
    }
    else {
      xLabel = "Household Income:";
    }

    var yLabel;

    if (chosenYAxis === "obesity") {
        yLabel = "Obesity:"
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokes:"
    }
    else {
        yLabel = "Lacks Healthcare:"
    }

    // Step 1: Append tooltip div
    var toolTip = d3.select("body")
      .append("div")
      .classed("d3-tip", true);

    // Step 2: Create "mouseover" event listener to display tooltip
    circlesGroup.on("mouseover", function(d) {
      toolTip.style("display", "block")
          .html(`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");
    })
      // Step 3: Create "mouseout" event listener to hide tooltip
      .on("mouseout", function() {
        toolTip.style("display", "none");
      });
  };  

//Update circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    
    circlesGroup
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]))
        .transition()
        .duration(1000);
    
      return circlesGroup;
  };

// Import Data
d3.csv("D3_data_journalism/data/data.csv").then(function(stateData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    // Step 2: Create scale functions for x and y axis
    // ==============================
    var xLinearScale = xScale(stateData, chosenXAxis);
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);
    
    // Step 5: Create Initial Circles
    // ==============================
    var circlesGroup = chartGroup.append("g")
        .selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "10")
        .classed("stateCircle", true)
        .classed("chart", true);
    
    var circlesText = chartGroup.append("g")
        .selectAll("text")
        .data(stateData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("text", d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => xLinearScale(d[chosenYAxis]));
    
    // Step 6: Create group for three x-axis labels  
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("aText", true)
        .classed("active", true)
        .text("In Poverty (%)");
    
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("aText", true)
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") //value to grab for event listener
        .classed("aText", true)
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    // Step 7: Create group for three y-axis labels  
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight/2))
        .attr("dy", "1em");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (chartHeight/2))
        .attr("value", "obesity") //value to grab for event listener
        .classed("aText", true)
        .classed("active", true)
        .text("Obese (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (chartHeight/2))
        .attr("value", "smokes") //value to grab for event listener
        .classed("aText", true)
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - (chartHeight/2))
        .attr("value", "healthcare") //value to grab for event listener
        .classed("aText", true)
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(stateData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "income") {
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false)
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }
            else {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true)
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true)
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
            };
        }
    });

    yLabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
            // replaces chosenXAxis with value
            chosenYAxis = value;

            console.log(chosenYAxis)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(stateData, chosenYAxis);

            // updates x axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "smokes") {
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false)
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }
            else {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true)
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true)
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
            };
        };
  })
}).catch(function(err) {
    console.log(err)
});