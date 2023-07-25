import define1 from "./a33468b95d0b15b0@808.js";
import define2 from "./7a9e12f9fb3d8e06@498.js";
import define3 from "./b2bbebd2f186ed03@1803.js";

function _1(md){return(
md`# Заболевшие и умершие от ковида. Инструмент для сравнения стран между собой и к тотал по всему миру.`
)}

function _2(md){return(
md`### Доступный период дат: январь 2020 - февраль 2023`
)}

function _selectedCountries(Inputs,data_raw){return(
Inputs.select(data_raw.map(county => county.country_name) , {label: "Visited states",  multiple: true, value: ['Russia']})
)}

function _showsDataTypes(Inputs){return(
Inputs.checkbox(["confirmed", "deaths"], {label: "Show data for:", value: ["confirmed", "deaths"]})
)}

function _rangeDates(interval,allDates){return(
interval([0, allDates .length], {
  step: 1,
  value: [500, 530],
  format: ([start, end]) => `${allDates[start]} по ${allDates[end]}`,
  width: 700,
  label: 'Show statistics for dates:',
})
)}

function _key(Swatches,chart){return(
Swatches(chart.scales.color)
)}

function _chart(StackedBarChart,gistoData,d3,indicators,cuctomsColors,width){return(
StackedBarChart(gistoData, {
  x: d => d.count,
  y: d => d.date,
  z: d => d.ruling,
  xFormat: ".2s",
  xLabel: "← deaths · COVID-19 · confirmed →",
  yDomain: d3.groupSort(gistoData, D => d3.sum(D, d => -Math.min(0, d.count)), d => d.date),
  zDomain: indicators,
  colors: cuctomsColors ,
  width,
  marginLeft: 70
})
)}

function _cuctomsColors(d3,indicators,showsDataTypes){return(
(d3.schemeSpectral[indicators.length / (showsDataTypes.length || 1)] || ["#44944A", "#990066", "#78DBE2", "#003153"]).map((color) => {
  if(showsDataTypes.length === 2) return  [color, color+'ad'];
  if(showsDataTypes.length === 1) {
    return showsDataTypes.includes("deaths") ? [color+'ad'] : [color]
  }
}).flat()
)}

function _StackedBarChart(d3,showsDataTypes){return(
function StackedBarChart(data, {
  x = d => d, // given d in data, returns the (quantitative) x-value
  y = (d, i) => i, // given d in data, returns the (ordinal) y-value
  z = () => 1, // given d in data, returns the (categorical) z-value
  title, // given d in data, returns the title text
  marginTop = 30, // top margin, in pixels
  marginRight = 0, // right margin, in pixels
  marginBottom = 0, // bottom margin, in pixels
  marginLeft = 40, // left margin, in pixels
  width = 640, // outer width, in pixels
  height, // outer height, in pixels
  xType = d3.scaleLinear, // type of x-scale
  xDomain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight], // [left, right]
  yDomain, // array of y-values
  yRange, // [bottom, top]
  yPadding = 0.1, // amount of y-range to reserve to separate bars
  zDomain, // array of z-values
  offset = d3.stackOffsetDiverging, // stack offset method
  order = (series) => { // stack order method; try also d3.stackOffsetNone
    return [ // by default, stack negative series in reverse order
      ...series.map((S, i) => S.some(([, y]) => y < 0) ? i : null).reverse(),
      ...series.map((S, i) => S.some(([, y]) => y < 0) ? null : i)
    ].filter(i => i !== null);
  },
  xFormat, // a format specifier string for the x-axis
  xLabel, // a label for the x-axis
  colors = d3.schemeTableau10, // array of colors
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const Z = d3.map(data, z);

  // Compute default y- and z-domains, and unique them.
  if (yDomain === undefined) yDomain = Y;
  if (zDomain === undefined) zDomain = Z;
  yDomain = new d3.InternSet(yDomain);
  zDomain = new d3.InternSet(zDomain);

  // Omit any data not present in the y- and z-domains.
  const I = d3.range(X.length).filter(i => yDomain.has(Y[i]) && zDomain.has(Z[i]));

  // If the height is not specified, derive it from the y-domain.
  if (height === undefined) height = yDomain.size * 25 + marginTop + marginBottom;
  if (yRange === undefined) yRange = [height - marginBottom, marginTop];

  // Compute a nested array of series where each series is [[x1, x2], [x1, x2],
  // [x1, x2], …] representing the x-extent of each stacked rect. In addition,
  // each tuple has an i (index) property so that we can refer back to the
  // original data point (data[i]). This code assumes that there is only one
  // data point for a given unique y- and z-value.
  const series = d3.stack()
      .keys(zDomain)
      .value(([, I], z) => X[I.get(z)])
      .order(order)
      .offset(offset)
    (d3.rollup(I, ([i]) => i, i => Y[i], i => Z[i]))
    .map(s => s.map(d => Object.assign(d, {i: d.data[1].get(s.key)})));

  // Compute the default y-domain. Note: diverging stacks can be negative.
  if (xDomain === undefined) {
    if(showsDataTypes.length === 2) xDomain = (m => [-m, m])(Math.max(...series.flat(2).map(n => Math.abs(n))) * 1.2);
    else xDomain = d3.extent(series.flat(2));
  }
  
  // return xDomain;
  // Construct scales, axes, and formats.
  const xScale = xType(xDomain, xRange);
  const yScale = d3.scaleBand(yDomain, yRange).paddingInner(yPadding);
  const color = d3.scaleOrdinal(zDomain, colors);
  const xAxis = d3.axisTop(xScale).ticks(width / 80, xFormat);
  const yAxis = d3.axisLeft(yScale).tickSize(0);

  // Compute titles.
  if (title === undefined) {
    const formatValue = xScale.tickFormat(100, xFormat);
    title = i => `${Y[i]}\n${Z[i]}\n${formatValue(X[i])}`;
  } else {
    const O = d3.map(data, d => d);
    const T = title;
    title = i => T(O[i], i, data);
  }

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("y2", height - marginTop - marginBottom)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", xScale(0))
          .attr("y", -22)
          .attr("fill", "currentColor")
          .attr("text-anchor", "middle")
          .text(xLabel));

  const bar = svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
      .attr("fill", ([{i}]) => color(Z[i]))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", ([x1, x2]) => Math.min(xScale(x1), xScale(x2)))
      .attr("y", ({i}) => yScale(Y[i]))
      .attr("width", ([x1, x2]) => Math.abs(xScale(x1) - xScale(x2)))
      .attr("height", yScale.bandwidth());

  if (title) bar.append("title")
      .text(({i}) => title(i));

  svg.append("g")
      .attr("transform", `translate(${xScale(0)},0)`)
      .call(yAxis)
      .call(g => g.selectAll(".tick text")
          .attr("dx", -3)
          .attr("x", y => { // Find the minimum x-value for the corresponding y-value.
            const x = d3.min(series, S => S.find(d => Y[d.i] === y)?.[0]);
            return xScale(x) - xScale(0);
          }));

  return Object.assign(svg.node(), {scales: {color}});
}
)}

function _indicators(suitableCountry,showsDataTypes){return(
suitableCountry.map(el => showsDataTypes.map(type => `${el.country_name}-${type}`)).flat()
)}

function _gistoData(rangeDates,allDates,suitableCountry,showsDataTypes)
{ 
  const from = rangeDates[0];
  return allDates.slice(from, rangeDates[1]).map((date, i) => {
    const di = from + i;
    const total = suitableCountry.reduce((acc, country) => {
      return acc + country.confirmed[di][1] + country.deaths[di][1] ;
    }, 1);


    return suitableCountry.map((country) => 
                               showsDataTypes.map(type => ({count: country[type][di][1] * (type === 'deaths' ?  -1 : 1), type}))
                               .map(({count, type}, cpi) => {
      const isConfirmed = cpi === 0;
      return {
        total,
        count: count,                        
        proportion: (count/total),
        date: date,
        ruling: `${country.country_name}-${type}`,
    }
    })).flat()
  }).flat();
}


function _allDates(data_raw){return(
data_raw[0].deaths.map(d => d[0])
)}

function _suitableCountry(data_raw,selectedCountries){return(
data_raw.filter((country) => selectedCountries.includes(country.country_name))
)}

function _data_raw(d3){return(
d3.json("https://raw.githubusercontent.com/hongtaoh/covid19-data/master/output/cntry_stat_owid.json")
)}

function _18(md){return(
md`@mootari/range-slider library for creating and interacting with range sliders `
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("viewof selectedCountries")).define("viewof selectedCountries", ["Inputs","data_raw"], _selectedCountries);
  main.variable(observer("selectedCountries")).define("selectedCountries", ["Generators", "viewof selectedCountries"], (G, _) => G.input(_));
  main.variable(observer("viewof showsDataTypes")).define("viewof showsDataTypes", ["Inputs"], _showsDataTypes);
  main.variable(observer("showsDataTypes")).define("showsDataTypes", ["Generators", "viewof showsDataTypes"], (G, _) => G.input(_));
  main.variable(observer("viewof rangeDates")).define("viewof rangeDates", ["interval","allDates"], _rangeDates);
  main.variable(observer("rangeDates")).define("rangeDates", ["Generators", "viewof rangeDates"], (G, _) => G.input(_));
  main.variable(observer("key")).define("key", ["Swatches","chart"], _key);
  main.variable(observer("chart")).define("chart", ["StackedBarChart","gistoData","d3","indicators","cuctomsColors","width"], _chart);
  main.variable(observer("cuctomsColors")).define("cuctomsColors", ["d3","indicators","showsDataTypes"], _cuctomsColors);
  main.variable(observer("StackedBarChart")).define("StackedBarChart", ["d3","showsDataTypes"], _StackedBarChart);
  main.variable(observer("indicators")).define("indicators", ["suitableCountry","showsDataTypes"], _indicators);
  main.variable(observer("gistoData")).define("gistoData", ["rangeDates","allDates","suitableCountry","showsDataTypes"], _gistoData);
  main.variable(observer("allDates")).define("allDates", ["data_raw"], _allDates);
  main.variable(observer("suitableCountry")).define("suitableCountry", ["data_raw","selectedCountries"], _suitableCountry);
  main.variable(observer("data_raw")).define("data_raw", ["d3"], _data_raw);
  const child1 = runtime.module(define1);
  main.import("Swatches", child1);
  const child2 = runtime.module(define2);
  main.import("howto", child2);
  main.import("altplot", child2);
  main.variable(observer()).define(["md"], _18);
  const child3 = runtime.module(define3);
  main.import("interval", child3);
  return main;
}
