// set the dimensions and margins of the graph
const margin = { top: 70, right: 30, bottom: 30, left: 30 }
const width = 600 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#vis")
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 600 300")
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// parse the Data
d3.csv("./data/new_bar.csv")
    .then(function(data){
        // converting data from multi col to single column to be able to plot 
        // list of value keys
        const typeKeys = data.columns.slice(1);
        // stack the data
        const stack = d3.stack()
            .keys(typeKeys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)
        const finalData = stack(data)

        data.forEach(d => {
            d.Year = d3.timeParse("%Y")(d.Year);
        });

        // X scale and Axis
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.Year))
            .range([0, width])
            // space betwn bars
            .padding(.3);
        svg
            .append('g')
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).tickSize(0).tickPadding(8).tickFormat(d3.timeFormat("%Y")))

        // Y scale and Axis
        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);
        svg
            .append('g')
            .call(d3.axisLeft(yScale).ticks(10, "%").tickSize(0).tickPadding(4))
            .call(d => d.select(".domain").remove());

        // color palette
        const color = d3.scaleOrdinal()
            .domain(typeKeys)
            .range(d3.schemeCategory10);

        // set horizontal grid line
        const GridLine = function() {return d3.axisLeft().scale(yScale)};

        svg
            .append("g")
                .attr("class", "grid")
            .call(GridLine()
                .tickSize(-width,0,0)
                .tickFormat("")
            );

        // get tooltip
        const tooltip = d3.select("#tooltip");

        // create bars
        svg.append("g")
            .selectAll("g")
            .data(finalData)
            .join("g")
                .attr("fill", d => {
                    console.log('in here', d.key, color(d.key))
                    return color(d.key)
                }
                    )
            .selectAll("rect")
            .data(d => d)
            .join("rect")
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .attr("x", d => xScale(d.data.Year))
                .attr("y", d => yScale(d[1]) + yScale(d[0]) - yScale(d[1]))
            .on("mouseover", function(d) {
                    tooltip
                        .style("opacity", 1)
                        .style("display", 'block')
                    d3.select(this)
                        .style("stroke", "yellow")
                        .style("opacity", .6)
                })
            .on("mousemove", function(event,d) {
                const subgroupName = d3.select(this.parentNode).datum().key;
                const subgroupValue = d.data[subgroupName];
                const f = d3.format(".0f");
                tooltip
                    .style('position', 'absolute')
                    .html(`<b>${subgroupName}</b>:  ${f(subgroupValue*100)}%`)
                        .style("top", event.pageY - 10 + "px")
                        .style("left", event.pageX + 10 + "px")
            })
            .on("mouseleave", function(d) {
                tooltip
                    .style("opacity", 0)
                d3.select(this)
                    .style("stroke", "none")
                    .style("opacity", 1)
            })
            .transition()
                .duration(500)
                .attr("y", d => yScale(d[1]))
                .attr("height", d => yScale(d[0]) - yScale(d[1]))
        

        //add legend

        for (const key in typeKeys) {
            let name = typeKeys[key];
            let color_name = color(name);
            console.log(name, color_name, 'colors legend');
            svg.append("rect")
                    .attr("x",  -(margin.left)*0.1+Math.round(width/typeKeys.length)*key)
                    .attr("y", -(margin.top/2.5))
                    .attr("width", 13)
                    .attr("height", 13)
                    .style("fill", color_name)
            svg.append("text")
                    .attr("class", "legend")
                    .attr("x",  20-(margin.left)*0.1 + (Math.round(width/typeKeys.length))*key)
                    .attr("y", -(margin.top/3.5))
                .text(name)
        }
})