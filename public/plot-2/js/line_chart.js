class FocusContextVis {
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        width: 800,
        height: 400,
        margin: { top: 30, right: 30, bottom: 30, left: 30 },
      }
      this.data = _data;
    }
  
    // Initialize scales/axes and append static chart elements
    initVis() {
      let vis = this;
  
      const containerWidth = vis.config.width + vis.config.margin.left + vis.config.margin.right;
      const containerHeight = vis.config.height + vis.config.margin.top + vis.config.margin.bottom;
  
      vis.xScaleFocus = d3.scaleTime()
        .range([0, vis.config.width]);
  
      vis.yScaleFocus = d3.scaleLinear()
        .range([vis.config.height, 0])
        .nice();
  
      // Initialize axes
      vis.xAxisFocus = d3.axisBottom(vis.xScaleFocus).tickSizeOuter(0);
      vis.yAxisFocus = d3.axisLeft(vis.yScaleFocus);
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
        .attr('width', containerWidth)
        .attr('height', containerHeight);
  
      // Append focus group with x- and y-axes
      vis.focus = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      vis.focusLinePath = vis.focus.append('path')
        .attr('class', 'chart-line');
  
      vis.focusLinePath2 = vis.focus.append('path')
        .attr('class', 'chart-line-2');
  
      vis.xAxisFocusG = vis.focus.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.config.height})`);
  
      vis.yAxisFocusG = vis.focus.append('g')
        .attr('class', 'axis y-axis');
  
      vis.tooltip = vis.focus.append('g')
        .attr('class', 'tooltip-stocks')
        .style('display', 'none');
        
        // vertical line on the plot
      vis.tooltip.append('line')
        .attr('class', 'tooltip-line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', vis.config.height)
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '4');
  
    }
  
    // Prepare the data and scales before we render it.
    updateVis() {
        let vis = this;

        vis.xValue = d => d.date;
     
        vis.yValue = d => d.close;
        vis.yValue2 = d => d.close_2;
     
        vis.yValue1name = d => d.graph_1_name;
        vis.yValue2name = d => d.graph_2_name;
     
        vis.data.sort((a, b) => vis.xValue(a) - vis.xValue(b));
  
      // Initialize line generators
      vis.line = d3.line()
        .x(d => vis.xScaleFocus(vis.xValue(d)))
        .y(d => vis.yScaleFocus(vis.yValue(d)));
  
      vis.line2 = d3.line()
        .x(d => vis.xScaleFocus(vis.xValue(d)))
        .y(d => vis.yScaleFocus(vis.yValue2(d)));
  
      // Set the scale input domains
      vis.xScaleFocus.domain(d3.extent(vis.data, vis.xValue));

      // Update domain to cover both y values
      vis.yScaleFocus.domain([
        d3.min(vis.data, d => Math.min(vis.yValue(d), vis.yValue2(d))),
        d3.max(vis.data, d => Math.max(vis.yValue(d), vis.yValue2(d)))
        ]);
  
        // this will help in getting the x value from mouse point
      vis.bisectDate = d3.bisector(vis.xValue).left;

      vis.renderVis();
    }
  
    // This function contains the D3 code for binding data to visual elements
    renderVis() {
      let vis = this;
      
      let line1 = vis.focusLinePath
        .datum(vis.data)
        .attr('d', vis.line)
  
      let line2 = vis.focusLinePath2
        .datum(vis.data)
        .attr('d', vis.line2)
  
      // Update the axes
      vis.xAxisFocusG.call(vis.xAxisFocus);
      vis.yAxisFocusG.call(vis.yAxisFocus);

      vis.svg
        .on('mouseenter', () => {
          vis.tooltip.style('display', 'block');
        })
        .on('mousemove', (event, d) => {
          this.showToolData(event, d)
        })
        .on('mouseleave', () => {
          vis.tooltip.style('display', 'none');
          d3.select('#stock-tooltip').style('display', 'none')
        })
    }
  
    showToolData(event, d){
      let vis = this

      const xPos = d3.pointer(event, this)[0];
      const date = vis.xScaleFocus.invert(xPos);
      // Find nearest data point
      const index = vis.bisectDate(vis.data, date, 1);
      const a = vis.data[index - 1];
      const b = vis.data[index];
      const val = b && (date - a.date > b.date - date) ? b : a;
  
      let xTranslate = vis.xScaleFocus(val.date)
  
      vis.tooltip.select('line')
        .attr('transform', `translate(${xTranslate}, 0)`);
  
      const formatDate = d3.timeFormat("As on %b %d, %Y");
      // show only first 10 characters of stock name
      const truncateString = str => str.length <= 10 ? str : str.substring(0, 10) + '...';
  
      d3.select('#stock-tooltip')
        .style('display', 'block')
        .style('position', 'absolute')
        .style('left', Math.min(xTranslate, vis.config.width) + 'px')
        .style('top', '300px')
        .html(`
          <div class="tooltip-content">
            <div class="tooltip-text" style=" display: inline; font-weight: bold; color: blue;">${truncateString(val.graph_1_name)}: </div> ${'$' + val.close}
            <br><br><div class="tooltip-text" style=" display: inline; font-weight: bold; color: orange;">\n${truncateString(val.graph_2_name)}: </div> ${'$' + val.close_2}
            <br><br><div class="tooltip-text" style="font-size: 15px">${formatDate(val.date)}</div>
          </div>
        `);
    }
  
    updateData(dataNew){
      this.data = dataNew;
      this.updateVis();
    }
  }