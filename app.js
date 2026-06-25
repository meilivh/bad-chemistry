// using d3 for convenience, and storing selected elements
var container = d3.select('#overview');
var graphic = container.select('.overview__graphic');
var chart = graphic.select('.chart');
var text = container.select('.overview__text');
var step = text.selectAll('.step');

// initialize the scrollama
var scroller = scrollama();

/* ============================================================
   1. CHART SETUP (D3)
   Uses a viewBox + CSS width:100% so it scales responsively
   without needing to rebuild scales on every resize.
   ============================================================ */
const margin = {top: 10, right: 30, bottom: 30, left: 50},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const svg = chart.append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .style("width", "100%")
    .style("height", "auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const industry_granular = [{"year":2008,"sector":"Chemicals","open":true,"fa":60.241486,"em":52.859351},{"year":2008,"sector":"Chemicals","open":false,"fa":11.270157,"em":9.117326},{"year":2008,"sector":"Other industrial emissions","open":false,"fa":null,"em":499.536947},{"year":2008,"sector":"Refineries","open":false,"fa":null,"em":139.152818},{"year":2009,"sector":"Chemicals","open":true,"fa":63.036221,"em":49.595411},{"year":2009,"sector":"Chemicals","open":false,"fa":11.28648,"em":8.493421},{"year":2009,"sector":"Other industrial emissions","open":false,"fa":null,"em":400.301791},{"year":2009,"sector":"Refineries","open":false,"fa":null,"em":130.535714},{"year":2010,"sector":"Chemicals","open":true,"fa":63.07499,"em":53.528965},{"year":2010,"sector":"Chemicals","open":false,"fa":11.847688,"em":9.186736},{"year":2010,"sector":"Other industrial emissions","open":false,"fa":null,"em":430.389851},{"year":2010,"sector":"Refineries","open":false,"fa":null,"em":127.515132},{"year":2011,"sector":"Chemicals","open":true,"fa":64.136854,"em":52.436056},{"year":2011,"sector":"Chemicals","open":false,"fa":11.873344,"em":9.505056},{"year":2011,"sector":"Other industrial emissions","open":false,"fa":null,"em":425.643976},{"year":2011,"sector":"Refineries","open":false,"fa":null,"em":127.907556},{"year":2012,"sector":"Chemicals","open":true,"fa":64.759328,"em":50.250059},{"year":2012,"sector":"Chemicals","open":false,"fa":12.080777,"em":9.187353},{"year":2012,"sector":"Other industrial emissions","open":false,"fa":null,"em":407.733324},{"year":2012,"sector":"Refineries","open":false,"fa":null,"em":124.142434},{"year":2013,"sector":"Chemicals","open":true,"fa":95.655106,"em":91.487226},{"year":2013,"sector":"Chemicals","open":false,"fa":31.11588,"em":29.052833},{"year":2013,"sector":"Other industrial emissions","open":false,"fa":null,"em":459.700154},{"year":2013,"sector":"Refineries","open":false,"fa":null,"em":134.529789},{"year":2014,"sector":"Chemicals","open":true,"fa":94.012383,"em":92.150342},{"year":2014,"sector":"Chemicals","open":false,"fa":29.61896,"em":25.642002},{"year":2014,"sector":"Other industrial emissions","open":false,"fa":null,"em":463.439662},{"year":2014,"sector":"Refineries","open":false,"fa":null,"em":130.911825},{"year":2015,"sector":"Chemicals","open":true,"fa":91.370519,"em":91.329036},{"year":2015,"sector":"Chemicals","open":false,"fa":25.916074,"em":24.624648},{"year":2015,"sector":"Other industrial emissions","open":false,"fa":null,"em":460.8128},{"year":2015,"sector":"Refineries","open":false,"fa":null,"em":134.236976},{"year":2016,"sector":"Chemicals","open":true,"fa":89.206973,"em":90.40748},{"year":2016,"sector":"Chemicals","open":false,"fa":24.848127,"em":24.538324},{"year":2016,"sector":"Other industrial emissions","open":false,"fa":null,"em":455.016096},{"year":2016,"sector":"Refineries","open":false,"fa":null,"em":133.975129},{"year":2017,"sector":"Chemicals","open":true,"fa":87.462276,"em":93.209011},{"year":2017,"sector":"Chemicals","open":false,"fa":24.214534,"em":25.347643},{"year":2017,"sector":"Other industrial emissions","open":false,"fa":null,"em":465.392667},{"year":2017,"sector":"Refineries","open":false,"fa":null,"em":132.800115},{"year":2018,"sector":"Chemicals","open":true,"fa":86.110858,"em":90.819311},{"year":2018,"sector":"Chemicals","open":false,"fa":23.166241,"em":24.019189},{"year":2018,"sector":"Other industrial emissions","open":false,"fa":null,"em":465.679052},{"year":2018,"sector":"Refineries","open":false,"fa":null,"em":131.236927},{"year":2019,"sector":"Chemicals","open":true,"fa":85.307961,"em":89.451195},{"year":2019,"sector":"Chemicals","open":false,"fa":22.340981,"em":23.019281},{"year":2019,"sector":"Other industrial emissions","open":false,"fa":null,"em":454.954253},{"year":2019,"sector":"Refineries","open":false,"fa":null,"em":130.814598},{"year":2020,"sector":"Chemicals","open":true,"fa":83.957582,"em":87.754093},{"year":2020,"sector":"Chemicals","open":false,"fa":21.695216,"em":22.429886},{"year":2020,"sector":"Other industrial emissions","open":false,"fa":null,"em":419.342129},{"year":2020,"sector":"Refineries","open":false,"fa":null,"em":120.348166},{"year":2021,"sector":"Chemicals","open":true,"fa":91.389972,"em":103.784135},{"year":2021,"sector":"Chemicals","open":false,"fa":0.196747,"em":1.07871},{"year":2021,"sector":"Other industrial emissions","open":false,"fa":null,"em":399.451185},{"year":2021,"sector":"Refineries","open":false,"fa":null,"em":110.164427},{"year":2022,"sector":"Chemicals","open":true,"fa":92.18861,"em":87.84449},{"year":2022,"sector":"Chemicals","open":false,"fa":0.142014,"em":0.189544},{"year":2022,"sector":"Other industrial emissions","open":false,"fa":null,"em":368.422002},{"year":2022,"sector":"Refineries","open":false,"fa":null,"em":116.800757},{"year":2023,"sector":"Chemicals","open":true,"fa":85.710127,"em":81.593239},{"year":2023,"sector":"Chemicals","open":false,"fa":0.077265,"em":0.126564},{"year":2023,"sector":"Other industrial emissions","open":false,"fa":null,"em":334.282725},{"year":2023,"sector":"Refineries","open":false,"fa":null,"em":112.505127},{"year":2024,"sector":"Chemicals","open":true,"fa":75.006441,"em":84.678472},{"year":2024,"sector":"Chemicals","open":false,"fa":0.021409,"em":0.03436},{"year":2024,"sector":"Other industrial emissions","open":false,"fa":null,"em":329.170498},{"year":2024,"sector":"Refineries","open":false,"fa":null,"em":112.716276}];

const chemicals_em_fa = d3.rollup(industry_granular.filter(d => d.sector == 'Chemicals'), (v, d) => Object.fromEntries(
        ['em', 'fa'].map((col) => [col, d3.sum(v, (d) => +d[col])])
    ), d => d.year);

const max_chemicals = d3.max(chemicals_em_fa.values(), d => d.em) * 1.2;

const sector_labels = [{'l': 'Chemicals', 'v': 50}, {'l': 'Refineries', 'v': 150}, {'l': 'Other industrial emissions', 'v': 450}];
const sectors = ['Chemicals', 'Chemicals', 'Refineries', 'Other industrial emissions'];

const stackedSectors = d3.stack()
    .keys([0, 1, 2, 3])
    .value((d, key) => d[1][key].em)
    (d3.group(industry_granular, d => d.year));

const x = d3.scaleLinear().domain([2008, 2024]).range([0, width]);

svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('.0f')));

const y = d3.scaleLinear()
    .domain([0, max_chemicals])
    .range([height, 0]);

svg.append("g")
    .call(d3.axisLeft(y))
    .attr('class', 'axis-y');

const color_sectors = d3.scaleOrdinal()
    .domain(sectors)
    .range(['#FCC480', '#40B4C9', 'lightgrey']);

svg.selectAll('.free-allowances')
    .data([chemicals_em_fa.keys()])
    .join('path')
    .attr('class', 'free-allowances')
    .attr("d", d3.area()
        .x(d => x(d))
        .y0(y(0))
        .y1(d => y(chemicals_em_fa.get(d).fa))
    )
    .style('opacity', 0);

svg.selectAll(".sector")
    .data(stackedSectors)
    .join('path')
    .attr('class', d => `sector sector-${d.key}`)
    .style('fill', d => color_sectors(sectors[d.key]))
    .attr("d", d3.area()
        .x(d => x(d.data[0]))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
    )
    .style('opacity', d => sectors[d.key] == 'Chemicals' ? 1 : 0);

svg.selectAll('.emissions')
    .data([chemicals_em_fa.keys().filter(d => d > 2012)])
    .join('path')
    .attr('class', 'emissions')
    .attr("d", d3.area()
        .x(d => x(d))
        .y0(y(0))
        .y1(d => y(chemicals_em_fa.get(d).em))
    );

svg.append('text')
    .attr('class', 'total-emissions-label')
    .attr('x', x(2018))
    .attr('y', y(60))
    .text('1.3 GtCO₂e');

svg.append('text')
    .attr('class', 'total-emissions-label')
    .attr('x', x(2018))
    .attr('y', y(60))
    .attr('dy', 20)
    .style('font-size', '13px')
    .text('emitted since 2013');

svg.selectAll('.sector-label')
    .data(sector_labels)
    .join('text')
    .attr('class', 'sector-label')
    .attr('x', d => x(2016))
    .attr('y', d => y(d.v))
    .text(d => d.l)
    .style('opacity', 0);

svg.append('circle')
    .attr('class', 'emissions-mark')
    .attr('cx', x(2013))
    .attr('cy', y(chemicals_em_fa.get(2013).em))
    .attr('r', 3);

svg.append('circle')
    .attr('class', 'emissions-mark s-2')
    .attr('cx', x(2021))
    .attr('cy', y(chemicals_em_fa.get(2021).em))
    .attr('r', 3)
    .style('opacity', 0);

svg.append('line')
    .attr('class', 'emissions-mark s-2')
    .attr('x1', x(2023))
    .attr('x2', x(2024))
    .attr('y1', y(chemicals_em_fa.get(2023).em))
    .attr('y2', y(chemicals_em_fa.get(2024).em))
    .style('opacity', 0);

svg.append('text')
    .attr('class', 'emissions-label')
    .attr('x', x(2013))
    .attr('y', y(chemicals_em_fa.get(2013).em))
    .attr('dx', -5)
    .attr('dy', 5)
    .style('text-anchor', 'end')
    .text('Scope extension →');

svg.append('text')
    .attr('class', 'emissions-label')
    .attr('x', x(2013))
    .attr('y', y(chemicals_em_fa.get(2013).em))
    .attr('dx', -5)
    .attr('dy', 13)
    .style('text-anchor', 'end')
    .text('since phase 3');

svg.append('text')
    .attr('class', 'emissions-label s-2')
    .attr('x', x(2021))
    .attr('y', y(chemicals_em_fa.get(2021).em))
    .attr('dx', 5)
    .attr('dy', -3)
    .style('text-anchor', 'start')
    .text('← Post-pandemic')
    .style('opacity', 0);

svg.append('text')
    .attr('class', 'emissions-label s-2')
    .attr('x', x(2021))
    .attr('y', y(chemicals_em_fa.get(2021).em))
    .attr('dx', 5)
    .attr('dy', 5)
    .style('text-anchor', 'start')
    .text('demand spike')
    .style('opacity', 0);

svg.append('text')
    .attr('class', 'emissions-label s-2')
    .attr('x', x(2024))
    .attr('y', y(chemicals_em_fa.get(2024).em))
    .attr('dx', -2)
    .attr('dy', 20)
    .style('text-anchor', 'end')
    .text('4% ↑')
    .style('opacity', 0);

svg.append('text')
    .attr('class', 'emissions-label s-2')
    .attr('x', x(2024))
    .attr('y', y(chemicals_em_fa.get(2024).em))
    .attr('dx', -2)
    .attr('dy', 28)
    .style('text-anchor', 'end')
    .text('increase')
    .style('opacity', 0);

svg.selectAll(".fa-line")
    .data([chemicals_em_fa.keys()])
    .join('path')
    .attr('class', 'fa-line')
    .attr("d", d3.line()
        .x(d => x(d))
        .y(d => y(chemicals_em_fa.get(d).fa))
    )
    .style("opacity", 0);

svg.append('text')
    .attr('class', 'total-fa-label')
    .attr('x', x(2018))
    .attr('y', y(60))
    .text('1.3 GtCO₂e')
    .style('opacity', 0);

svg.append('text')
    .attr('class', 'total-fa-label')
    .attr('x', x(2018))
    .attr('y', y(60))
    .attr('dy', 20)
    .style('font-size', '13px')
    .text('in freely allocated allowances since 2013')
    .style('opacity', 0);

svg.selectAll('.fa-fill')
    .data([...chemicals_em_fa.keys()].filter(d => d > 2012))
    .join('line')
    .attr('class', 'fa-fill')
    .attr('x1', d => x(d))
    .attr('x2', d => x(d))
    .attr('y1', d => y(0))
    .attr('y2', d => y(chemicals_em_fa.get(d).fa))
    .style('opacity', 0);

/* ============================================================
   2. RESIZE — graphic is plain CSS position: sticky, so this
   only needs to keep scrollama aware of new step dimensions.
   No manual pinning math needed anymore.
   ============================================================ */
function handleResize() {
    scroller.resize();
}

/* ============================================================
   3. STEP TRIGGERS (scrollama)
   ============================================================ */
function handleStepEnter(response) {
    // response = { element, direction, index }
    step.classed('is-active', function (d, i) {
        return i === response.index;
    });

    var stepNum = response.element.dataset.step;

    if (stepNum == 1) {
        svg.selectAll('.sector-label').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.emissions').transition().duration(1000).style("opacity", 0.2);
        svg.selectAll('.total-emissions-label').transition().duration(1000).style("opacity", 1);
        svg.selectAll('.sector').transition().duration(1000).style('fill', d => color_sectors(sectors[d.key]));
        svg.selectAll('.fa-line').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.free-allowances').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.emissions-mark.s-2').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.emissions-label.s-2').transition().duration(1000).style("opacity", 0);
    }

    if (stepNum == 2) {
        svg.selectAll('.sector').transition().duration(1000).style('fill', d => d.key == 0 ? color_sectors('Chemicals') : 'lightgrey');
        svg.selectAll('.emissions').transition().duration(500).style("opacity", 0);
        svg.selectAll('.total-emissions-label').transition().duration(500).style("opacity", 0);
        svg.selectAll('.total-fa-label').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.fa-line').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.free-allowances').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.fa-fill').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.emissions-mark').transition().duration(1000).style("opacity", 1);
        svg.selectAll('.emissions-label').transition().duration(1000).style("opacity", 1);
    }

    else if (stepNum == 3) {
        svg.selectAll('.sector').transition().duration(1000).style('fill', d => color_sectors(sectors[d.key]));
        svg.selectAll('.free-allowances').transition().duration(1000).style("opacity", 0.5);
        svg.selectAll('.fa-line').transition().duration(1000).style("opacity", 1);
        svg.selectAll('.total-fa-label').transition().duration(1000).style("opacity", 1);
        svg.selectAll('.fa-fill').transition().duration(1000).style("opacity", 1);
        svg.selectAll('.emissions-mark').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.emissions-label').transition().duration(1000).style("opacity", 0);
    }
}

/* ============================================================
   4. KICK-OFF
   ============================================================ */
function init() {
    handleResize();

    scroller
        .setup({
            step: '.overview__text .step',
            offset: 0.5,
            debug: false,
        })
        .onStepEnter(handleStepEnter);

    window.addEventListener('resize', handleResize);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}