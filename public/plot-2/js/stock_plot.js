const parseTime = d3.timeParse("%Y-%m-%d");

let data, focusContextVis, graph1, graph2, timeline;

const optionsMap = {
  "snp500": "S&P 500",
  "spy": "SPDR S&P 500 ETF Trust",
  "qqq": "Nasdaq 100 ETF",
  "dia": "Dow Jones ETF",
  "iwm": "iShares Russell 2000 ETF",
  "voo": "Vanguard S&P 500 ETF"
};

// Set time period based on user interaction
function setTimePeriod(button) {
  document.querySelectorAll('.time-period-button').forEach(
    btn => btn.classList.remove('dark')
  );
  button.classList.add('dark');
  return button.value;
}

// Redraw graph when ever there is a change in input
function dropdownChanged(button) {
  graph1 = document.getElementById("myDropdown").value;
  graph2 = document.getElementById("myDropdown2").value;
  if(button.className.includes('time-period-button'))
    timeline = setTimePeriod(button)
  button.classList.add('dark');
  console.log("Selected value: " + graph1 + graph2 + timeline);
  updateGraph(graph1, graph2, timeline)
}

// redraw plot with new inputs
function updateGraph(graph1, graph2, timeline){
  let dataFile = 'data/1m_data.csv'
  if(timeline=='1m')
    dataFile = 'data/1m_data.csv'
  else if(timeline=='1y')
    dataFile = 'data/1y_data.csv'
  else if(timeline=='2y')
    dataFile = 'data/2y_data.csv'
  d3.csv(dataFile)
    .then(_data => {
      _data.forEach(d => {
        d.close = parseFloat(d[graph1]);
        d.graph_1_name = optionsMap[graph1];
        d.close_2 = parseFloat(d[graph2]);
        d.graph_2_name = optionsMap[graph2];
        d.date = parseTime(d.date);
      });

      data = _data;

      focusContextVis.updateData(data);
      focusContextVis.updateVis();
    });
}

// draw the plot first time
function showGraph(graph1, graph2, timeline){
  let dataFile = 'data/1m_data.csv'
  if(timeline=='1m')
    dataFile = 'data/1m_data.csv'
  else if(timeline=='1y')
    dataFile = 'data/1y_data.csv'
  else if(timeline=='2y')
    dataFile = 'data/2y_data.csv'
  d3.csv(dataFile)
    .then(_data => {
      _data.forEach(d => {
        d.close = parseFloat(d[graph1]); 
        d.graph_1_name = optionsMap[graph1]; 
        d.close_2 = parseFloat(d[graph2]); 
        d.graph_2_name = optionsMap[graph2]; 
        d.date = parseTime(d.date);
      });

      data = _data;

      // Initialize and render chart
      focusContextVis = new FocusContextVis({ parentElement: '#chart'}, data);
      focusContextVis.initVis();
      focusContextVis.updateVis();
    });
}

window.onload = function() {
  graph1 = document.getElementById("myDropdown").value;
  graph2 = document.getElementById("myDropdown2").value;
  timeline = document.getElementById("myDropdown3").value;
  showGraph(graph1, graph2, timeline)
};