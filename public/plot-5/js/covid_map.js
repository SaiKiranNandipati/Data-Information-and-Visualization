let choroplethMap, minCase, maxCase;
let currDate = '2023-01-01'

class ChoroplethMap {
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 400,
        margin: _config.margin || { top: 0, right: 0, bottom: 0, left: 0 },
        tooltipPadding: 10,
        legendBottom: 50,
        legendLeft: 50,
        legendRectHeight: 12,
        legendRectWidth: 150
      }
      this.data = _data;
      this.minCase = _config.minCase;
      this.maxCase = _config.maxCase;
      console.log('setting min max', this.minCase, this.maxCase);
      this.initVis();
      return this;
    }
  
    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {
    console.log('init');
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);
  
      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Initialize projection and path generator
      vis.projection = d3.geoMercator();
      vis.geoPath = d3.geoPath().projection(vis.projection);
  
  
      // Initialize gradient that we will later use for the legend
      vis.linearGradient = vis.svg.append('defs').append('linearGradient')
        .attr("id", "legend-gradient");
  
      // Append legend
      vis.legend = vis.chart.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${vis.config.legendLeft},${vis.height - vis.config.legendBottom})`);
  
      vis.legendRect = vis.legend.append('rect')
        .attr('width', vis.config.legendRectWidth)
        .attr('height', vis.config.legendRectHeight);
  
      vis.legendTitle = vis.legend.append('text')
        .attr('class', 'legend-title')
        .attr('dy', '.35em')
        .attr('y', -10)
        .text('Covid cases per million people')
  
    
    vis.colorScale = d3.scaleLinear()
        .range(['#cfe2f2', '#0d306b'])
        .interpolate(d3.interpolateHslLong);
    
        // Update color scale
    vis.colorScale.domain([vis.minCase, vis.minCase + 0.1 * (vis.maxCase - vis.minCase), vis.maxCase]);

    // Define begin and end of the color gradient (legend)
    vis.legendStops = [
      { color: '#cfe2f2', value: vis.minCase, offset: 0 },
      { color: '#0d306b', value: vis.maxCase, offset: 100 },
    ];
    console.log('init done');
    console.log('colorScale', vis.colorScale(1320), vis.maxCase, vis.legendStops);
    vis.renderVis();

    }

    renderVis() {
      let vis = this;
  
      // Convert compressed TopoJSON to GeoJSON format
      const countries = topojson.feature(vis.data, vis.data.objects.collection)
  
      // Defines the scale of the projection so that the geometry fits within the SVG area
      vis.projection.fitSize([vis.width, vis.height], countries);
  
      // Append world map
      const countryPath = vis.chart.selectAll('.country')
        .data(countries.features)
        .join('path')
        .attr('class', 'country')
        .attr('d', vis.geoPath)
        .attr('fill', d => {
          if (d.properties.pop_density) {
            return vis.colorScale(d.properties.pop_density);
          } else {
            return 'url(#lightstripe)';
          }
        });
  
      countryPath
        .on('mousemove', (event, d) => {
          const popDensity = d.properties.pop_density ? `<strong>${Math.round(d.properties.pop_density)}</strong> cases per million people` : 'No data available';
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
                <div class="tooltip-title">${d.properties.name}</div>
                <div>${popDensity}</div>
              `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });
    

        console.log('reder: colorScale', vis.colorScale(1320), vis.maxCase, vis.legendStops);
      // Add legend labels
      vis.legend.selectAll('.legend-label')
        .data(vis.legendStops)
        .join('text')
        .attr('class', 'legend-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('y', 20)
        .attr('x', (d, index) => {
          return index == 0 ? 0 : vis.config.legendRectWidth;
        })
        .text(d => Math.round(d.value * 10) / 10);
  
      // Update gradient for legend
      vis.linearGradient.selectAll('stop')
        .data(vis.legendStops)
        .join('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);
  
      vis.legendRect.attr('fill', 'url(#legend-gradient)');
    }

    updateData(newData){
        this.data = newData;
    }
  }

function daysToDate(days) {
    var startDate = new Date("2021-01-01");
    var selectedDate = new Date(startDate);
    selectedDate.setDate(startDate.getDate() + days);
    var month = selectedDate.getMonth() + 1;
    var day = selectedDate.getDate();
    var year = selectedDate.getFullYear();
    return year + "-" + (month < 10 ? '0' : '') + month + "-" + (day < 10 ? '0' : '') + day;
}

function updateSelectedDate() {
    // console.log('slider onchange called');
    var slider = document.getElementById("dateSlider");
    var selectedDate = document.getElementById("selectedDate");
    var days = parseInt(slider.value);
    selectedDate.textContent = daysToDate(days);
    currDate = selectedDate.textContent;
    // console.log('date', currDate);

    choroplethMap===undefined?startPlotting():updatePlotting();

    console.log('choroplethMap===undefined', choroplethMap===undefined, choroplethMap);
}

function findMinMax(data){
    // find min and max case for color coding
    minCase = Number.POSITIVE_INFINITY;
    maxCase = 0;
    for (let i = 0; i < data.length; i++) {
        if(parseFloat(data[i].no_of_cases) >= maxCase)
            maxCase = Math.round(parseFloat(data[i].no_of_cases));
        if(parseFloat(data[i].no_of_cases) <= minCase)
            minCase = Math.round(parseFloat(data[i].no_of_cases));
    }

    console.log('min, max, ', minCase, maxCase);
}

function startPlotting(){
    console.log('start plotting called');
    Promise.all([
        d3.json('data/africa.json'),
        d3.csv('data/covid_data.csv')
      ]).then(data => {
        const geoData = data[0];
        const countryData = data[1];
      
        geoData.objects.collection.geometries.forEach(d => {
            for (let i = 0; i < countryData.length; i++) {
              if (d.properties.name == countryData[i].country && currDate == countryData[i].date) {
                d.properties.pop_density = countryData[i].no_of_cases;
              }
            }
          });
          
        findMinMax(countryData);
        
        choroplethMap = new ChoroplethMap({
          parentElement: '#covid-map',
          minCase: minCase,
          maxCase: maxCase
        }, geoData);
      })
        .catch(error => console.error(error));

    
}

function updatePlotting(){
    console.log('updating plotting called', isNaN(choroplethMap));
    Promise.all([
        d3.json('data/africa.json'),
        d3.csv('data/covid_data.csv')
      ]).then(data => {
        const geoData = data[0];
        const countryData = data[1];
      
        geoData.objects.collection.geometries.forEach(d => {
            for (let i = 0; i < countryData.length; i++) {
              if (d.properties.name == countryData[i].country && currDate == countryData[i].date) {
                d.properties.pop_density = countryData[i].no_of_cases;
              }
            }
          });
          
        try{
            choroplethMap.updateData(geoData)
            choroplethMap.renderVis()
        }
        catch{
            console.log('Error in updateplotting');
        }
      })
        .catch(error => console.error(error));
}

updateSelectedDate()