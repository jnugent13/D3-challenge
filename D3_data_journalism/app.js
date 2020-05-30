//Set up svg container area
var svgWidth = 960;
var svgHeight = 520;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)

//Append an svg group to hold chart and shift by left and top margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obese";

//Update x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain(d3.extent(stateData, d => d.chosenXAxis))
      .range([0, width]);
  
    return xLinearScale;
  };

//Update y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain(d3.extent(stateData, d => d.chosenYAxis))
      .range([height, 0]);
  
    return yLinearScale;
  };

//Update xAxis var upon click on axis label
function renderAxes(newXScale, newYScale, xAxis, yAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    var leftAxis = d3.axisLeft(newYScale);
    
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    
      return xAxis;
    
    yAxis.transition()
        .duration(1000)
        .call(leftAxis)
    
        return yAxis;
  };

//Update circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d.chosenXAxis))
      .attr("cy", d => newYScale(d.chosenYAxis));
    
      return circlesGroup;
  };

// // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;
  
    if (chosenXAxis === "poverty") {
      xLabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
      xlabel = "Age:";
    }
    else {
        xLabel = "Household Income:"
    };

    var yLabel;

    if (chosenYAxis === "obese") {
        yLabel = "Obesity:"
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smoking:"
    }
    else {
        yLabel = "% Lacking Healthcare: "
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xLabel} ${d.chosenXAxis}<br> ${yLabel} ${d.chosenYAxis}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  
    return circlesGroup;
  };

//Retrieve data from csv file
d3.csv("D3_data_journalism/data/data.csv").then(function(stateData, err) {
    if (err) throw err;

    // parse data
    stateData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.povertyMoe = +data.povertyMoe;
        data.age = +data.age;
        data.ageMoe = +data.ageMoe;
        data.income = +data.income;
        data.incomeMoe = data.incomeMoe;
        data.healthcare = +data.healthcare;
        data.healthcareLow = +data.healthcareLow;
        data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        data.obesityLow = +data.obesityLow;
        data.obesityHigh = +data.obesityHigh;
        data.smokes = +data.smokes;
        data.smokesLow = +data.smokesLow;
        data.smokesHigh = +data.smokesHigh;
    });
    
    // xLinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
                        .classed("x-axis", true)
                        .attr("transform", `translate(0, ${height})`)
                        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
                        .classed("y-axis", true)
                        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
                                .data(stateData)
                                .enter()
                                .append("circle")
                                .classed("stateCircle", true)
                                .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                .attr("cy", d => yLinearScale(d.num_hits))
                                .attr("r", 20);
    
    var circleText = circlesGroup.attr("text", d => d.abbr)
                                .classed("stateText", true);
    
    // Create group for three x-axis labels
    var labelsGroupX = chartGroup.append("g")
                    .attr("transform", `translate(${width / 2}, ${height + 20})`)
                    .classed("aText", true);

    var povertyLabel = labelsGroupX.append("text")
                                    .attr("x", 0)
                                    .attr("y", 20)
                                    .attr("value", "poverty") // value to grab for event listener
                                    .classed("active", true)
                                    .text("In Poverty (%)");

    var ageLabel = labelsGroupX.append("text")
                                .attr("x", 0)
                                .attr("y", 40)
                                .attr("value", "age") // value to grab for event listener
                                .classed("inactive", true)
                                .text("Age (Median)");
    
    var incomeLabel = labelsGroupX.append("text")
                                .attr("x", 0)
                                .attr("y", 60)
                                .attr("value", "income") // value to grab for event listener
                                .classed("inactive", true)
                                .text("Household Income (Median)");

    // Create group for three x-axis labels
    var labelsGroupY = chartGroup.append("g")
                                .attr("transform", "rotate(-90)")
                                .attr("y", 0 - margin.left)
                                .attr("x", 0 - (height / 2))
                                .attr("dy", "1em")
                                .classed("aText", true);
    
    var obeseLabel = labelsGroupY.append("text")
                                .attr("x", 0)
                                .attr("y", 20)
                                .attr("value", "obese")  // value to grab for event listener
                                .classed("active", true)
                                .text("Obese (%)");
    
    var smokesLabel = labelsGroupY.append("text")
                                .attr("x", 0)
                                .attr("y", 40)
                                .attr("value", "smokes")  // value to grab for event listener
                                .classed("inactive", true)
                                .text("Smokes (%)");
    
    var healthcareLabel = labelsGroupY.append("text")
                                .attr("x", 0)
                                .attr("y", 60)
                                .attr("value", "healthcare")  //value to grab for event listener
                                .classed("inactive", true)
                                .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var xValue = d3.select(this).attr("value");
            if (xValue !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(stateData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
              povertyLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            };
          
          var yValue = d3.select(this).attr("value");
            if (yValue !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;

            console.log(chosenYAxis)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(stateData, chosenYAxis);

            // updates x axis with transition
            yAxis = renderAxes(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "obese") {
              obseseLabel
                .classed("active", true)
                .classed("inactive", false);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenXAxis === "smokes") {
              obeseLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", true)
                .classed("inactive", false);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              obeseLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            };
        };
    };
    }).catch(function(error) {
        console.log(error);
    });
});