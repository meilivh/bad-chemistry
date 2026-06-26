/* ============================================================
   GENERIC SCROLLY SCAFFOLDING
   Scoped per-section so two scrollytelling sections on the same
   page never collide (selectors, scrollama instances, or
   top-level chart variables).
   ============================================================ */
function initScrolly(config) {
    // config = { sectionId, drawChart, onStep }
    var container = d3.select('#' + config.sectionId);
    var text = container.select('.' + config.sectionId + '__text');
    var chart = container.select('.chart');
    var step = text.selectAll('.step');
    var scroller = scrollama();

    // each section supplies its own chart-drawing function;
    // whatever it returns (svg, scales, selections) stays local to this closure
    var chartApi = config.drawChart(config.width, chart);

    function handleResize() {
        scroller.resize();
    }

    function handleStepEnter(response) {
        step.classed('is-active', function (d, i) {
            return i === response.index;
        });

        var stepNum = response.element.dataset.step;
        config.onStep(chartApi, stepNum);
    }

    function init() {
        handleResize();
        scroller
            .setup({
                step: '#' + config.sectionId + ' .step', // scoped to this section only
                offset: 0.5,
            })
            .onStepEnter(handleStepEnter);
        window.addEventListener('resize', handleResize);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}

/* ============================================================
   HEADLINE SECTION — 32-icon waffle grid (Eiffel Tower)
   Step 1: all 32 towers appear (the "32 towers a day" framing)
   Step 2: 31 of them turn blue (98% covered by free allowances)
   Step 3: the last one turns pink (2% actually paid)
   ============================================================ */
function drawHeadlineChart(fullWidth, chart) {
    const margin = {top: 10, right: fullWidth*0.05, bottom: 10, left: fullWidth*0.05},
        width = (fullWidth > 768 ? fullWidth / 2 : fullWidth) - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = chart.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .style("width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // define the icon once; every tower below is a lightweight <use> reference to it
    svg.append("defs")
        .append("symbol")
        .attr("id", "eiffel-icon")
        .attr("viewBox", "0 0 130 165")
        .append("path")
        .attr("fill-rule", "evenodd")
        .attr("clip-rule", "evenodd")
        .attr("d", "M95.032 147.348C91.89 121.945 60.041 120.341 55.885 147.082L35.032 146.94C39.45 139.945 44.94 132.589 50.276 123.411L49.309 114.346L101.411 114.923L99.682 123.51C105.11 133.635 110.709 141.206 114.969 147.484L95.032 147.348ZM81.541 109.8L78.784 96.67L72.619 96.648L69.419 109.956L57.124 110.113C58.977 105.981 60.733 101.507 62.329 96.611L61.663 96.609L59.666 87.785L91.045 88.352L89.799 96.71L88.638 96.706C90.039 101.366 91.572 105.666 93.185 109.652L81.541 109.8ZM70.555 43.551L80.91 44.137C81.269 59.238 82.87 72.203 85.248 83.421L66.085 82.815C68.551 71.754 70.198 58.854 70.555 43.551ZM68.896 39.629L67.219 31.854L71.828 31.765L72.597 20.854H78.006L79.298 31.62L84.127 31.526L82.217 39.8L68.896 39.629Z");

    const TOTAL = 32;
    const cols = 8;
    const rows = Math.ceil(TOTAL / cols);
    const gap = 6;
    const iconW = (width - (cols - 1) * gap) / cols;
    const iconH = iconW * (165 / 130); // matches the symbol's viewBox aspect ratio
    const gridHeight = rows * iconH + (rows - 1) * gap;
    const offsetY = (height - gridHeight) / 2; // vertically center the grid in the available height

    const towers = svg.selectAll('.eiffel-tower')
        .data(d3.range(TOTAL)) // datum doubles as each tower's index, 0-31
        .join('use')
        .attr('class', 'eiffel-tower')
        .attr('href', '#eiffel-icon')
        .attr('x', d => (d % cols) * (iconW + gap))
        .attr('y', d => offsetY + Math.floor(d / cols) * (iconH + gap))
        .attr('width', iconW)
        .attr('height', iconH)
        .attr('fill', '#FCC480')
        .style('opacity', 0);

    return { towers, total: TOTAL };
}

function onHeadlineStep(api, stepNum) {
    if (stepNum == 1) {
        api.towers.transition().duration(800).style('opacity', 1).attr('fill', '#FCC480');
    }

    if (stepNum == 2) {
        api.towers.filter(d => d < api.total - 1)
            .transition().duration(800)
            .attr('fill', '#D10787');
    }

    if (stepNum == 3) {
        api.towers.filter(d => d === api.total - 1)
            .transition().duration(800)
            .attr('fill', '#54F9DB');
    }
}

/* ============================================================
   MAIN CHEMICALS SECTION — historical trend chart
   ============================================================ */
function drawChemicalsChart(fullWidth, chart) {
    const margin = {top: 10, right: fullWidth*0.05, bottom: 30, left: fullWidth*0.05},
        width = (fullWidth>768?fullWidth/2:fullWidth) - margin.left - margin.right,
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

    return { svg, x, y, color_sectors, sectors, chemicals_em_fa };
}

function onChemicalsStep(api, stepNum) {
    const svg = api.svg;
    const color_sectors = api.color_sectors;
    const sectors = api.sectors;

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
   MAP SECTION — Europe choropleth that zooms into city bubbles
   Step 1: country-level choropleth (NL/DE/FR account for half)
   Step 2: zoom in, reveal Antwerp's annotation
   Step 3: zoom view persists, add Sittard-Geleen's annotation
   Step 4: zoom view persists, add Ludwigshafen's annotation
   ============================================================ */
function drawMapChart(fullWidth, chart) {
    const margin = {top: 10, right: fullWidth * 0.05, bottom: 10, left: fullWidth * 0.05},
        width = (fullWidth > 768 ? fullWidth / 2 : fullWidth) - margin.left - margin.right,
        W = width,
        H = Math.round(W * 0.72);

    const svg = chart.append("svg")
        .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
        .style("width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'black');

    const legend = chart.append('div').attr('class', 'map-legend');
    chart.append('div').attr('class', 'map-source-note').text('Source: EU ETS verified emissions registry, 2024');
    const tip = d3.select('body').append('div').attr('class', 'map-tip');

    const COUNTRY_DATA={NL:{emit:67.042566,fa:58.274091},DE:{emit:61.466473,fa:63.346983},FR:{emit:46.121302,fa:42.519758},BE:{emit:36.036433,fa:36.60445},ES:{emit:29.406783,fa:25.718685},PL:{emit:22.049517,fa:26.231765},IT:{emit:20.964698,fa:21.648592},CZ:{emit:16.237375,fa:7.408368},HU:{emit:9.25879,fa:9.072569},BG:{emit:9.08892,fa:6.970447},NO:{emit:6.997748,fa:8.063822},LT:{emit:6.621213,fa:6.640534},SK:{emit:5.735334,fa:5.378533},AT:{emit:5.683666,fa:7.069392},SE:{emit:4.353249,fa:4.249356},FI:{emit:3.232636,fa:3.927976},RO:{emit:2.802308,fa:4.489573},PT:{emit:2.667551,fa:3.218137},HR:{emit:1.620223,fa:2.246387},GR:{emit:1.051978,fa:1.143141},DK:{emit:.563135,fa:.228686},IE:{emit:.20298,fa:.09462},SI:{emit:.124636,fa:.18672},EE:{emit:0,fa:0}};

    const CITY_DATA=[{country:"BE",city:"ANTWERPEN",lat:51.3366241,lon:4.2105982,emit:23.223619,fa:24.217231},{country:"NL",city:"SITTARD-GELEEN",lat:50.9897333,lon:5.721966,emit:15.732792,fa:14.55317},{country:"NL",city:"HOEK",lat:51.3357178,lon:3.783363,emit:13.937656,fa:9.267993},{country:"DE",city:"LUDWIGSHAFEN",lat:49.4874847,lon:8.3050029,emit:12.128187,fa:14.866371},{country:"NL",city:"SLUISKIL",lat:51.2749874,lon:3.8198167,emit:11.770532,fa:12.127517},{country:"NL",city:"MOERDIJK",lat:51.6843913,lon:4.5597576,emit:9.544309,fa:6.889895},{country:"DE",city:"KÖLN",lat:51.04638,lon:6.7907003,emit:8.225429,fa:8.217236},{country:"DE",city:"LUTHERSTADT WITTENBERG",lat:51.8677155,lon:12.5280291,emit:8.080171,fa:7.541045},{country:"FR",city:"LAVERA",lat:43.3880876,lon:5.0202478,emit:5.976176,fa:3.936666},{country:"DE",city:"WESSELING",lat:50.819134,lon:6.937942,emit:5.557275,fa:5.415494},{country:"NL",city:"ROTTERDAM",lat:51.9442057,lon:4.4101739,emit:4.611623,fa:3.358735},{country:"DE",city:"BOEHLEN",lat:51.187974,lon:12.3520774,emit:3.94795,fa:2.56313},{country:"FR",city:"PORT JEROME SUR SEINE",lat:49.4805836,lon:0.5696762,emit:3.184259,fa:3.065377},{country:"FR",city:"GONFREVILLE L'ORCHEZ",lat:49.4796829,lon:0.1932719,emit:2.827773,fa:2.01229},{country:"NL",city:"BOTLEK-ROTTERDAM",lat:51.8694444,lon:4.2864969,emit:2.794185,fa:2.064584},{country:"DE",city:"GROSSENKNETEN",lat:52.9533113,lon:8.2192285,emit:2.413186,fa:0.710982},{country:"BE",city:"TERTRE",lat:50.4795883,lon:3.8010306,emit:2.254633,fa:2.329844},{country:"DE",city:"LEUNA",lat:51.3254592,lon:12.0102885,emit:2.218111,fa:1.411937},{country:"NL",city:"BOTLEK ROTTERDAM",lat:51.8736195,lon:4.2545821,emit:2.08615,fa:2.189623},{country:"FR",city:"MARDYCK",lat:51.0292492,lon:2.2434177,emit:2.076441,fa:1.497479},{country:"DE",city:"MARL",lat:51.686478,lon:7.075579,emit:2.071277,fa:2.094572},{country:"FR",city:"DOMBASLE-SUR-MEURTHE",lat:48.6244746,lon:6.3474444,emit:2.052288,fa:1.658491},{country:"NL",city:"ROTTERDAM",lat:51.9442057,lon:4.4101739,emit:1.814835,fa:0.844231},{country:"FR",city:"LE GRAND QUEVILLY",lat:49.4233415,lon:1.0309151,emit:1.775025,fa:1.38162},{country:"FR",city:"LANEUVEVILLE DEVANT NANCY",lat:48.6406366,lon:6.2676707,emit:1.640395,fa:1.743136},{country:"FR",city:"OTTMARSHEIM",lat:47.7960926,lon:7.5241583,emit:1.492388,fa:1.471804},{country:"DE",city:"LEVERKUSEN",lat:51.0542506,lon:6.9243991,emit:1.454066,fa:2.299136},{country:"DE",city:"MÜNCHSMÜNSTER",lat:48.7677969,lon:11.6366946,emit:1.433633,fa:1.11923},{country:"FR",city:"FOS SUR MER",lat:43.4256723,lon:4.8460719,emit:1.382225,fa:1.350924},{country:"BE",city:"GENT",lat:51.0840165,lon:3.4030934,emit:1.202196,fa:0.949565},{country:"BE",city:"ZWIJNDRECHT",lat:51.2240002,lon:4.2824042,emit:1.193515,fa:1.794028},{country:"FR",city:"GONFREVILLE-L'ORCHER",lat:49.4553053,lon:0.2592241,emit:1.190423,fa:0.550246},{country:"BE",city:"KALLO (BEVEREN)",lat:51.2660881,lon:4.2246179,emit:1.116146,fa:0.817137},{country:"DE",city:"DORTMUND",lat:51.5443568,lon:7.4411015,emit:1.094286,fa:0.744122},{country:"BE",city:"FELUY",lat:50.5625782,lon:4.1986857,emit:1.091548,fa:0.668489},{country:"BE",city:"GEEL",lat:51.1163048,lon:5.0010884,emit:1.051408,fa:1.234992},{country:"FR",city:"NOTRE-DAME-DE-GRAVANCHON",lat:49.4794289,lon:0.5447773,emit:0.882808,fa:0.690224},{country:"NL",city:"BERGEN OP ZOOM",lat:51.5086374,lon:4.2484625,emit:0.86257,fa:0.374576},{country:"DE",city:"WORMS",lat:49.6376626,lon:8.2900379,emit:0.850285,fa:0.594261},{country:"DE",city:"BERNBURG",lat:51.7808581,lon:11.6811127,emit:0.725454,fa:0.98668},{country:"NL",city:"EUROPOORT-ROTTERDAM",lat:51.9597475,lon:4.0935622,emit:0.688571,fa:0.603976},{country:"FR",city:"CHALAMPE",lat:47.8137522,lon:7.5356683,emit:0.668259,fa:1.233394},{country:"BE",city:"JEMEPPE",lat:50.4471148,lon:4.6601503,emit:0.647872,fa:0.763681},{country:"FR",city:"FOS-SUR-MER",lat:43.4572238,lon:4.8505942,emit:0.640473,fa:0.397518},{country:"DE",city:"RHEINBERG",lat:51.564094,lon:6.4608375,emit:0.634703,fa:1.803996},{country:"DE",city:"HERNE",lat:51.513247,lon:7.1431362,emit:0.630392,fa:0.570767},{country:"FR",city:"SAINT-CLAIR-DU-RHONE",lat:45.4402634,lon:4.7677693,emit:0.620302,fa:0.406372},{country:"BE",city:"TESSENDERLO",lat:51.050538,lon:4.9994248,emit:0.58622,fa:0.452957},{country:"FR",city:"ANGLEFORT",lat:45.9138429,lon:5.8172339,emit:0.565491,fa:0.541548},{country:"FR",city:"SAINT AVOLD",lat:49.141183,lon:6.7113433,emit:0.563999,fa:0.718128},{country:"DE",city:"STASSFURT",lat:51.8618857,lon:11.5846841,emit:0.529546,fa:1.396407},{country:"DE",city:"WILHELMSHAVEN",lat:53.6223854,lon:8.0575147,emit:0.516791,fa:0.270667}];

    const ANNOTATED = new Set(['ANTWERPEN', 'SITTARD-GELEEN', 'LUDWIGSHAFEN']);
    // narrative order — matches the order cities are introduced across steps 2, 3, 4
    const REVEAL_ORDER = ['ANTWERPEN', 'SITTARD-GELEEN', 'LUDWIGSHAFEN'];

    function featureISO2(f) {
        return f.properties && (f.properties.ISO2 || f.properties.iso2 || f.properties.ISO_A2);
    }

    const emitMax = d3.max(Object.values(COUNTRY_DATA), d => d.emit);
    const choroplethColor = d3.scaleSequential()
        .domain([0, emitMax])
        .interpolator(d3.interpolate('#e8e4da', '#1D9E88'));

    const rScale = d3.scaleSqrt()
        .domain([0, d3.max(CITY_DATA, d => d.emit)])
        .range([2, 28]);

    const projEurope = d3.geoMercator().center([13, 52]).scale(W * 0.85).translate([W / 2, H / 2]);
    const projZoom = d3.geoMercator().center([8.5, 51.2]).scale(W * 4).translate([W / 2, H / 2]);
    const pathEurope = d3.geoPath(projEurope);
    const pathZoom = d3.geoPath(projZoom);

    const offsets = {
        'ANTWERPEN':      { dx: 0, dy: -100, anchor: 'start' },
        'SITTARD-GELEEN': { dx: 0, dy: -100, anchor: 'start' },
        'LUDWIGSHAFEN':   { dx: 0, dy: -100, anchor: 'start' },
    };

    function updateLegend(step) {
        if (step === 1) {
            const steps = [0, 15, 30, 45, 60];
            const swatches = steps.map(v =>
                `<div class="map-leg-item">
                    <span class="map-leg-swatch" style="background:${choroplethColor(v)}"></span>
                    <span>${v === 0 ? '0' : v + ' Mt'}</span>
                </div>`
            ).join('');
            legend.html(`<span style="font-size:10px;color:#aaa;margin-right:4px;">Emissions →</span>${swatches}`);
        } else {
            legend.html(`
                <div class="map-leg-item"><span class="map-leg-circle" style="width:10px;height:10px;background:#293C8C;opacity:0.85"></span>Top 3 cities by free allowances</div>
                <div class="map-leg-item"><span class="map-leg-circle" style="width:10px;height:10px;background:#1D9E88;opacity:0.5"></span>Other cities</div>
                <div class="map-leg-item" style="margin-left:4px;font-size:10px;color:#aaa;">Circle size = verified emissions</div>`);
        }
    }

    // api.applyStep gets filled in once the GeoJSON has loaded (async) — until
    // then, onMapStep's calls are simply no-ops via the `if (api.applyStep)` guard.
    const api = { applyStep: null };

    d3.json('https://raw.githubusercontent.com/leakyMirror/map-of-europe/refs/heads/master/GeoJSON/europe.geojson').then(geojson => {
        const worldFeatures = geojson.features;
        let currentZoomed = false;

        const countryPaths = svg.append('g').attr('class', 'map-countries');

        countryPaths.selectAll('path')
            .data(worldFeatures)
            .join('path')
            .attr('class', 'map-country')
            .attr('d', pathEurope)
            .attr('fill', d => {
                const v = COUNTRY_DATA[featureISO2(d)];
                return v ? choroplethColor(v.emit) : '#ddd';
            })
            .attr('stroke', '#f4f1ea')
            .attr('stroke-width', 0.6)
            .on('mousemove', function(event, d) {
                const v = COUNTRY_DATA[featureISO2(d)];
                if (!v || currentZoomed) return;
                tip.html(`<strong>${d.properties.NAME || featureISO2(d)}</strong><br>Emissions: ${v.emit.toFixed(2)} MtCO₂<br>Free allowances: ${v.fa.toFixed(2)} Mt`)
                    .classed('show', true)
                    .style('left', (event.clientX + 14) + 'px')
                    .style('top', (event.clientY - 36) + 'px');
            })
            .on('mouseleave', () => tip.classed('show', false));

        const cityGroup = svg.append('g').attr('class', 'map-cities').attr('opacity', 0);

        cityGroup.selectAll('circle')
            .data(CITY_DATA)
            .join('circle')
            .attr('class', 'map-city-dot')
            .attr('cx', d => projZoom([d.lon, d.lat])[0])
            .attr('cy', d => projZoom([d.lon, d.lat])[1])
            .attr('r', d => rScale(d.emit))
            .attr('fill', d => ANNOTATED.has(d.city) ? '#293C8C' : '#1D9E88')
            .attr('fill-opacity', d => ANNOTATED.has(d.city) ? 0.85 : 0.45)
            .attr('stroke', '#f4f1ea')
            .attr('stroke-width', 0.5)
            .on('mousemove', function(event, d) {
                if (!currentZoomed) return;
                const ovLabel = d.fa > d.emit
                    ? `<span style="color:#f1948a">+${(d.fa - d.emit).toFixed(2)} Mt surplus</span>`
                    : `<span style="color:#85c1e9">${(d.fa - d.emit).toFixed(2)} Mt deficit</span>`;
                tip.html(`<strong>${d.city}</strong> (${d.country})<br>Emissions: ${d.emit.toFixed(2)} MtCO₂<br>Free allowances: ${d.fa.toFixed(2)} Mt<br>${ovLabel}`)
                    .classed('show', true)
                    .style('left', (event.clientX + 14) + 'px')
                    .style('top', (event.clientY - 36) + 'px');
            })
            .on('mouseleave', () => tip.classed('show', false));

        const annotGroup = svg.append('g').attr('class', 'map-annots').attr('opacity', 0);
        const annotData = CITY_DATA.filter(d => ANNOTATED.has(d.city));
        const cityAnnotGroups = {};

        annotData.forEach(d => {
            const [cx, cy] = projZoom([d.lon, d.lat]);
            const r = rScale(d.emit);
            const off = offsets[d.city];
            const lx = cx + off.dx;
            const ly = cy + off.dy;

            const g = annotGroup.append('g').attr('class', 'map-annot-city').style('opacity', 0);

            g.append('line')
                .attr('x1', cx).attr('y1', cy - r)
                .attr('x2', lx).attr('y2', ly + 12)
                .attr('stroke', '#293C8C')
                .attr('stroke-width', 0.8)
                .attr('stroke-dasharray', '2,2');

            g.append('text')
                .attr('x', lx).attr('y', ly)
                .attr('text-anchor', off.anchor)
                .attr('font-size', 8.5)
                .attr('font-weight', '700')
                .attr('fill', '#293C8C')
                .text(d.city === 'ANTWERPEN' ? 'Antwerpen' : d.city === 'SITTARD-GELEEN' ? 'Sittard-Geleen' : 'Ludwigshafen');

            g.append('text')
                .attr('x', lx).attr('y', ly + 11)
                .attr('text-anchor', off.anchor)
                .attr('font-size', 7.5)
                .attr('fill', '#888')
                .text(`${d.emit.toFixed(1)} Mt emit · ${d.fa.toFixed(1)} Mt FA`);

            cityAnnotGroups[d.city] = g;
        });

        function applyStep(step) {
            const DUR = 700;

            if (step === 1) {
                currentZoomed = false;
                svg.selectAll('.map-country')
                    .transition().duration(DUR)
                    .attr('d', pathEurope)
                    .attr('fill', d => {
                        const v = COUNTRY_DATA[featureISO2(d)];
                        return v ? choroplethColor(v.emit) : '#ddd';
                    })
                    .attr('stroke-width', 0.6);

                cityGroup.transition().duration(DUR / 2).attr('opacity', 0);
                annotGroup.transition().duration(DUR / 2).attr('opacity', 0);
            } else {
                // steps 2-4 share the same zoomed-in view; only the set of
                // revealed city annotations changes (cumulative, one per step)
                currentZoomed = true;
                svg.selectAll('.map-country')
                    .transition().duration(DUR)
                    .attr('d', pathZoom)
                    .attr('fill', d => {
                        const iso2 = featureISO2(d);
                        return ['NL', 'DE', 'BE'].includes(iso2) ? '#d5cfc4' : '#ece8df';
                    })
                    .attr('stroke-width', 0.4);

                cityGroup.transition().duration(DUR).attr('opacity', 1);
                annotGroup.transition().duration(DUR).attr('opacity', 1);

                const revealCount = step - 1; // step 2 -> 1 city, step 3 -> 2, step 4 -> 3
                const citiesToShow = REVEAL_ORDER.slice(0, revealCount);
                Object.entries(cityAnnotGroups).forEach(([city, g]) => {
                    g.transition().duration(DUR).style('opacity', citiesToShow.includes(city) ? 1 : 0);
                });
            }

            updateLegend(step === 1 ? 1 : 2);
        }

        api.applyStep = applyStep;
        applyStep(1);
    });

    return api;
}

function onMapStep(api, stepNum) {
    if (api.applyStep) api.applyStep(Number(stepNum));
}


var width = d3.select('body').node().offsetWidth;

initScrolly({
    width: width,
    sectionId: 'headline',
    drawChart: drawHeadlineChart,
    onStep: onHeadlineStep
});

initScrolly({
    width: width,
    sectionId: 'scroll',
    drawChart: drawChemicalsChart,
    onStep: onChemicalsStep
});

initScrolly({
    width: width,
    sectionId: 'map',
    drawChart: drawMapChart,
    onStep: onMapStep
});