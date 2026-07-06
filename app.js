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
    var chartApi = config.drawChart(config.width, config.height, chart);

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
function drawHeadlineChart(fullWidth, fullHeight, chart) {
    const margin = {top: 20, right: fullWidth*0.05, bottom: 20, left: fullWidth*0.05},
        width = (fullWidth > 768 ? fullWidth / 2 : fullWidth) - margin.left - margin.right;

    const TOTAL = 32;
    const cols = 8;
    const rows = Math.ceil(TOTAL / cols);
    const gap = 6;
    const iconW = (width - (cols - 1) * gap) / cols;
    const iconH = iconW * (165 / 130); // aspect ratio of the path's viewBox
    const gridHeight = rows * iconH + (rows - 1) * gap;
    // height is derived from the grid — never clips regardless of screen size
    const height = gridHeight;

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

    const towers = svg.selectAll('.eiffel-tower')
        .data(d3.range(TOTAL))
        .join('use')
        .attr('class', 'eiffel-tower')
        .attr('href', '#eiffel-icon')
        .attr('x', d => (d % cols) * (iconW + gap))
        .attr('y', d => Math.floor(d / cols) * (iconH + gap))
        .attr('width', iconW)
        .attr('height', iconH)
        .attr('fill', 'black')
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
function drawChemicalsChart(fullWidth, fullHeight, chart) {
    const margin = {top: 10, right: fullWidth*0.05, bottom: 30, left: fullWidth*0.1},
        width = (fullWidth>768?fullWidth/2:fullWidth) - margin.left - margin.right,
        height = Math.min(Math.round(width * 0.75), fullWidth <= 768 ? fullHeight * 0.42 : fullHeight * 0.75) - margin.top - margin.bottom;

    const svg = chart.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .style("width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const industry_granular = [{"year":2008,"sector":"Chemicals","open":true,"fa":60.241486,"em":52.859351},{"year":2008,"sector":"Chemicals","open":false,"fa":11.270157,"em":9.117326},{"year":2008,"sector":"Refineries","open":false,"fa":null,"em":139.152818},{"year":2008,"sector":"Other industrial emissions","open":false,"fa":null,"em":499.536947},{"year":2009,"sector":"Chemicals","open":true,"fa":63.036221,"em":49.595411},{"year":2009,"sector":"Chemicals","open":false,"fa":11.28648,"em":8.493421},{"year":2009,"sector":"Refineries","open":false,"fa":null,"em":130.535714},{"year":2009,"sector":"Other industrial emissions","open":false,"fa":null,"em":400.301791},{"year":2010,"sector":"Chemicals","open":true,"fa":63.07499,"em":53.528965},{"year":2010,"sector":"Chemicals","open":false,"fa":11.847688,"em":9.186736},{"year":2010,"sector":"Refineries","open":false,"fa":null,"em":127.515132},{"year":2010,"sector":"Other industrial emissions","open":false,"fa":null,"em":430.389851},{"year":2011,"sector":"Chemicals","open":true,"fa":64.136854,"em":52.436056},{"year":2011,"sector":"Chemicals","open":false,"fa":11.873344,"em":9.505056},{"year":2011,"sector":"Refineries","open":false,"fa":null,"em":127.907556},{"year":2011,"sector":"Other industrial emissions","open":false,"fa":null,"em":425.643976},{"year":2012,"sector":"Chemicals","open":true,"fa":64.759328,"em":50.250059},{"year":2012,"sector":"Chemicals","open":false,"fa":12.080777,"em":9.187353},{"year":2012,"sector":"Refineries","open":false,"fa":null,"em":124.142434},{"year":2012,"sector":"Other industrial emissions","open":false,"fa":null,"em":407.733324},{"year":2013,"sector":"Chemicals","open":true,"fa":95.655106,"em":91.487226},{"year":2013,"sector":"Chemicals","open":false,"fa":31.11588,"em":29.052833},{"year":2013,"sector":"Refineries","open":false,"fa":null,"em":134.529789},{"year":2013,"sector":"Other industrial emissions","open":false,"fa":null,"em":459.700154},{"year":2014,"sector":"Chemicals","open":true,"fa":94.012383,"em":92.150342},{"year":2014,"sector":"Chemicals","open":false,"fa":29.61896,"em":25.642002},{"year":2014,"sector":"Refineries","open":false,"fa":null,"em":130.911825},{"year":2014,"sector":"Other industrial emissions","open":false,"fa":null,"em":463.439662},{"year":2015,"sector":"Chemicals","open":true,"fa":91.370519,"em":91.329036},{"year":2015,"sector":"Chemicals","open":false,"fa":25.916074,"em":24.624648},{"year":2015,"sector":"Refineries","open":false,"fa":null,"em":134.236976},{"year":2015,"sector":"Other industrial emissions","open":false,"fa":null,"em":460.8128},{"year":2016,"sector":"Chemicals","open":true,"fa":89.206973,"em":90.40748},{"year":2016,"sector":"Chemicals","open":false,"fa":24.848127,"em":24.538324},{"year":2016,"sector":"Refineries","open":false,"fa":null,"em":133.975129},{"year":2016,"sector":"Other industrial emissions","open":false,"fa":null,"em":455.016096},{"year":2017,"sector":"Chemicals","open":true,"fa":87.462276,"em":93.209011},{"year":2017,"sector":"Chemicals","open":false,"fa":24.214534,"em":25.347643},{"year":2017,"sector":"Refineries","open":false,"fa":null,"em":132.800115},{"year":2017,"sector":"Other industrial emissions","open":false,"fa":null,"em":465.392667},{"year":2018,"sector":"Chemicals","open":true,"fa":86.110858,"em":90.819311},{"year":2018,"sector":"Chemicals","open":false,"fa":23.166241,"em":24.019189},{"year":2018,"sector":"Refineries","open":false,"fa":null,"em":131.236927},{"year":2018,"sector":"Other industrial emissions","open":false,"fa":null,"em":465.679052},{"year":2019,"sector":"Chemicals","open":true,"fa":85.307961,"em":89.451195},{"year":2019,"sector":"Chemicals","open":false,"fa":22.340981,"em":23.019281},{"year":2019,"sector":"Refineries","open":false,"fa":null,"em":130.814598},{"year":2019,"sector":"Other industrial emissions","open":false,"fa":null,"em":454.954253},{"year":2020,"sector":"Chemicals","open":true,"fa":83.957582,"em":87.754093},{"year":2020,"sector":"Chemicals","open":false,"fa":21.695216,"em":22.429886},{"year":2020,"sector":"Refineries","open":false,"fa":null,"em":120.348166},{"year":2020,"sector":"Other industrial emissions","open":false,"fa":null,"em":419.342129},{"year":2021,"sector":"Chemicals","open":true,"fa":91.389972,"em":103.784135},{"year":2021,"sector":"Chemicals","open":false,"fa":0.196747,"em":1.07871},{"year":2021,"sector":"Refineries","open":false,"fa":null,"em":110.164427},{"year":2021,"sector":"Other industrial emissions","open":false,"fa":null,"em":399.451185},{"year":2022,"sector":"Chemicals","open":true,"fa":92.18861,"em":87.84449},{"year":2022,"sector":"Chemicals","open":false,"fa":0.142014,"em":0.189544},{"year":2022,"sector":"Refineries","open":false,"fa":null,"em":116.800757},{"year":2022,"sector":"Other industrial emissions","open":false,"fa":null,"em":368.422002},{"year":2023,"sector":"Chemicals","open":true,"fa":85.710127,"em":81.593239},{"year":2023,"sector":"Chemicals","open":false,"fa":0.077265,"em":0.126564},{"year":2023,"sector":"Refineries","open":false,"fa":null,"em":112.505127},{"year":2023,"sector":"Other industrial emissions","open":false,"fa":null,"em":334.282725},{"year":2024,"sector":"Chemicals","open":true,"fa":75.006441,"em":84.678472},{"year":2024,"sector":"Chemicals","open":false,"fa":0.021409,"em":0.03436},{"year":2024,"sector":"Refineries","open":false,"fa":null,"em":112.716276},{"year":2024,"sector":"Other industrial emissions","open":false,"fa":null,"em":329.170498}];
    const chemicals_em_fa = d3.rollup(industry_granular.filter(d => d.sector == 'Chemicals'), (v, d) => Object.fromEntries(
            ['em', 'fa'].map((col) => [col, d3.sum(v, (d) => +d[col])])
        ), d => d.year);

    const max_chemicals = d3.max(chemicals_em_fa.values(), d => d.em) * 1.2;
    const max_industry = d3.max(industry_granular.map(d=>d.em)) * 1.5;

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


    svg.selectAll('.background-em')
        .data([[...chemicals_em_fa.keys()]])
        .join('path')
        .attr('class','background-em')
        .style('fill','#FCC480')
        .attr('d', d3.area()
            .x(d=>x(d))
            .y0(y(0))
            .y1(d => y(chemicals_em_fa.get(d).em))
        )           

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
        .attr('class', 'total-emissions-label sub')
        .attr('x', x(2018))
        .attr('y', y(60))
        .attr('dy', 24)
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
        .attr('dy', 17)
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
        .attr('dy', 9)
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
        .style('fill','black')
        .style('opacity', 0);

    svg.append('text')
        .attr('class', 'emissions-label s-2')
        .attr('x', x(2024))
        .attr('y', y(chemicals_em_fa.get(2024).em))
        .attr('dx', -2)
        .attr('dy', 32)
        .style('text-anchor', 'end')
        .style('fill','black')
        .text('increase')
        .style('opacity', 0);

    return { svg, x, y, color_sectors, sectors, chemicals_em_fa, max_chemicals, max_industry };
}

function onChemicalsStep(api, stepNum) {
    const svg = api.svg;
    const color_sectors = api.color_sectors;
    const sectors = api.sectors;

    if (stepNum == 1) {
        svg.selectAll('.emissions').transition().duration(1000).style("opacity", 0.2);
        svg.selectAll('.total-emissions-label').transition().duration(1000).style("opacity", 1);
        svg.selectAll('.sector').transition().duration(1000).style('fill', d => color_sectors(sectors[d.key]));
        svg.selectAll('.emissions-mark.s-2').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.emissions-label.s-2').transition().duration(1000).style("opacity", 0);
    }

    if (stepNum == 2) {
        api.y.domain([0, api.max_chemicals])

        d3.select(".axis-y")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(api.y));        
        
        svg.selectAll('.sector').transition().duration(1000)
            .attr("d", d3.area()
                .x(d => api.x(d.data[0]))
                .y0(d => api.y(d[0]))
                .y1(d => api.y(d[1]))
            )
            .style('fill', d => d.key == 0 ? color_sectors('Chemicals') : 'lightgrey');
        svg.selectAll('.background-em').transition().duration(1000)
            .attr('d', d3.area()
                .x(d=>api.x(d))
                .y0(api.y(0))
                .y1(d => api.y(api.chemicals_em_fa.get(d).em))
            )   

        svg.selectAll('.sector-label').transition().duration(1000).style("opacity", 0);
        svg.selectAll('.emissions').transition().duration(500).style("opacity", 0);
        svg.selectAll('.total-emissions-label').transition().duration(500).style("opacity", 0);
        svg.selectAll('.emissions-mark').transition().duration(1000).style("opacity", 1);
        svg.selectAll('.emissions-label').transition().duration(1000).style("opacity", 1);
        svg.selectAll(".sector").style('opacity', d => sectors[d.key] == 'Chemicals' ? 1 : 0);
    }

    if (stepNum == 3) {
        api.y.domain([0, api.max_industry])

        d3.select(".axis-y")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(api.y));              

        svg.selectAll('.sector').transition().duration(1000)
            .attr("d", d3.area()
                .x(d => api.x(d.data[0]))
                .y0(d => api.y(d[0]))
                .y1(d => api.y(d[1]))
            )
            .style('fill', d => color_sectors(sectors[d.key]))
            .style('opacity', 1);            

        svg.selectAll('.background-em').transition().duration(1000)
            .attr('d', d3.area()
                .x(d=>api.x(d))
                .y0(api.y(0))
                .y1(d => api.y(api.chemicals_em_fa.get(d).em))
            )
            
        svg.selectAll('.sector-label').transition().duration(1000)
            .attr('y', d => api.y(d.v))
            .style("opacity", 1);
            


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
function drawMapChart(fullWidth, fullHeight, chart) {
    const margin = {top: 0, right: fullWidth * 0.05, bottom: 10, left: fullWidth * 0.05},
        width = (fullWidth > 768 ? fullWidth / 2 : fullWidth) - margin.left - margin.right,
        W = width,
        H = Math.min(Math.round(W * 0.72), fullWidth <= 768 ? Math.round(fullHeight * 0.42) : Infinity);

    const legend = chart.append('div').attr('class', 'map-legend');
    chart.append('div').attr('class', 'source-note').text('Hover over a country or city for details');        

    const svg = chart.append("svg")
        .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
        .style("width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'black');

    const tip = d3.select('body').append('div').attr('class', 'map-tip');

    const COUNTRY_DATA={NL:{emit:67.042566,fa:58.274091},DE:{emit:61.466473,fa:63.346983},FR:{emit:46.121302,fa:42.519758},BE:{emit:36.036433,fa:36.60445},ES:{emit:29.406783,fa:25.718685},PL:{emit:22.049517,fa:26.231765},IT:{emit:20.964698,fa:21.648592},CZ:{emit:16.237375,fa:7.408368},HU:{emit:9.25879,fa:9.072569},BG:{emit:9.08892,fa:6.970447},NO:{emit:6.997748,fa:8.063822},LT:{emit:6.621213,fa:6.640534},SK:{emit:5.735334,fa:5.378533},AT:{emit:5.683666,fa:7.069392},SE:{emit:4.353249,fa:4.249356},FI:{emit:3.232636,fa:3.927976},RO:{emit:2.802308,fa:4.489573},PT:{emit:2.667551,fa:3.218137},HR:{emit:1.620223,fa:2.246387},GR:{emit:1.051978,fa:1.143141},DK:{emit:.563135,fa:.228686},IE:{emit:.20298,fa:.09462},SI:{emit:.124636,fa:.18672},EE:{emit:0,fa:0}};

    const CITY_DATA=[{country:"BE",city:"ANTWERPEN",lat:51.3366241,lon:4.2105982,emit:23.223619,fa:24.217231},{country:"NL",city:"SITTARD-GELEEN",lat:50.9897333,lon:5.721966,emit:15.732792,fa:14.55317},{country:"NL",city:"HOEK",lat:51.3357178,lon:3.783363,emit:13.937656,fa:9.267993},{country:"DE",city:"LUDWIGSHAFEN",lat:49.4874847,lon:8.3050029,emit:12.128187,fa:14.866371},{country:"NL",city:"SLUISKIL",lat:51.2749874,lon:3.8198167,emit:11.770532,fa:12.127517},{country:"NL",city:"MOERDIJK",lat:51.6843913,lon:4.5597576,emit:9.544309,fa:6.889895},{country:"DE",city:"KÖLN",lat:51.04638,lon:6.7907003,emit:8.225429,fa:8.217236},{country:"DE",city:"LUTHERSTADT WITTENBERG",lat:51.8677155,lon:12.5280291,emit:8.080171,fa:7.541045},{country:"FR",city:"LAVERA",lat:43.3880876,lon:5.0202478,emit:5.976176,fa:3.936666},{country:"DE",city:"WESSELING",lat:50.819134,lon:6.937942,emit:5.557275,fa:5.415494},{country:"NL",city:"ROTTERDAM",lat:51.9442057,lon:4.4101739,emit:4.611623,fa:3.358735},{country:"DE",city:"BOEHLEN",lat:51.187974,lon:12.3520774,emit:3.94795,fa:2.56313},{country:"FR",city:"PORT JEROME SUR SEINE",lat:49.4805836,lon:0.5696762,emit:3.184259,fa:3.065377},{country:"FR",city:"GONFREVILLE L'ORCHEZ",lat:49.4796829,lon:0.1932719,emit:2.827773,fa:2.01229},{country:"NL",city:"BOTLEK-ROTTERDAM",lat:51.8694444,lon:4.2864969,emit:2.794185,fa:2.064584},{country:"DE",city:"GROSSENKNETEN",lat:52.9533113,lon:8.2192285,emit:2.413186,fa:0.710982},{country:"BE",city:"TERTRE",lat:50.4795883,lon:3.8010306,emit:2.254633,fa:2.329844},{country:"DE",city:"LEUNA",lat:51.3254592,lon:12.0102885,emit:2.218111,fa:1.411937},{country:"NL",city:"BOTLEK ROTTERDAM",lat:51.8736195,lon:4.2545821,emit:2.08615,fa:2.189623},{country:"FR",city:"MARDYCK",lat:51.0292492,lon:2.2434177,emit:2.076441,fa:1.497479},{country:"DE",city:"MARL",lat:51.686478,lon:7.075579,emit:2.071277,fa:2.094572},{country:"FR",city:"DOMBASLE-SUR-MEURTHE",lat:48.6244746,lon:6.3474444,emit:2.052288,fa:1.658491},{country:"NL",city:"ROTTERDAM",lat:51.9442057,lon:4.4101739,emit:1.814835,fa:0.844231},{country:"FR",city:"LE GRAND QUEVILLY",lat:49.4233415,lon:1.0309151,emit:1.775025,fa:1.38162},{country:"FR",city:"LANEUVEVILLE DEVANT NANCY",lat:48.6406366,lon:6.2676707,emit:1.640395,fa:1.743136},{country:"FR",city:"OTTMARSHEIM",lat:47.7960926,lon:7.5241583,emit:1.492388,fa:1.471804},{country:"DE",city:"LEVERKUSEN",lat:51.0542506,lon:6.9243991,emit:1.454066,fa:2.299136},{country:"DE",city:"MÜNCHSMÜNSTER",lat:48.7677969,lon:11.6366946,emit:1.433633,fa:1.11923},{country:"FR",city:"FOS SUR MER",lat:43.4256723,lon:4.8460719,emit:1.382225,fa:1.350924},{country:"BE",city:"GENT",lat:51.0840165,lon:3.4030934,emit:1.202196,fa:0.949565},{country:"BE",city:"ZWIJNDRECHT",lat:51.2240002,lon:4.2824042,emit:1.193515,fa:1.794028},{country:"FR",city:"GONFREVILLE-L'ORCHER",lat:49.4553053,lon:0.2592241,emit:1.190423,fa:0.550246},{country:"BE",city:"KALLO (BEVEREN)",lat:51.2660881,lon:4.2246179,emit:1.116146,fa:0.817137},{country:"DE",city:"DORTMUND",lat:51.5443568,lon:7.4411015,emit:1.094286,fa:0.744122},{country:"BE",city:"FELUY",lat:50.5625782,lon:4.1986857,emit:1.091548,fa:0.668489},{country:"BE",city:"GEEL",lat:51.1163048,lon:5.0010884,emit:1.051408,fa:1.234992},{country:"FR",city:"NOTRE-DAME-DE-GRAVANCHON",lat:49.4794289,lon:0.5447773,emit:0.882808,fa:0.690224},{country:"NL",city:"BERGEN OP ZOOM",lat:51.5086374,lon:4.2484625,emit:0.86257,fa:0.374576},{country:"DE",city:"WORMS",lat:49.6376626,lon:8.2900379,emit:0.850285,fa:0.594261},{country:"DE",city:"BERNBURG",lat:51.7808581,lon:11.6811127,emit:0.725454,fa:0.98668},{country:"NL",city:"EUROPOORT-ROTTERDAM",lat:51.9597475,lon:4.0935622,emit:0.688571,fa:0.603976},{country:"FR",city:"CHALAMPE",lat:47.8137522,lon:7.5356683,emit:0.668259,fa:1.233394},{country:"BE",city:"JEMEPPE",lat:50.4471148,lon:4.6601503,emit:0.647872,fa:0.763681},{country:"FR",city:"FOS-SUR-MER",lat:43.4572238,lon:4.8505942,emit:0.640473,fa:0.397518},{country:"DE",city:"RHEINBERG",lat:51.564094,lon:6.4608375,emit:0.634703,fa:1.803996},{country:"DE",city:"HERNE",lat:51.513247,lon:7.1431362,emit:0.630392,fa:0.570767},{country:"FR",city:"SAINT-CLAIR-DU-RHONE",lat:45.4402634,lon:4.7677693,emit:0.620302,fa:0.406372},{country:"BE",city:"TESSENDERLO",lat:51.050538,lon:4.9994248,emit:0.58622,fa:0.452957},{country:"FR",city:"ANGLEFORT",lat:45.9138429,lon:5.8172339,emit:0.565491,fa:0.541548},{country:"FR",city:"SAINT AVOLD",lat:49.141183,lon:6.7113433,emit:0.563999,fa:0.718128},{country:"DE",city:"STASSFURT",lat:51.8618857,lon:11.5846841,emit:0.529546,fa:1.396407},{country:"DE",city:"WILHELMSHAVEN",lat:53.6223854,lon:8.0575147,emit:0.516791,fa:0.270667}];

    const REVEAL_ORDER = ['ANTWERPEN', 'SITTARD-GELEEN', 'LUDWIGSHAFEN']; // narrative order — matches the order cities are introduced across steps 2, 3, 4
    const ANNOTATED = new Set(REVEAL_ORDER);

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
        'SITTARD-GELEEN': { dx: 0, dy: -65, anchor: 'start' },
        'LUDWIGSHAFEN':   { dx: 0, dy: -65, anchor: 'start' },
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
        const worldFeatures = geojson.features.filter(d => d.properties.NAME !== 'Russia');
        console.log()
        let currentZoomed = false;

        const countryPaths = svg.append('g').attr('class', 'map-countries');

        const countryPathSel = countryPaths.selectAll('path')
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


        countryPathSel
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
                    ? `<span style="color:#f1948a">+${d3.format(',.0f')(d.fa*1000000 - d.emit*1000000)} tonnes overallocated</span>`
                    : `<span style="color:#85c1e9">${d3.format(',.0%')(d.fa/d.emit)} emissions covered for free</span>`;
                tip.html(`<strong>${d.city}</strong> (${d.country})<br>Emissions: ${d.emit.toFixed(2)} MtCO₂<br>Free allowances: ${d.fa.toFixed(2)} Mt<br>${ovLabel}`)
                    .classed('show', true)
                    .style('left', (event.clientX + 14) + 'px')
                    .style('top', (event.clientY - 36) + 'px');
            })
            .on('mouseleave', () => tip.classed('show', false));

        // top-N countries by verified emissions get a permanent label on the
        // choropleth (step 1) showing name + emissions/free-allowance figures
        const TOP_N_COUNTRIES = 5;
        const topCountryFeatures = worldFeatures
            .filter(d => COUNTRY_DATA[featureISO2(d)])
            .sort((a, b) => COUNTRY_DATA[featureISO2(b)].emit - COUNTRY_DATA[featureISO2(a)].emit)
            .slice(0, TOP_N_COUNTRIES);

        const countryLabelGroup = svg.append('g')
            .attr('class', 'map-country-labels')
            .style('pointer-events', 'none'); // never block hover on the country paths beneath

        const countryLabelSel = countryLabelGroup.selectAll('g.map-country-label')
            .data(topCountryFeatures)
            .join('g')
            .attr('class', 'map-country-label')
            .attr('transform', d => {
                const [x, y] = pathEurope.centroid(d);
                return `translate(${x},${y})`;
            });

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

            g.append('rect')
                .attr('x', cx-5)
                .attr('y', ly-20)
                .attr('width',fullWidth > 1500?330:200)
                .attr('height',40)
                .attr('rx',5)
                .attr('fill', '#7d7d7d')
                .style('opacity',0.8)
                .attr('stroke', '#293C8C')
                .attr('stroke-width', 0.8)
                .attr('stroke-dasharray', '2,2');                         

            g.append('text')
                .attr('class','city-label-name')
                .attr('x', lx).attr('y', ly)
                .attr('text-anchor', off.anchor)
                .attr('font-weight', '700')
                .attr('fill', '#293C8C')
                .text(d.city === 'ANTWERPEN' ? 'Antwerpen' : d.city === 'SITTARD-GELEEN' ? 'Sittard-Geleen' : 'Ludwigshafen');

            g.append('text')
                .attr('class','city-label-figures')
                .attr('x', lx).attr('y', ly + (fullWidth > 1000? 15: 11))
                .attr('text-anchor', off.anchor)
                .attr('fill', 'black')
                .text(`${d.emit.toFixed(1)} Mt emitted · ${d.fa.toFixed(1)} M free allowances`);

            cityAnnotGroups[d.city] = g;
        });

        // shared by steps 2, 3, and 4 — they all show the same zoomed-in
        // view and differ only in which cities' annotations are revealed
        function showZoomedView(citiesToShow) {
            const DUR = 700;
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
            countryLabelGroup.transition().duration(DUR / 2).attr('opacity', 0);

            Object.entries(cityAnnotGroups).forEach(([city, g]) => {
                g.transition().duration(DUR).style('opacity', citiesToShow.includes(city) ? 1 : 0);
            });

            updateLegend(2);
        }

        function applyStep(stepNum) {
            const DUR = 700;

            if (stepNum == 1) {
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
                countryLabelGroup.transition().duration(DUR).attr('opacity', 1);
                updateLegend(1);
            }

            if (stepNum == 2) {
                showZoomedView(REVEAL_ORDER.slice(0, 1)); // Antwerpen
            }

            if (stepNum == 3) {
                showZoomedView(REVEAL_ORDER.slice(0, 2)); // + Sittard-Geleen
            }

            if (stepNum == 4) {
                showZoomedView(REVEAL_ORDER.slice(0, 3)); // + Ludwigshafen
            }
        }

        api.applyStep = applyStep;
        applyStep(1);
    });

    return api;
}

// The map's GeoJSON loads asynchronously, so its step logic (applyStep,
// above) can only be wired up once that data has arrived — api.applyStep
// stays null until then, hence the guard below.
function onMapStep(api, stepNum) {
    if (api.applyStep) api.applyStep(stepNum);
}

/* ============================================================
   WAFFLE SECTION — dot-grid + bar showing free allowance
   concentration across all 707 recipient companies.
   drawWaffleChart returns the raw elements; onWaffleStep (below
   the function) drives the 4 steps directly, same pattern as
   onHeadlineStep and onChemicalsStep.
   ============================================================ */
function drawWaffleChart(fullWidth, fullHeight, chart) {
    const margin = {top: 10, right: 0, bottom: 5, left: 20},
        outerWidth = (fullWidth > 768 ? fullWidth / 2 : fullWidth) - margin.left - margin.right;

    const TOTAL_FA = 79.692;

    function grp(d) {
        if (d.c <= 0.5) return 0;
        if (d.c <= 0.803) return 1;
        return 2;
    }
    const GRP_COLORS = [ '#40B4C9','lightgrey', '#54F9DB'];

    const isMobile = fullWidth <= 768;
    const COLS = 30; // 30 fills the width well on both mobile and desktop
    const BAR_GAP = 16;
    const BAR_RECT = isMobile ? 16 : 40;
    const BAR_LABEL_W = isMobile ? 28 : 36;
    const BAR_W = BAR_RECT + BAR_LABEL_W;
    const DOT_GAP = isMobile ? 1 : 3;

    const OWNERS=[{i:0,n:"BASF SE",fa:27.853287,em:22.065991,ov:true,c:0.08},{i:1,n:"YARA INT.",fa:19.269035,em:17.611799,ov:true,c:0.14},{i:2,n:"AGROFERT",fa:13.616707,em:13.015117,ov:true,c:0.18},{i:3,n:"GRUPA AZOTY",fa:12.53443,em:10.27033,ov:true,c:0.21},{i:4,n:"INEOS",fa:12.205747,em:9.852688,ov:true,c:0.25},{i:5,n:"SAUDI ARABIAN OIL CO.",fa:12.177072,em:12.15787,ov:true,c:0.28},{i:6,n:"LYONDELLBASELL",fa:8.695096,em:8.300011,ov:true,c:0.31},{i:7,n:"L'AIR LIQUIDE",fa:7.645515,em:10.956462,ov:false,c:0.33},{i:8,n:"ENI",fa:6.93988,em:6.108887,ov:true,c:0.35},{i:9,n:"ORLEN",fa:6.799078,em:12.793809,ov:false,c:0.37},{i:10,n:"DOW",fa:6.785741,em:10.025863,ov:false,c:0.39},{i:11,n:"OMV",fa:6.102135,em:6.148483,ov:false,c:0.41},{i:12,n:"SOLVAC",fa:5.822065,em:6.496223,ov:false,c:0.42},{i:13,n:"SHELL",fa:5.792498,em:7.070219,ov:false,c:0.44},{i:14,n:"TOTALENERGIES",fa:4.904674,em:6.487657,ov:false,c:0.46},{i:15,n:"ACHEMOS",fa:4.107105,em:4.298908,ov:false,c:0.47},{i:16,n:"CHEMELOT",fa:3.913619,em:4.510527,ov:false,c:0.48},{i:17,n:"YARA SLUISKIL",fa:3.393943,em:3.191234,ov:true,c:0.49},{i:18,n:"EXXON MOBIL",fa:3.16094,em:4.491534,ov:false,c:0.5},{i:19,n:"BASF ANTWERPEN",fa:3.132865,em:3.004925,ov:true,c:0.51},{i:20,n:"NITROGÉNMÛVEK",fa:2.958045,em:2.90964,ov:true,c:0.52},{i:21,n:"REPSOL",fa:2.812726,em:3.386561,ov:false,c:0.52},{i:22,n:"NAPHTACHIMIE",fa:2.640493,em:4.470524,ov:false,c:0.53},{i:23,n:"EVONIK INDUSTRIES AG",fa:2.517386,em:3.108567,ov:false,c:0.54},{i:24,n:"DOW BENELUX B.V.",fa:2.482252,em:3.911793,ov:false,c:0.55},{i:25,n:"GRUPA AZOTY ZAKLADY AZOTOWE PULAWY S.A.",fa:2.41269,em:2.251769,ov:true,c:0.55},{i:26,n:"LUGLIO LIMITED",fa:2.366623,em:0.83017,ov:true,c:0.56},{i:27,n:"MOL PETROLKÉMIA ZRT.",fa:2.340556,em:2.960233,ov:false,c:0.57},{i:28,n:"AIR PRODUCTS AND CHEMICALS, INC.",fa:2.252174,em:2.804528,ov:false,c:0.57},{i:29,n:"VERSALIS S.P.A.",fa:2.029223,em:2.129362,ov:false,c:0.58},{i:30,n:"ORION S.A.",fa:2.016295,em:2.807297,ov:false,c:0.59},{i:31,n:"LANXESS AG",fa:2.008752,em:1.221085,ov:true,c:0.59},{i:32,n:"SKW STICKSTOFFWERKE PIESTERITZ GMBH",fa:1.968948,em:2.554518,ov:false,c:0.6},{i:33,n:"TIPA HOLDING AG",fa:1.967674,em:0.759802,ov:true,c:0.6},{i:34,n:"NEOCHIM PLC",fa:1.890864,em:2.305643,ov:false,c:0.61},{i:35,n:"AB ACHEMA",fa:1.866679,em:2.208916,ov:false,c:0.61},{i:36,n:"DOW SWITZERLAND HOLDING S.A.",fa:1.842403,em:2.17462,ov:false,c:0.62},{i:37,n:"DOW ZEELAND HOLDING B.V.",fa:1.808312,em:2.124152,ov:false,c:0.62},{i:38,n:"DOW INTERNATIONAL HOLDINGS CO",fa:1.793647,em:2.072436,ov:false,c:0.63},{i:39,n:"SHELL NEDERLAND CHEMIE B.V.",fa:1.775376,em:2.614587,ov:false,c:0.63},{i:40,n:"TRIFUCHSIA HOLDCO S.À R.L.",fa:1.771943,em:1.932566,ov:false,c:0.64},{i:41,n:"LINDE PUBLIC LIMITED COMPANY",fa:1.754873,em:3.214759,ov:false,c:0.64},{i:42,n:"WANHUA CHEMICAL GROUP CO.,LTD.",fa:1.746543,em:0.738149,ov:true,c:0.65},{i:43,n:"MOL MAGYAR OLAJ-ES GAZIPARE RESZVENYTAR",fa:1.607872,em:1.844715,ov:false,c:0.65},{i:44,n:"LENZING AG",fa:1.435681,em:0.689847,ov:true,c:0.66},{i:45,n:"SOLVAY QUÍMICA S.L.",fa:1.43113,em:1.94733,ov:false,c:0.66},{i:46,n:"BASELL POLYOLEFINE GMBH",fa:1.38417,em:1.73204,ov:false,c:0.67},{i:47,n:"INDORAMA VENTURES PCL",fa:1.369672,em:0.619411,ov:true,c:0.67},{i:48,n:"CIECH SA",fa:1.353714,em:0.5608,ov:true,c:0.67},{i:49,n:"CEPSA HOLDING L.L.C.",fa:1.344869,em:1.248074,ov:true,c:0.68},{i:50,n:"RADICIFIN S.A.P.A. DI PAOLO PARTECIPAZIONI S.R.L. UNIP. ANGELO RADICI PARTECIPAZIONI S.R.L. UNIP. MAURIZIO RADICI PARTECIPAZIONI S.R.L. UNIP.",fa:1.328988,em:0.450691,ov:true,c:0.68},{i:51,n:"YILDIRIM HOLDING ANONIM SIRKETI",fa:1.318598,em:0.787573,ov:true,c:0.69},{i:52,n:"VENATOR MATERIALS PLC",fa:1.309442,em:1.235669,ov:true,c:0.69},{i:53,n:"COVESTRO AG",fa:1.303882,em:0.481458,ov:true,c:0.69},{i:54,n:"SOLVAY CHIMICA ITALIA SPA",fa:1.287002,em:0.641093,ov:true,c:0.7},{i:55,n:"EQUINOR ASA",fa:1.244904,em:0.73408,ov:true,c:0.7},{i:56,n:"AZOMURES SA",fa:1.238321,em:1.30807,ov:false,c:0.7},{i:57,n:"BUTACHIMIE SNC",fa:1.233394,em:0.668259,ov:true,c:0.71},{i:58,n:"SOLVAY PARTICIPATIONS BELGIQUE",fa:1.222666,em:1.157487,ov:true,c:0.71},{i:59,n:"ARKEMA",fa:1.22022,em:0.977615,ov:true,c:0.72},{i:60,n:"SOLVAY CHEMICALS GMBH",fa:1.216292,em:0.604254,ov:true,c:0.72},{i:61,n:"SASOL LIMITED",fa:1.192276,em:1.071171,ov:true,c:0.72},{i:62,n:"CABOT CORPORATION",fa:1.174677,em:1.5699,ov:false,c:0.73},{i:63,n:"TURKIYE SISE VE CAM FABRIKALARI A.S.",fa:1.161748,em:1.534605,ov:false,c:0.73},{i:64,n:"SOLVAY SISECAM HOLDING AG",fa:1.158059,em:1.386135,ov:false,c:0.73},{i:65,n:"SOLVAY SODI AD",fa:1.149778,em:1.827869,ov:false,c:0.74},{i:66,n:"FERROPEM",fa:1.092702,em:1.125671,ov:false,c:0.74},{i:67,n:"BOREALIS CHIMIE",fa:1.07803,em:0.836811,ov:true,c:0.74},{i:68,n:"INEOS KOELN GMBH",fa:1.071505,em:1.609,ov:false,c:0.74},{i:69,n:"BOREALIS AGROLINZ MELAMINE GMBH",fa:1.038022,em:0.971564,ov:true,c:0.75},{i:70,n:"OCI CLEAN FUELS LIMITED",fa:1.033959,em:2e-6,ov:true,c:0.75},{i:71,n:"YARA ITALIA S.P.A.",fa:1.001986,em:1.118583,ov:false,c:0.75},{i:72,n:"KAVALA NOVAFERT LTD",fa:0.993644,em:0.897346,ov:true,c:0.76},{i:73,n:"FERTIBERIA, SA",fa:0.989236,em:1.011814,ov:false,c:0.76},{i:74,n:"DUSLO, A.S.",fa:0.988984,em:1.074361,ov:false,c:0.76},{i:75,n:"RAFFINERIA DI MILAZZO S.C.P.A.",fa:0.98766,em:1.74441,ov:false,c:0.77},{i:76,n:"CIECH SODA POLSKA S.A.",fa:0.985144,em:0.42,ov:true,c:0.77},{i:77,n:"TRITON PARTNERS (HOLDCO) LIMITED",fa:0.98233,em:0.846911,ov:true,c:0.77},{i:78,n:"DOW CHEMICAL IBERICA SL",fa:0.957993,em:0.929768,ov:true,c:0.77},{i:79,n:"PETROKEMIJA, D.D.",fa:0.927789,em:0.83265,ov:true,c:0.78},{i:80,n:"EXXONMOBIL CHEMICAL FRANCE",fa:0.924217,em:0.90562,ov:true,c:0.78},{i:81,n:"TOTALENERGIES RAFFINAGE FRANCE",fa:0.916941,em:1.044721,ov:false,c:0.78},{i:82,n:"ORLEN UNIPETROL RPA S.R.O.",fa:0.916316,em:3.326015,ov:false,c:0.78},{i:83,n:"ANWIL S.A.",fa:0.885193,em:0.928801,ov:false,c:0.79},{i:84,n:"AIR LIQUIDE LARGE INDUSTRY",fa:0.884301,em:1.028262,ov:false,c:0.79},{i:85,n:"PETRONAS CHEMICALS GROUP BERHAD",fa:0.875366,em:0.548703,ov:true,c:0.79},{i:86,n:"INEOS MANUFACTURING DEUTSCHLAND GMBH",fa:0.874255,em:0.589809,ov:true,c:0.79},{i:87,n:"OLE JAKOB SENDSTAD",fa:0.872367,em:0.734239,ov:true,c:0.8},{i:88,n:"AIR LIQUIDE INDUSTRIE B.V.",fa:0.847211,em:1.234536,ov:false,c:0.8},{i:89,n:"GRUPA AZOTY ZAKLADY AZOTOWE KEDZIERZYN S.A.",fa:0.837055,em:0.802555,ov:true,c:0.8},{i:90,n:"ERCROS, S.A.",fa:0.796452,em:0.758128,ov:true,c:0.8},{i:91,n:"BIOMETHANOL CHEMIE NEDERLAND B.V.",fa:0.788998,em:0.274114,ov:true,c:0.81},{i:92,n:"PEIF III LUXCO ONE S.À R.L.",fa:0.773537,em:1.318785,ov:false,c:0.81},{i:93,n:"COMPAGNIE PETROCHIMIQUE DE BERRE",fa:0.755263,em:0.975082,ov:false,c:0.81},{i:94,n:"GRUPA AZOTY ZAKLADY CHEMICZNE POLICE S.A.",fa:0.751381,em:0.892491,ov:false,c:0.81},{i:95,n:"CEPSA QUIMICA SA",fa:0.747175,em:0.581365,ov:true,c:0.82},{i:96,n:"POLYNT SPA",fa:0.715817,em:0.854692,ov:false,c:0.82},{i:97,n:"RHODIA OPERATIONS",fa:0.71517,em:0.609639,ov:true,c:0.82},{i:98,n:"DOW OLEFINVERBUND GMBH",fa:0.653733,em:1.29913,ov:false,c:0.82},{i:99,n:"BIRLA CARBON HUNGARY KFT.",fa:0.62826,em:0.840506,ov:false,c:0.82},{i:100,n:"YARA TERTRE",fa:0.62032,em:0.701088,ov:false,c:0.83},{i:101,n:"YARA FRANCE",fa:0.60442,em:0.835398,ov:false,c:0.83},{i:102,n:"VALHI INC",fa:0.586779,em:0.579926,ov:true,c:0.83},{i:103,n:"BOREALIS POLYMERS OY",fa:0.57759,em:0.559518,ov:true,c:0.83},{i:104,n:"ARKEMA FRANCE",fa:0.568988,em:0.57732,ov:false,c:0.83},{i:105,n:"KEM ONE",fa:0.566744,em:0.500238,ov:true,c:0.83},{i:106,n:"ADITYA BIRLA GROUP",fa:0.566168,em:0.773679,ov:false,c:0.84},{i:107,n:"TOTALENERGIES OLEFINS ANTWERP",fa:0.54089,em:0.776932,ov:false,c:0.84},{i:108,n:"REPSOL POLIMEROS, UNIPESSOAL, LDA",fa:0.529382,em:0.753075,ov:false,c:0.84},{i:109,n:"JUNGBUNZLAUER HOLDING AG",fa:0.525477,em:0.549008,ov:false,c:0.84},{i:110,n:"AIR PRODUCTS NEDERLAND B.V.",fa:0.510083,em:0.842844,ov:false,c:0.84},{i:111,n:"BASF DOW HPPO PRODUCTION",fa:0.500198,em:0.214886,ov:true,c:0.84},{i:112,n:"REPSOL QUIMICA SA",fa:0.484271,em:0.885385,ov:false,c:0.84},{i:113,n:"BORREGAARD ASA",fa:0.473028,em:0.369064,ov:true,c:0.85},{i:114,n:"NUEVA IQT SL",fa:0.472575,em:0.937773,ov:false,c:0.85},{i:115,n:"SOLVAY OPERATIONS FRANCE",fa:0.467273,em:0.786889,ov:false,c:0.85},{i:116,n:"INEOS CHEMICALS HOLDINGS LUXEMBOURG S.A.",fa:0.458226,em:0.147451,ov:true,c:0.85},{i:117,n:"AGROPOLYCHIM AD",fa:0.458003,em:0.297742,ov:true,c:0.85},{i:118,n:"NITRAMONIA BC SRL",fa:0.457474,em:0.01302,ov:true,c:0.85},{i:119,n:"LANXESS DEUTSCHLAND GMBH",fa:0.454363,em:0.224764,ov:true,c:0.85},{i:120,n:"BORSODCHEM ZARTKORUEN MUKODO RESZVENYTARSASAG",fa:0.452548,em:0.12109,ov:true,c:0.85},{i:121,n:"CRISTAL UNION",fa:0.452102,em:0.121984,ov:true,c:0.86},{i:122,n:"BATU KAWAN BHD",fa:0.451339,em:0.602702,ov:false,c:0.86},{i:123,n:"UBE CORPORATION",fa:0.446021,em:0.265595,ov:true,c:0.86},{i:124,n:"RAIN INDUSTRIES LIMITED",fa:0.438766,em:0.475899,ov:false,c:0.86},{i:125,n:"WEYLCHEM LAMOTTE",fa:0.436462,em:0.296365,ov:true,c:0.86},{i:126,n:"NOVACARB",fa:0.435784,em:0.479688,ov:false,c:0.86},{i:127,n:"EURAZEO",fa:0.435784,em:0.456807,ov:false,c:0.86},{i:128,n:"HUMENS MIDCO",fa:0.435784,em:0.37195,ov:true,c:0.87},{i:129,n:"FLORIS ASSOCIES",fa:0.435784,em:0.33195,ov:true,c:0.87},{i:130,n:"BOREALIS AKTIEBOLAG",fa:0.433351,em:0.667969,ov:false,c:0.87},{i:131,n:"LINETRUST PTC LTD",fa:0.43302,em:0.115637,ov:true,c:0.87},{i:132,n:"OCP S.A",fa:0.423703,em:0.379611,ov:true,c:0.87},{i:133,n:"AEDAS HOMES, S.A.",fa:0.422744,em:0.428566,ov:false,c:0.87},{i:134,n:"VYNOVA BELGIUM",fa:0.421605,em:0.559298,ov:false,c:0.87},{i:135,n:"VERSALIS FRANCE S.A.S.",fa:0.417766,em:0.662619,ov:false,c:0.87},{i:136,n:"LYONDELL CHEMIE NEDERLAND B.V.",fa:0.416442,em:0.313311,ov:true,c:0.88},{i:137,n:"INEOS RAFNES AS",fa:0.414825,em:0.442118,ov:false,c:0.88},{i:138,n:"KRONOS TITAN GMBH",fa:0.41306,em:0.50057,ov:false,c:0.88},{i:139,n:"LINDE GAS PRODUKTIONSGESELLSCHAFT MBH & CO. KG",fa:0.407953,em:0.652945,ov:false,c:0.88},{i:140,n:"BOREALIS-PRODUITS ET ENGRAIS CHIMIQUES DU RHIN",fa:0.402831,em:0.50032,ov:false,c:0.88},{i:141,n:"EVONIK OPERATIONS GMBH",fa:0.397185,em:0.51383,ov:false,c:0.88},{i:142,n:"DOMO CHEMICALS GMBH",fa:0.395323,em:0.349616,ov:true,c:0.88},{i:143,n:"BLUESTAR ADISSEO COMPANY",fa:0.383877,em:0.4281,ov:false,c:0.88},{i:144,n:"EUROCHEM GROUP AG",fa:0.37661,em:0.128877,ov:true,c:0.88},{i:145,n:"INEOS AROMATICS BELGIUM",fa:0.371279,em:0.370794,ov:true,c:0.89},{i:146,n:"CELANESE CORPORATION",fa:0.368127,em:0.333795,ov:true,c:0.89},{i:147,n:"CABOT CARBONE",fa:0.365142,em:0.531244,ov:false,c:0.89},{i:148,n:"CIECH SODA DEUTSCHLAND GMBH & CO. KG",fa:0.364751,em:0.133128,ov:true,c:0.89},{i:149,n:"TRINSEO PLC",fa:0.359063,em:0.194668,ov:true,c:0.89},{i:150,n:"WESTLAKE CORPORATION",fa:0.358723,em:0.22445,ov:true,c:0.89},{i:151,n:"AIR LIQUIDE IBERICA DE GASES, SL UNIPERSONAL",fa:0.349762,em:0.447564,ov:false,c:0.89},{i:152,n:"SASOL ITALY S.P.A.",fa:0.346737,em:0.48781,ov:false,c:0.89},{i:153,n:"BAU CENTER GRASSHOFF GMBH",fa:0.333453,em:0.402683,ov:false,c:0.89},{i:154,n:"SC CHIMCOMPLEX SA BORZESTI - SUCURSALA RAMNICU VALCEA",fa:0.328549,em:0.216238,ov:true,c:0.89},{i:155,n:"ADVENT INTERNATIONAL CORP",fa:0.328161,em:0.304391,ov:true,c:0.9},{i:156,n:"EVONIK ANTWERPEN",fa:0.326701,em:0.530781,ov:false,c:0.9},{i:157,n:"ESD-SIC B.V.",fa:0.321253,em:0.335127,ov:false,c:0.9},{i:158,n:"OLIN CORPORATION",fa:0.315012,em:0.01379,ov:true,c:0.9},{i:159,n:"SUEDZUCKER AG",fa:0.31445,em:0.231539,ov:true,c:0.9},{i:160,n:"SABIC INNOVATIVE PLASTICS ESPANA S.C.P.A",fa:0.310315,em:0.052134,ov:true,c:0.9},{i:161,n:"ESMALGLASS SA",fa:0.309709,em:0.318102,ov:false,c:0.9},{i:162,n:"SHIN-ETSU CHEMICAL COMPANY LIMITED",fa:0.308044,em:0.342027,ov:false,c:0.9},{i:163,n:"LYONDELLBASELL COVESTRO MANUFACTURING MAASVLAKTE V.O.F",fa:0.307992,em:0.013667,ov:true,c:0.9},{i:164,n:"AMG CRITICAL MATERIALS N.V.",fa:0.306986,em:0.199676,ov:true,c:0.9},{i:165,n:0,fa:0.306088,em:0.203443,ov:true,c:0.9},{i:166,n:"MS GALLEON GMBH",fa:0.301758,em:0.133218,ov:true,c:0.91},{i:167,n:"K+S AKTIENGESELLSCHAFT",fa:0.30118,em:0.489803,ov:false,c:0.91},{i:168,n:"QEMETICA DEUTSCHLAND GMBH",fa:0.296934,em:0.126844,ov:true,c:0.91},{i:169,n:"FERROGLOBLE SPAIN METALS, S.A.",fa:0.29685,em:0.25054,ov:true,c:0.91},{i:170,n:"SIRONA PARENT S.C.A.",fa:0.293273,em:0.017659,ov:true,c:0.91},{i:171,n:"BAYER AG",fa:0.289405,em:0.403023,ov:false,c:0.91},{i:172,n:"AIR LIQUIDE HYDROGENE",fa:0.285662,em:0.405376,ov:false,c:0.91},{i:173,n:"BASF SONATRACH PROPANCHEM SA",fa:0.276401,em:0.066131,ov:true,c:0.91},{i:174,n:"VYNOVA WILHELMSHAVEN GMBH",fa:0.270667,em:0.516791,ov:false,c:0.91},{i:175,n:"YARA SUOMI OY",fa:0.263962,em:0.156716,ov:true,c:0.91},{i:176,n:"POLYNT S.P.A.",fa:0.257217,em:0.360375,ov:false,c:0.91},{i:177,n:"EUROCHEM ANTWERPEN",fa:0.255656,em:0.197206,ov:true,c:0.91},{i:178,n:"SOCIEDAD ESPANOLA DE CARBUROS METALICOS SA",fa:0.255199,em:0.348051,ov:false,c:0.92},{i:179,n:"AIC PARENT INC",fa:0.254459,em:0.274967,ov:false,c:0.92},{i:180,n:"NIPPON SHOKUBAI CO LTD",fa:0.253527,em:0.093665,ov:true,c:0.92},{i:181,n:"INDUSTRIAS QUIMICAS DEL EBRO, SA",fa:0.252152,em:0.330306,ov:false,c:0.92},{i:182,n:"LINEA (CY) LTD",fa:0.251315,em:0.154871,ov:true,c:0.92},{i:183,n:"LANXESS",fa:0.247053,em:0.180969,ov:true,c:0.92},{i:184,n:"RADICI CHIMICA S.P.A.",fa:0.245195,em:0.068624,ov:true,c:0.92},{i:185,n:"AI PLEX (LUXEMBOURG) SUBCO S.À R.L.",fa:0.241852,em:0.28321,ov:false,c:0.92},{i:186,n:"AI MONTELENA (LUXEMBOURG) TOP HOLDING II S.À R.L.",fa:0.239805,em:0.168517,ov:true,c:0.92},{i:187,n:"YARA GMBH & CO. KG",fa:0.237418,em:0.169763,ov:true,c:0.92},{i:188,n:"KURARAY CO LTD",fa:0.237125,em:0.070607,ov:true,c:0.92},{i:189,n:"LYONDELL CHIMIE FRANCE",fa:0.236326,em:0.181859,ov:true,c:0.92},{i:190,n:"APOLLO GLOBAL MANAGEMENT, INC.",fa:0.235826,em:0.226407,ov:true,c:0.92},{i:191,n:"SLOVNAFT, A.S.",fa:0.234535,em:0.40373,ov:false,c:0.92},{i:192,n:"BZK HOLDING CORP",fa:0.233329,em:0.289466,ov:false,c:0.93},{i:193,n:"INEOS STYROLUTION BELGIUM",fa:0.230128,em:0.130586,ov:true,c:0.93},{i:194,n:"ORION ENGINEERED CARBONS GMBH",fa:0.226862,em:0.303011,ov:false,c:0.93},{i:195,n:"RADICI CHIMICA DEUTSCHLAND GMBH",fa:0.222613,em:0.093128,ov:true,c:0.93},{i:196,n:"OSTEND BASIC CHEMICALS",fa:0.220872,em:0.163625,ov:true,c:0.93},{i:197,n:"KANDELIUM GROUP GMBH",fa:0.216464,em:0.201608,ov:true,c:0.93},{i:198,n:"EVONIK SUPERABSORBER GMBH",fa:0.215316,em:0.137096,ov:true,c:0.93},{i:199,n:"ICI HOLDING SE",fa:0.209775,em:0.154559,ov:true,c:0.93},{i:200,n:"CARLYLE GROUP INC. (THE)",fa:0.208773,em:0.232599,ov:false,c:0.93},{i:201,n:"ALCOGROUP",fa:0.201766,em:0.472625,ov:false,c:0.93},{i:202,n:"PERSTORP OXO AB",fa:0.201736,em:0.129376,ov:true,c:0.93},{i:203,n:"ELKEM ASA",fa:0.200824,em:0.064584,ov:true,c:0.93},{i:204,n:"TOKLA BETEILIGUNGS GMBH",fa:0.198274,em:0.074559,ov:true,c:0.93},{i:205,n:"EXXONMOBIL PRODUCTION DEUTSCHLAND GMBH",fa:0.19518,em:0.70253,ov:false,c:0.93},{i:206,n:"INEOS",fa:0.19405,em:0.25438,ov:false,c:0.93},{i:207,n:"INOVYN MANUFACTURING BELGIUM",fa:0.191018,em:0.079592,ov:true,c:0.93},{i:208,n:"INEOS PHENOL GMBH",fa:0.190464,em:0.006798,ov:true,c:0.93},{i:209,n:"INOVYN FRANCE",fa:0.189932,em:0.06889,ov:true,c:0.94},{i:210,n:"ETHANOL EUROPE S.ÀR.L.",fa:0.186789,em:0.285276,ov:false,c:0.94},{i:211,n:"TAMINCO",fa:0.184888,em:0.062521,ov:true,c:0.94},{i:212,n:"KOMMANDITGESELLSCHAFT DEUTSCHE GASRUSSWERKE G.M.B.H. & CO.",fa:0.183274,em:0.279239,ov:false,c:0.94},{i:213,n:"COLOROBBIA HOLDING S.P.A.",fa:0.181648,em:0.153273,ov:true,c:0.94},{i:214,n:"BGW SP. Z O.O.",fa:0.178409,em:0.267456,ov:false,c:0.94},{i:215,n:"CRISTIAN LAY SL",fa:0.177001,em:0.420918,ov:false,c:0.94},{i:216,n:"ALCO ENERGY ROTTERDAM B.V.",fa:0.176283,em:0.344002,ov:false,c:0.94},{i:217,n:"ADISSEO FRANCE SAS",fa:0.175436,em:0.223137,ov:false,c:0.94},{i:218,n:"JUNGBUNZLAUER AUSTRIA AG",fa:0.175229,em:0.247924,ov:false,c:0.94},{i:219,n:"AGRANA STÄRKE GMBH",fa:0.175216,em:0.142293,ov:true,c:0.94},{i:220,n:"HUNTSMAN PRODUCTS GMBH",fa:0.172601,em:0.157161,ov:true,c:0.94},{i:221,n:"CHINA NATIONAL CHEMICAL CORPORATION",fa:0.169278,em:0.22975,ov:false,c:0.94},{i:222,n:"LOVOCHEMIE, A.S.",fa:0.169059,em:0.329803,ov:false,c:0.94},{i:223,n:"DARELCO MANAGEMENT LIMITED",fa:0.159083,em:0.319512,ov:false,c:0.94},{i:224,n:"CINKARNA CELJE, D.D.",fa:0.157979,em:0.092022,ov:true,c:0.94},{i:225,n:"AURORIUM HOLDINGS UK LIMITED",fa:0.157854,em:0.230982,ov:false,c:0.94},{i:226,n:"BORREGAARD AS",fa:0.157676,em:0.137579,ov:true,c:0.94},{i:227,n:"ASSOCIATION F I D O P",fa:0.157394,em:0.08752,ov:true,c:0.94},{i:228,n:"LINEX PANNEAUX",fa:0.156944,em:0.039308,ov:true,c:0.94},{i:229,n:"BAYER HISPANIA SL",fa:0.155653,em:0.186768,ov:false,c:0.95},{i:230,n:"BAYER AGRICULTURE",fa:0.155209,em:0.218507,ov:false,c:0.95},{i:231,n:"BASELL ORLEN  POLYOLEFINS SP. Z O.O.",fa:0.154489,em:0.123011,ov:true,c:0.95},{i:232,n:"JOSE DE MELLO CAPITAL, S.A.",fa:0.152781,em:0.078733,ov:true,c:0.95},{i:233,n:"LIFOSA AB",fa:0.151302,em:751e-6,ov:true,c:0.95},{i:234,n:"BASF PERSONAL CARE AND NUTRITION GMBH",fa:0.150835,em:0.100557,ov:true,c:0.95},{i:235,n:"IMERYS GRAPHITE & CARBON BELGIUM",fa:0.147922,em:0.286378,ov:false,c:0.95},{i:236,n:"OY LINDE GAS AB",fa:0.146033,em:0.149992,ov:false,c:0.95},{i:237,n:"GMS S.R.L.",fa:0.142788,em:0.070696,ov:true,c:0.95},{i:238,n:"PRAYON",fa:0.142171,em:0.158731,ov:false,c:0.95},{i:239,n:"DARLING INGREDIENTS INC.",fa:0.141608,em:0.315085,ov:false,c:0.95},{i:240,n:"INEOS DERIVATIVES LAVERA SAS",fa:0.141322,em:0.077364,ov:true,c:0.95},{i:241,n:"BOREALIS KALLO",fa:0.140533,em:0.223151,ov:false,c:0.95},{i:242,n:"WACKER CHEMIE AG",fa:0.139253,em:0.072154,ov:true,c:0.95},{i:243,n:"KEMIRA OYJ",fa:0.138393,em:0.107792,ov:true,c:0.95},{i:244,n:"CS CABOT, SPOL. S R.O.",fa:0.135867,em:0.071364,ov:true,c:0.95},{i:245,n:"COIM SPA",fa:0.135826,em:0.205192,ov:false,c:0.95},{i:246,n:"COVESTRO",fa:0.135614,em:0.040887,ov:true,c:0.95},{i:247,n:"BORSODCHEM MCHZ, S.R.O.",fa:0.135442,em:0.150934,ov:false,c:0.95},{i:248,n:'ZAKŁADY CHEMICZNE "RUDNIKI" S.A.',fa:0.133955,em:0.15885,ov:false,c:0.95},{i:249,n:"INEOS PHENOL BELGIUM",fa:0.133115,em:0.223388,ov:false,c:0.95},{i:250,n:"CITRIBEL",fa:0.130866,em:0.246991,ov:false,c:0.95},{i:251,n:"SK INC.",fa:0.126485,em:0.108391,ov:true,c:0.95},{i:252,n:"INDORAMA VENTURES PORTUGAL PTA, UNIPESSOAL, LDA",fa:0.126431,em:0.058848,ov:true,c:0.95},{i:253,n:"A. MARAGKOS & A. CHATZIPAPA D.E.P.E.",fa:0.125791,em:0.067744,ov:true,c:0.95},{i:254,n:"ORBIA ADVANCE CORPORATION, S.A.B. DE C.V.",fa:0.124406,em:0.171965,ov:false,c:0.96},{i:255,n:"FINCORPORATIVA SL",fa:0.123925,em:0.054009,ov:true,c:0.96},{i:256,n:"PRECHEZA A.S.",fa:0.120989,em:0.094854,ov:true,c:0.96},{i:257,n:"UBE CORPORATION EUROPE SAU",fa:0.119606,em:0.148638,ov:false,c:0.96},{i:258,n:"IMERYS PCC FRANCE",fa:0.119259,em:0.08933,ov:true,c:0.96},{i:259,n:"CABOT ITALIANA S.P.A.",fa:0.119234,em:0.201668,ov:false,c:0.96},{i:260,n:"CORSAIR BLADE (LUXEMBOURG) S.C.SP.",fa:0.11835,em:0.15306,ov:false,c:0.96},{i:261,n:"IOCOVIDO SRL",fa:0.117953,em:0.116232,ov:true,c:0.96},{i:262,n:"BLUE CUBE GERMANY ASSETS GMBH & CO.KG",fa:0.117558,em:0.005704,ov:true,c:0.96},{i:263,n:"SIMOREP ET COMPAGNIE",fa:0.117042,em:0.247476,ov:false,c:0.96},{i:264,n:"RW SILICIUM GMBH",fa:0.116915,em:0.139741,ov:false,c:0.96},{i:265,n:"COMPAGNIE GENERALE DES ETABLISSEMENTS MICHELIN",fa:0.116171,em:0.151524,ov:false,c:0.96},{i:266,n:"WESTLAKE EPOXY B.V.",fa:0.114713,em:0.033551,ov:true,c:0.96},{i:267,n:"ORION ENGINEERED CARBONS S.R.L.",fa:0.111535,em:0.179349,ov:false,c:0.96},{i:268,n:"HOLDING LATOUR III",fa:0.11009,em:0.143467,ov:false,c:0.96},{i:269,n:"TORRECID S.A.",fa:0.109455,em:0.105617,ov:true,c:0.96},{i:270,n:"KRONOS EUROPE",fa:0.1093,em:0.126833,ov:false,c:0.96},{i:271,n:"VENATOR P&A SPAIN SL.",fa:0.107093,em:0.167036,ov:false,c:0.96},{i:272,n:"CABOT B.V.",fa:0.106982,em:0.236355,ov:false,c:0.96},{i:273,n:"NOURYON COÖPERATIEF U.A.",fa:0.105754,em:0.202903,ov:false,c:0.96},{i:274,n:"DSM-FIRMENICH AG",fa:0.10393,em:0.041338,ov:true,c:0.96},{i:275,n:"INDORAMA VENTURES EUROPE B.V.",fa:0.103569,em:0.189491,ov:false,c:0.96},{i:276,n:"SNF GROUP",fa:0.103539,em:0.112107,ov:false,c:0.96},{i:277,n:"EXXONMOBIL CHEMICAL HOLLAND B.V.",fa:0.102576,em:0.09454,ov:true,c:0.96},{i:278,n:"COVESTRO DEUTSCHLAND AG",fa:0.102428,em:0.060306,ov:true,c:0.96},{i:279,n:"CHIMCOMPLEX SA BORZESTI",fa:0.10217,em:0.174426,ov:false,c:0.96},{i:280,n:"K+S MINERALS AND AGRICULTURE GMBH",fa:0.101528,em:0.171107,ov:false,c:0.96},{i:281,n:"AIR LIQUIDE ITALIA PRODUZIONE SRL",fa:0.10083,em:0.130164,ov:false,c:0.96},{i:282,n:"NOVAPEX",fa:0.100534,em:0.004216,ov:true,c:0.96},{i:283,n:"INOVYN DEUTSCHLAND GMBH",fa:0.095747,em:0.029187,ov:true,c:0.96},{i:284,n:"LINDE FRANCE",fa:0.095306,em:0.137196,ov:false,c:0.96},{i:285,n:"PANNONIA BIO ZARTKORUEN MUKODO RESZVENYTARSASAG",fa:0.094992,em:0.121189,ov:false,c:0.97},{i:286,n:"CLONBIO GROUP LIMITED",fa:0.09431,em:0.085912,ov:true,c:0.97},{i:287,n:"SABIC INNOVATIVE PLASTICS B.V.",fa:0.093644,em:0.232303,ov:false,c:0.97},{i:288,n:"ARLANXEO BELGIUM",fa:0.093338,em:0.008519,ov:true,c:0.97},{i:289,n:"BIOWANZE",fa:0.092718,em:0.082259,ov:true,c:0.97},{i:290,n:"BIRLA CARBON SPAIN SL.",fa:0.092449,em:0.120419,ov:false,c:0.97},{i:291,n:"SHIN-ETSU PVC B.V.",fa:0.090963,em:0.092753,ov:false,c:0.97},{i:292,n:"RAIN CARBON",fa:0.089961,em:0.085081,ov:true,c:0.97},{i:293,n:"CORBION N.V.",fa:0.086929,em:0.11037,ov:false,c:0.97},{i:294,n:"BIOCARBURANTES DE CASTILLA Y LEON SA",fa:0.086768,em:0.188336,ov:false,c:0.97},{i:295,n:"TOTALENERGIES PETROCHEMICALS FELUY",fa:0.086726,em:0.151636,ov:false,c:0.97},{i:296,n:"NIPPON SHOKUBAI EUROPE",fa:0.08638,em:0.031472,ov:true,c:0.97},{i:297,n:"KARIN JOHNSENS LYS & KJAERLIGHET",fa:0.086288,em:0.017122,ov:true,c:0.97},{i:298,n:"CELANESE PRODUCTION GERMANY GMBH & CO. KG",fa:0.086186,em:0.055801,ov:true,c:0.97},{i:299,n:"BIRLA CARBON ITALY S.R.L.",fa:0.086139,em:0.130313,ov:false,c:0.97},{i:300,n:"SOLVAY SPECIALTY POLYMERS ITALY SPA",fa:0.085688,em:0.035796,ov:true,c:0.97},{i:301,n:"BIOENERGIE DU SUD-OUEST",fa:0.084628,em:0.03338,ov:true,c:0.97},{i:302,n:"INOVYN NORGE AS",fa:0.084528,em:0.10312,ov:false,c:0.97},{i:303,n:"INEOS SOLVENTS GERMANY GMBH",fa:0.082874,em:0.100975,ov:false,c:0.97},{i:304,n:"WESTLAKE EPOXY NETHERLANDS B.V.",fa:0.082864,em:0.026158,ov:true,c:0.97},{i:305,n:"INEOS FELUY",fa:0.080992,em:0.110747,ov:false,c:0.97},{i:306,n:"CARGILL BIOINDUSTRIAL B.V.",fa:0.08085,em:0.087401,ov:false,c:0.97},{i:307,n:"OXXYNOVA GMBH",fa:0.079726,em:0.074682,ov:true,c:0.97},{i:308,n:"NOURYON FUNCTIONAL CHEMICALS AB",fa:0.077511,em:0.093797,ov:false,c:0.97},{i:309,n:"DOMO CAPROLEUNA GMBH",fa:0.076338,em:0.03819,ov:true,c:0.97},{i:310,n:"CLARIANT PRODUKTE (DEUTSCHLAND) GMBH",fa:0.075549,em:0.074857,ov:true,c:0.97},{i:311,n:"SYNTHESIA, A.S.",fa:0.075206,em:0.22422,ov:false,c:0.97},{i:312,n:"BIOAGRA S.A.",fa:0.074204,em:0.158704,ov:false,c:0.97},{i:313,n:"AIR LIQUIDE DEUTSCHLAND GMBH",fa:0.073889,em:0.109198,ov:false,c:0.97},{i:314,n:"MONUMENT CHEMICAL",fa:0.073885,em:0.086023,ov:false,c:0.97},{i:315,n:"JBF INDUSTRIES LIMITED",fa:0.073315,em:0.084143,ov:false,c:0.97},{i:316,n:"TRINSEO DEUTSCHLAND GMBH",fa:0.073299,em:0.091032,ov:false,c:0.97},{i:317,n:"WESTLAKE INTERNATIONAL HOLDINGS COÖPERATIEF U.A.",fa:0.072673,em:0.088195,ov:false,c:0.97},{i:318,n:"ORION ENGINEERED CARBONS SP. Z O.O.",fa:0.07219,em:0.100335,ov:false,c:0.97},{i:319,n:"TEREOS STARCH & SWEETENERS EUROPE",fa:0.071869,em:0.046153,ov:true,c:0.97},{i:320,n:"TEREOS EU",fa:0.071869,em:0.045853,ov:true,c:0.97},{i:321,n:"PPG INDUSTRIES INC",fa:0.070557,em:0.093506,ov:false,c:0.97},{i:322,n:"WESTLAKE VINNOLIT GMBH & CO. KG",fa:0.069698,em:0.107919,ov:false,c:0.97},{i:323,n:"PFIC LTD",fa:0.06914,em:0.070886,ov:false,c:0.97},{i:324,n:"PERSTORP SPECIALTY CHEMICALS AB",fa:0.068063,em:0.052677,ov:true,c:0.97},{i:325,n:"AGFA-GEVAERT",fa:0.067905,em:0.244801,ov:false,c:0.97},{i:326,n:"THE CHEMOURS COMPANY",fa:0.067693,em:0.07618,ov:false,c:0.97},{i:327,n:"ALCO BIO FUEL",fa:0.066635,em:0.138071,ov:false,c:0.97},{i:328,n:"RAIN CARBON GERMANY GMBH",fa:0.06644,em:0.129391,ov:false,c:0.98},{i:329,n:"SYNTHOMER A.S.",fa:0.06558,em:0.136322,ov:false,c:0.98},{i:330,n:"GRILLO-WERKE HOLDING GMBH",fa:0.064879,em:266e-6,ov:true,c:0.98},{i:331,n:"VENATOR GERMANY GMBH",fa:0.064768,em:0.098495,ov:false,c:0.98},{i:332,n:"AIR LIQUIDE FRANCE INDUSTRIE",fa:0.064361,em:0.114395,ov:false,c:0.98},{i:333,n:"QUÍMICA DEL NALÓN, S.A.",fa:0.064142,em:0.124161,ov:false,c:0.98},{i:334,n:"VERBIO SE",fa:0.06389,em:0.102401,ov:false,c:0.98},{i:335,n:"SYNTHOS KRALUPY A.S.",fa:0.063825,em:0.039745,ov:true,c:0.98},{i:336,n:"KAPRAIN A.S.",fa:0.063706,em:0.206465,ov:false,c:0.98},{i:337,n:"DOW DEUTSCHLAND ANLAGENGESELLSCHAFT MBH",fa:0.063626,em:0.007141,ov:true,c:0.98},{i:338,n:"ELKEM SILICONES FRANCE SAS",fa:0.063348,em:0.028324,ov:true,c:0.98},{i:339,n:"BASELL POLIOLEFINE ITALIA S.R.L.",fa:0.063177,em:0.056149,ov:true,c:0.98},{i:340,n:"SOLVAY POLAND SP Z O.O.",fa:0.062247,em:0.078865,ov:false,c:0.98},{i:341,n:"EVONIK PEROXIDE SPAIN, S.L.U.",fa:0.061755,em:0.090585,ov:false,c:0.98},{i:342,n:"NORCARB ENGINEERED CARBONS AB",fa:0.061486,em:0.093818,ov:false,c:0.98},{i:343,n:"DR. WÖLLNER HOLDING GMBH & CO. KG",fa:0.061293,em:0.077029,ov:false,c:0.98},{i:344,n:"FORTISCHEM  A. S.",fa:0.061108,em:0.073142,ov:false,c:0.98},{i:345,n:"TOSOH CORPORATION",fa:0.061058,em:0.059221,ov:true,c:0.98},{i:346,n:"VYNOVA MAZINGARBE SAS",fa:0.060763,em:0.142347,ov:false,c:0.98},{i:347,n:"ALTUGLAS S.R.L.",fa:0.060398,em:0.04411,ov:true,c:0.98},{i:348,n:"UERDINGEN-IMMOBILIEN GMBH",fa:0.060014,em:0.083599,ov:false,c:0.98},{i:349,n:"VITERRA BIOFUELS B.V.",fa:0.059613,em:0.087334,ov:false,c:0.98},{i:350,n:"KRONOSPAN CHEMICAL HOLDINGS LIMITED",fa:0.059431,em:0.051356,ov:true,c:0.98},{i:351,n:"GALLEGA DE DISTRIBUIDORES DE ALIMENTACION, SOCIEDAD ANONIMA",fa:0.059394,em:0.268093,ov:false,c:0.98},{i:352,n:"BIOETANOL GALICIA SA",fa:0.059337,em:0.143301,ov:false,c:0.98},{i:353,n:"ZEDRA S.A.",fa:0.059175,em:0.071439,ov:false,c:0.98},{i:354,n:"ORIOLA SWEDEN AB",fa:0.058897,em:0.010097,ov:true,c:0.98},{i:355,n:"MUSIM MAS HOLDINGS PTE. LTD.",fa:0.05854,em:0.053221,ov:true,c:0.98},{i:356,n:"INOVYN ESPANA S.L.",fa:0.05851,em:0.062432,ov:false,c:0.98},{i:357,n:"VERDE HOLDINGS S.C.A.",fa:0.058174,em:0.103569,ov:false,c:0.98},{i:358,n:"VERTELLUS SPECIALTIES AUSTRIA GMBH",fa:0.058036,em:0.091754,ov:false,c:0.98},{i:359,n:"VENATOR ITALY S.R.L.",fa:0.058026,em:0.03979,ov:true,c:0.98},{i:360,n:"SICIT GROUP S.P.A",fa:0.057434,em:0.091867,ov:false,c:0.98},{i:361,n:"SPOLANA S.R.O.",fa:0.056976,em:0.08211,ov:false,c:0.98},{i:362,n:"EVAL EUROPE",fa:0.056223,em:0.001339,ov:true,c:0.98},{i:363,n:"COLOROBBIA ESPANA SA",fa:0.056046,em:0.067165,ov:false,c:0.98},{i:364,n:"SILVATEAM S.P.A.",fa:0.055816,em:0.100783,ov:false,c:0.98},{i:365,n:"VALTRIS FRANCE",fa:0.055746,em:0.077872,ov:false,c:0.98},{i:366,n:"TOPSOE HOLDING A/S",fa:0.05558,em:0.107981,ov:false,c:0.98},{i:367,n:"CARBERY FOOD INGREDIENTS LIMITED",fa:0.055204,em:0.12901,ov:false,c:0.98},{i:368,n:"NATIONAL INDUSTRIALIZATION COMPANY(SAUDI JOINT STOCK COMPANY)",fa:0.055079,em:0.050547,ov:true,c:0.98},{i:369,n:"TEREOS STARCH & SWEETENERS LBN",fa:0.054886,em:0.065761,ov:false,c:0.98},{i:370,n:"TEREOS AGRO-INDUSTRIE",fa:0.054189,em:0.049212,ov:true,c:0.98},{i:371,n:"INOVYN SVERIGE AB",fa:0.054098,em:0.075769,ov:false,c:0.98},{i:372,n:"VISKO TEEPAK BELGIUM",fa:0.053732,em:0.086858,ov:false,c:0.98},{i:373,n:"ENVIRAL, A.S.",fa:0.053444,em:0.074079,ov:false,c:0.98},{i:374,n:"LENZ FERMENTATION TANACSADO ES KERESKEDELMI KFT.",fa:0.053181,em:0.060458,ov:false,c:0.98},{i:375,n:"ADP FERTILIZANTES, S.A.",fa:0.052606,em:0.037856,ov:true,c:0.98},{i:376,n:"ENDEKA CERÁMICS, S.L.U",fa:0.052313,em:0.059418,ov:false,c:0.98},{i:377,n:"KAPRAIN INDUSTRIAL HOLDING LIMITED",fa:0.052222,em:0.055976,ov:false,c:0.98},{i:378,n:"BOTA INVESTOR HOLDINGS, LP",fa:0.052046,em:0.04344,ov:true,c:0.98},{i:379,n:"OLEON",fa:0.051056,em:0.029272,ov:true,c:0.98},{i:380,n:"BONDALTI CHEMICALS, S.A.",fa:0.051039,em:0.028371,ov:true,c:0.98},{i:381,n:"MINERALES Y PRODUCTOS DERIVADOS, S.A.",fa:0.05093,em:0.094306,ov:false,c:0.98},{i:382,n:"ECOCARBURANTES ESPANOLES SA",fa:0.048268,em:0.111031,ov:false,c:0.98},{i:383,n:"KRATON POLYMERS HOLDINGS B.V.",fa:0.047936,em:12e-6,ov:true,c:0.98},{i:384,n:"KEMIRA KEMI AKTIEBOLAG",fa:0.046626,em:0.039696,ov:true,c:0.98},{i:385,n:"DELRIN HOLDING INC",fa:0.046588,em:0.0418,ov:true,c:0.98},{i:386,n:"S.A. MINERA CATALANO ARAGONESA",fa:0.046476,em:0.122942,ov:false,c:0.98},{i:387,n:"EMERALD KALAMA CHEMICAL, B.V.",fa:0.046192,em:0.086871,ov:false,c:0.98},{i:388,n:"PQ DUTCH HOLDCO COÖPERATIE U.A.",fa:0.046009,em:0.053853,ov:false,c:0.98},{i:389,n:"TEIJIN LIMITED",fa:0.045878,em:0.099067,ov:false,c:0.99},{i:390,n:"CEP V HOLDCO S.À R.L.",fa:0.04581,em:0.127888,ov:false,c:0.99},{i:391,n:"NOBIAN CHEMICALS B.V.",fa:0.04581,em:0.111585,ov:false,c:0.99},{i:392,n:"NOBIAN COÖPERATIEF U.A.",fa:0.04581,em:0.103227,ov:false,c:0.99},{i:393,n:"CARLYLE CYAN PARTNERS, S.C.SP",fa:0.04581,em:0.102059,ov:false,c:0.99},{i:394,n:"INDUSTRIAS QUIMICAS DEL OXIDO DE ETILENO SA.",fa:0.045549,em:0.120282,ov:false,c:0.99},{i:395,n:"UAB NEO GROUP",fa:0.045011,em:0.025382,ov:true,c:0.99},{i:396,n:"DEK SPOLKA Z OGRANICZONA ODPOWIEDZIALNOSCIA",fa:0.044852,em:0.01217,ov:true,c:0.99},{i:397,n:"DOW PORTUGAL - PRODUTOS QUIMICOS, SOCIEDADE UNIPESSOAL, LDA",fa:0.044396,em:0.050239,ov:false,c:0.99},{i:398,n:"EXXONMOBIL PETROLEUM & CHEMICAL",fa:0.044326,em:0.057692,ov:false,c:0.99},{i:399,n:"MATER-BIOTECH SPA",fa:0.044017,em:0.111117,ov:false,c:0.99},{i:400,n:"POLYTECHNYL",fa:0.043451,em:0.087463,ov:false,c:0.99},{i:401,n:"CHEMOURS NETHERLANDS B.V.",fa:0.0433,em:0.053987,ov:false,c:0.99},{i:402,n:"VESTOLIT GMBH",fa:0.042547,em:0.068152,ov:false,c:0.99},{i:403,n:"KLK EMMERICH GMBH",fa:0.042415,em:0.073643,ov:false,c:0.99},{i:404,n:"KANEKA CORPORATION",fa:0.042272,em:0.060809,ov:false,c:0.99},{i:405,n:"BOREALIS POLYOLEFINE GMBH",fa:0.042116,em:0.009932,ov:true,c:0.99},{i:406,n:"BLUE SAPPHIRE",fa:0.041845,em:0.035453,ov:true,c:0.99},{i:407,n:"IBERIAN LUBE BASE OILS COMPANY SA.",fa:0.041186,em:0.035211,ov:true,c:0.99},{i:408,n:"OEP VIII MASTER COÖPERATIEF U.A.",fa:0.041085,em:0.127531,ov:false,c:0.99},{i:409,n:"NOTORIOUS ENERGY, S.A.",fa:0.040111,em:0.043788,ov:false,c:0.99},{i:410,n:"KANEKA BELGIUM",fa:0.039735,em:0.069486,ov:false,c:0.99},{i:411,n:"ALBEMARLE CORPORATION",fa:0.038955,em:0.161346,ov:false,c:0.99},{i:412,n:"KRONOS TITAN AS",fa:0.038934,em:0.033911,ov:true,c:0.99},{i:413,n:"SOCIEDADE PORTUGUESA DO AR LIQUIDO ARLIQUIDO, LDA",fa:0.0387,em:0.06599,ov:false,c:0.99},{i:414,n:"SASOL GERMANY GMBH",fa:0.038252,em:0.071318,ov:false,c:0.99},{i:415,n:"INEOS SOLVENTS MARL GMBH",fa:0.038227,em:0.023123,ov:true,c:0.99},{i:416,n:"ASHLAND INC",fa:0.038043,em:0.047788,ov:false,c:0.99},{i:417,n:"CELANESE PRODUCTION BELGIUM",fa:0.037882,em:0.06546,ov:false,c:0.99},{i:418,n:"GIANO S.R.L.",fa:0.037518,em:0.02142,ov:true,c:0.99},{i:419,n:"COVESTRO SL",fa:0.036434,em:0.081131,ov:false,c:0.99},{i:420,n:"LES DERIVES RESINIQUES ET TERPENIQUES",fa:0.036409,em:0.014049,ov:true,c:0.99},{i:421,n:"EUCHEMIA SOCIETA' PER AZIONI",fa:0.036402,em:0.045169,ov:false,c:0.99},{i:422,n:"CHEVRON CORPORATION",fa:0.036099,em:0.195033,ov:false,c:0.99},{i:423,n:"LENZING FIBERS GMBH",fa:0.035747,em:0.10485,ov:false,c:0.99},{i:424,n:"MATEOS, S.L.",fa:0.035473,em:0.057826,ov:false,c:0.99},{i:425,n:"BCP VII JADE SHDCO GERMANY GMBH",fa:0.035247,em:0.04376,ov:false,c:0.99},{i:426,n:"ADISSEO ESPANA SA",fa:0.035227,em:0.036235,ov:false,c:0.99},{i:427,n:"SOCIEDAD COOPERATIVA GENERAL AGROPECUARIA-ACOR",fa:0.034521,em:0.088481,ov:false,c:0.99},{i:428,n:"SNF SA",fa:0.034513,em:0.051726,ov:false,c:0.99},{i:429,n:"QUÍMICER S.L.U.",fa:0.03429,em:0.033104,ov:true,c:0.99},{i:430,n:"GRILLO-WERKE AKTIENGESELLSCHAFT",fa:0.034089,em:0,ov:true,c:0.99},{i:431,n:"JMH LUX HOLDINGS",fa:0.033902,em:0.139097,ov:false,c:0.99},{i:432,n:"NOVAMONT S.P.A.",fa:0.03382,em:0.098972,ov:false,c:0.99},{i:433,n:"SYENSQO",fa:0.033622,em:0.039671,ov:false,c:0.99},{i:434,n:"DESIMPACTE DE PURINS CORCO, S.A.",fa:0.03349,em:0.194293,ov:false,c:0.99},{i:435,n:"BOREALIS POLYMERS",fa:0.033253,em:0.040855,ov:false,c:0.99},{i:436,n:"EASTMAN CHEMICAL MIDDELBURG B.V.",fa:0.033125,em:0.050397,ov:false,c:0.99},{i:437,n:"SOLVAY SOLUTIONS ITALIA S.P.A.",fa:0.032632,em:0.043272,ov:false,c:0.99},{i:438,n:"ITELYUM PURIFICATION S.P.A.",fa:0.032317,em:0.065788,ov:false,c:0.99},{i:439,n:"ITELYUM REGENERATION S.P.A.",fa:0.032317,em:0.056214,ov:false,c:0.99},{i:440,n:"BOREALIS POLYMERE GMBH",fa:0.032296,em:0.026242,ov:true,c:0.99},{i:441,n:"PPG INDUSTRIES DELFZIJL B.V.",fa:0.031789,em:0.05287,ov:false,c:0.99},{i:442,n:"CLEMA CAPITAL S.À R.L.",fa:0.031275,em:0.066402,ov:false,c:0.99},{i:443,n:"KREMSCHEM HOLDING GMBH",fa:0.031197,em:0.034143,ov:false,c:0.99},{i:444,n:"DYNEA INDUSTRIER AS",fa:0.031048,em:0.039694,ov:false,c:0.99},{i:445,n:"STIFTUNG DER GRÜNDERFAMILIE WILHELM GRILLO GMBH",fa:0.030964,em:0,ov:true,c:0.99},{i:446,n:"NOVOZYMES A/S",fa:0.030794,em:0.031398,ov:false,c:0.99},{i:447,n:"FIRST SENTIER GROUP LIMITED",fa:0.030583,em:0.030769,ov:false,c:0.99},{i:448,n:"PERSTORP CHEMICALS GMBH",fa:0.030029,em:0.063591,ov:false,c:0.99},{i:449,n:"LINDE GAZ ROMANIA SRL",fa:0.030017,em:0.053801,ov:false,c:0.99},{i:450,n:"JBF GLOBAL EUROPE",fa:0.02984,em:0.037109,ov:false,c:0.99},{i:451,n:"WESTLAKE EPOXY GMBH",fa:0.02971,em:0.022005,ov:true,c:0.99},{i:452,n:"SIPCAM OXON SPA",fa:0.029547,em:0.034088,ov:false,c:0.99},{i:453,n:"MASOL IBERIA BIOFUEL SOCIEDAD LIMITADA.",fa:0.029399,em:0.024789,ov:true,c:0.99},{i:454,n:"HF SINCLAIR CORPORATION",fa:0.028926,em:0.036061,ov:false,c:0.99},{i:455,n:"TRONOX FRANCE SAS",fa:0.0281,em:0.025729,ov:true,c:0.99},{i:456,n:"TRONOX HOLDINGS PLC",fa:0.0281,em:0.019248,ov:true,c:0.99},{i:457,n:"FB HOLDING S.R.O.",fa:0.028057,em:0.034662,ov:false,c:0.99},{i:458,n:"CP HOLDINGS LIMITED",fa:0.027561,em:0.033893,ov:false,c:0.99},{i:459,n:"BAKELITE ITALIA SRL",fa:0.027543,em:0.050595,ov:false,c:0.99},{i:460,n:"VENATOR PIGMENTS S.R.L.",fa:0.027452,em:0.091113,ov:false,c:0.99},{i:461,n:"INTERNATIONAL FLAVORS & FRAGRANCES INC",fa:0.027279,em:0.004761,ov:true,c:0.99},{i:462,n:"DUPONT DE NEMOURS, INC.",fa:0.027246,em:0.036864,ov:false,c:0.99},{i:463,n:"DUPONT INTERNATIONAL (LUXEMBOURG) S.C.A.",fa:0.02712,em:0.029844,ov:false,c:0.99},{i:464,n:"PERFORMANCE SPECIALTY PRODUCTS ASTURIAS SLU",fa:0.027119,em:0.038252,ov:false,c:0.99},{i:465,n:"SABIC POLYOLEFINE GMBH",fa:0.027083,em:0.015685,ov:true,c:0.99},{i:466,n:"NOVUS INDUSTRIALS SPINCO 1, INC.",fa:0.026921,em:0.032219,ov:false,c:0.99},{i:467,n:"ONE ROCK CAPITAL PARTNERS, LLC",fa:0.02675,em:0.023268,ov:true,c:0.99},{i:468,n:"SADEPAN CHIMICA S.R.L.",fa:0.026541,em:0.016618,ov:true,c:0.99},{i:469,n:"BOREALIS AGROLINZ MELAMINE DEUTSCHLAND GMBH",fa:0.026217,em:0.035573,ov:false,c:0.99},{i:470,n:"CARBOSULF CHEMISCHE WERKE GMBH",fa:0.026172,em:0.045448,ov:false,c:0.99},{i:471,n:"HONEYWELL INTERNATIONAL INC",fa:0.025923,em:0.059104,ov:false,c:0.99},{i:472,n:"GELITA AG",fa:0.025815,em:0.15272,ov:false,c:0.99},{i:473,n:"OQ CHEMICALS GMBH",fa:0.025477,em:0,ov:true,c:0.99},{i:474,n:"OQ CHEMICALS INTERNATIONAL HOLDING GMBH",fa:0.025477,em:0,ov:true,c:0.99},{i:475,n:"OQ S.A.O.C.",fa:0.025477,em:0,ov:true,c:0.99},{i:476,n:"NOURYON CHEMICALS",fa:0.02489,em:0.026382,ov:false,c:0.99},{i:477,n:"ARLANXEO EMULSION RUBBER FRANCE SAS",fa:0.024887,em:0.048528,ov:false,c:0.99},{i:478,n:"INEOS MANUFACTURING ITALIA S.P.A.",fa:0.024363,em:0.003201,ov:true,c:0.99},{i:479,n:"KRATON CHEMICAL AB",fa:0.023968,em:58e-6,ov:true,c:0.99},{i:480,n:"DAELIM INDUSTRIAL CO., LTD.",fa:0.023968,em:5e-6,ov:true,c:0.99},{i:481,n:"CHEMVIRON",fa:0.023808,em:0.092042,ov:false,c:0.99},{i:482,n:"PLASTIVERD PET RECICLADO SA",fa:0.023361,em:0.052626,ov:false,c:0.99},{i:483,n:"PTT PCL",fa:0.022713,em:0.038531,ov:false,c:0.99},{i:484,n:"FRITTA SLU",fa:0.022679,em:0.038873,ov:false,c:0.99},{i:485,n:"MOHAWK INDUSTRIES, INC.",fa:0.022617,em:0.014333,ov:true,c:0.99},{i:486,n:"INEOS MANUFACTURING BELGIUM",fa:0.022563,em:0.045904,ov:false,c:0.99},{i:487,n:"CARGILL, INCORPORATED",fa:0.022207,em:0.028344,ov:false,c:0.99},{i:488,n:"PARTICIPACION E IMPULSO SL",fa:0.022089,em:0.022358,ov:false,c:0.99},{i:489,n:"EURORESINAS INDÚSTRIAS QUÍMICAS S.A.",fa:0.022033,em:0.012581,ov:true,c:0.99},{i:490,n:"PREFERE PARAFORM GMBH & CO. KG",fa:0.021848,em:0.022705,ov:false,c:0.99},{i:491,n:"NANOTEHNA PLUS, DRUZBA ZA TEHNOLOGIJO, RAZVOJ IN INZENIRING, D.O.O.",fa:0.021309,em:0.022757,ov:false,c:0.99},{i:492,n:"VITERRA BOTLEK B.V.",fa:0.021195,em:0.033344,ov:false,c:0.99},{i:493,n:"VERBIO ZOERBIG GMBH",fa:0.021134,em:0.028644,ov:false,c:0.99},{i:494,n:"FORESA INDUSTRIAS QUIMICAS DEL NOROESTE SAU",fa:0.020857,em:0.007642,ov:true,c:0.99},{i:495,n:"SOUGNEZ",fa:0.020839,em:0.003382,ov:true,c:0.99},{i:496,n:"DOW FRANCE SAS",fa:0.020789,em:0.039674,ov:false,c:1},{i:497,n:"WOELLNER GMBH",fa:0.020431,em:0.030878,ov:false,c:1},{i:498,n:"COMPO EXPERT GMBH",fa:0.020242,em:0.012551,ov:true,c:1},{i:499,n:"SCUR24 HOLDING GMBH",fa:0.02019,em:0,ov:true,c:1},{i:500,n:"TOTALENERGIES PETROCHEMICALS FRANCE",fa:0.019995,em:0.03711,ov:false,c:1},{i:501,n:"SOCIEDAD ANONIMA SULQUISA",fa:0.019842,em:0.054742,ov:false,c:1},{i:502,n:"FORESTAL DEL ATLANTICO SA",fa:0.019798,em:0.098583,ov:false,c:1},{i:503,n:"PQ SILICAS B.V.",fa:0.01967,em:0.021925,ov:false,c:1},{i:504,n:"KYOWA CHEMICAL INDUSTRY CO.,LTD.",fa:0.019603,em:0.017405,ov:true,c:1},{i:505,n:"INOVYNRO",fa:0.019552,em:0.002803,ov:true,c:1},{i:506,n:"3M BELGIUM",fa:0.019471,em:0.028039,ov:false,c:1},{i:507,n:"TOSOH HELLAS SINGLE MEMBER SOCIETE ANONYME",fa:0.019299,em:0.024525,ov:false,c:1},{i:508,n:'ATMOSA" PETROCHEMIE GMBH',fa:0.019206,em:0.027825,ov:false,c:1},{i:509,n:"MATRÌCA SPA",fa:0.019048,em:0.029591,ov:false,c:1},{i:510,n:"PRINCE INTERNATIONAL CORPORATION",fa:0.018843,em:0.013975,ov:true,c:1},{i:511,n:"VALTRIS ENTERPRISES FRANCE SAS",fa:0.018751,em:0.026657,ov:false,c:1},{i:512,n:"TOTALENERGIES POLYMERS ANTWERP",fa:0.018691,em:0.034072,ov:false,c:1},{i:513,n:"TOPSOE A/S",fa:0.018642,em:0.030449,ov:false,c:1},{i:514,n:"PURAC BIOCHEM B.V.",fa:0.01862,em:0.024172,ov:false,c:1},{i:515,n:"LEDOGA S.R.L.",fa:0.018512,em:0.033536,ov:false,c:1},{i:516,n:"3M COMPANY",fa:0.018456,em:0.029921,ov:false,c:1},{i:517,n:"BESTILE, S.L.",fa:0.018337,em:0.011225,ov:true,c:1},{i:518,n:"SADEPAN CHIMICA",fa:0.018198,em:0.009285,ov:true,c:1},{i:519,n:"FREEPORT-MCMORAN INC.",fa:0.018062,em:0.02777,ov:false,c:1},{i:520,n:"NORIT NEDERLAND B.V.",fa:0.017745,em:0.048908,ov:false,c:1},{i:521,n:"GYORI SZESZGYAR ES FINOMITO ZARTKORUEN MUKODO RESZVENYTARSASAG",fa:0.017727,em:0.022258,ov:false,c:1},{i:522,n:"VISKO TEEPAK",fa:0.017454,em:0.041007,ov:false,c:1},{i:523,n:"BASELL BENELUX B.V.",fa:0.017305,em:0.011773,ov:true,c:1},{i:524,n:"SONAC VUREN B.V.",fa:0.017213,em:0.029163,ov:false,c:1},{i:525,n:"CP KELCO APS",fa:0.016951,em:0.075298,ov:false,c:1},{i:526,n:"LUBRIZOL CORP",fa:0.016943,em:0.084491,ov:false,c:1},{i:527,n:"GELITA SWEDEN AB",fa:0.016711,em:0.061284,ov:false,c:1},{i:528,n:"DISTILLERIA BERTOLINO SPA",fa:0.01642,em:579e-6,ov:true,c:1},{i:529,n:"BRILEN SA",fa:0.016331,em:0.06582,ov:false,c:1},{i:530,n:"METADYNEA AUSTRIA GMBH",fa:0.01633,em:0.020793,ov:false,c:1},{i:531,n:"INFINEUM ITALIA S.R.L.",fa:0.016269,em:0.14624,ov:false,c:1},{i:532,n:"TATE & LYLE PLC",fa:0.01618,em:0.066367,ov:false,c:1},{i:533,n:"RADICI YARN S.P.A.",fa:0.015869,em:0.032889,ov:false,c:1},{i:534,n:"AKTSIONERNOE OBSCHESTVO METAFRAKS KEMIKALS",fa:0.01583,em:0.018419,ov:false,c:1},{i:535,n:"SC HIDROENERGIA IBERICA SL.",fa:0.015681,em:0.124828,ov:false,c:1},{i:536,n:"DYNEA AS",fa:0.015524,em:0.024116,ov:false,c:1},{i:537,n:"ELTEK HOLDING AS",fa:0.015524,em:0.016358,ov:false,c:1},{i:538,n:"TEIJIN CARBON EUROPE GMBH",fa:0.015493,em:0.031737,ov:false,c:1},{i:539,n:"BASF LAMPERTHEIM GMBH",fa:0.015394,em:0.040621,ov:false,c:1},{i:540,n:"SYMRISE AG",fa:0.015332,em:0.062008,ov:false,c:1},{i:541,n:"FMC CORP",fa:0.015148,em:0.076027,ov:false,c:1},{i:542,n:"ALBEMARLE CATALYSTS COMPANY B.V.",fa:0.014876,em:0.055985,ov:false,c:1},{i:543,n:"IBEROL - SOCIEDADE IBERICA DE BIOCOMBUSTIVEIS E OLEAGINOSAS, S.A.",fa:0.014422,em:0.017315,ov:false,c:1},{i:544,n:"SONAC BURGUM B.V.",fa:0.014211,em:0.02954,ov:false,c:1},{i:545,n:"DRINAGH CO-OPERATIVE LTD",fa:0.014066,em:0.03812,ov:false,c:1},{i:546,n:"SA WEISHARDT HOLDING",fa:0.014024,em:0.033156,ov:false,c:1},{i:547,n:"BRESFOR - INDUSTRIA DO FORMOL, S.A.",fa:0.01397,em:0.006616,ov:true,c:1},{i:548,n:"CANAL DE ISABEL II COMUNIDAD DE MADRID",fa:0.01385,em:0.108686,ov:false,c:1},{i:549,n:"ASHLAND INDUSTRIES NEDERLAND B.V.",fa:0.013465,em:0.018023,ov:false,c:1},{i:550,n:"NOURYON PULP AND PERFORMANCE CHEMICALS AB",fa:0.013358,em:0.008563,ov:true,c:1},{i:551,n:"DOMO POLYMER SOLUTIONS SPAIN SOCIEDAD LIMITADA.",fa:0.013349,em:0.021251,ov:false,c:1},{i:552,n:"SILICATOS DE MALPICA SOCIEDAD LIMITADA.",fa:0.013284,em:0.017503,ov:false,c:1},{i:553,n:"SILEKOL SP. Z O.O.",fa:0.013149,em:0.016371,ov:false,c:1},{i:554,n:"GIAT INDUSTRIES",fa:0.013033,em:0.023018,ov:false,c:1},{i:555,n:'FELLI HUNGARY FONO KORLATOLT FELELOSSEGU TARSASAG "VEGELSZAMOLAS ALATT"',fa:0.012943,em:0.153284,ov:false,c:1},{i:556,n:"LINDE GÁZ MAGYARORSZÁG ZRT.",fa:0.012943,em:0.110762,ov:false,c:1},{i:557,n:"PETROCHEMIA-BLACHOWNIA SP. Z O.O.",fa:0.012863,em:0.009733,ov:true,c:1},{i:558,n:"COMPANHIA INDUSTRIAL DE RESINAS SINTETICAS, CIRES, LDA",fa:0.012654,em:0.003538,ov:true,c:1},{i:559,n:"SYNTHOMER FRANCE",fa:0.01225,em:0.014005,ov:false,c:1},{i:560,n:"CHEVRON ORONITE SAS",fa:0.012191,em:0.060233,ov:false,c:1},{i:561,n:"FACI S.P.A.",fa:0.012134,em:0.0185,ov:false,c:1},{i:562,n:"CHIMICA POMPONESCO S.P.A.",fa:0.012016,em:0.008407,ov:true,c:1},{i:563,n:"ROSIER NEDERLAND B.V.",fa:0.011969,em:0.016481,ov:false,c:1},{i:564,n:"MOHAWK PARTNERSHIPS HOLDINGS II SCSP",fa:0.011752,em:0.006864,ov:true,c:1},{i:565,n:"CERDIA PRODUKTIONS GMBH",fa:0.011749,em:0.015357,ov:false,c:1},{i:566,n:"ROCHE HOLDING AG",fa:0.011568,em:0.044934,ov:false,c:1},{i:567,n:"MITSUBISHI CHEMICAL GROUP CORPORATION",fa:0.011067,em:0.010374,ov:true,c:1},{i:568,n:"GRUPO EMPRESARIAL HUERTAS SL",fa:0.010849,em:0.027943,ov:false,c:1},{i:569,n:"EVOS ROTTERDAM B.V.",fa:0.010841,em:0.01319,ov:false,c:1},{i:570,n:"INEOS BAMBLE AS",fa:0.01082,em:0.013308,ov:false,c:1},{i:571,n:"FOSFA A.S.",fa:0.010688,em:0.015211,ov:false,c:1},{i:572,n:"FUJIFILM HOLDINGS CORPORATION",fa:0.01065,em:0.027962,ov:false,c:1},{i:573,n:"SONNEBORN REFINED PRODUCTS B.V.",fa:0.010566,em:0.014266,ov:false,c:1},{i:574,n:"KISUMA CHEMICALS B.V.",fa:0.010522,em:0.014103,ov:false,c:1},{i:575,n:"KAO CORPORATION",fa:0.010361,em:0.038456,ov:false,c:1},{i:576,n:"IFP ENERGIES NOUVELLES",fa:0.009789,em:0.038579,ov:false,c:1},{i:577,n:"BOREALIS ANTWERPEN",fa:0.009619,em:0.004344,ov:true,c:1},{i:578,n:"INDUSTRIE BITOSSI S.P.A.",fa:0.009574,em:0.014392,ov:false,c:1},{i:579,n:"ROUSSELOT",fa:0.009372,em:0.024031,ov:false,c:1},{i:580,n:"TESA WERK HAMBURG GMBH",fa:0.00928,em:0.05857,ov:false,c:1},{i:581,n:"UNILIN RESINS",fa:0.009265,em:0.007816,ov:true,c:1},{i:582,n:"VIBAC S.P.A.",fa:0.009061,em:0.028334,ov:false,c:1},{i:583,n:"DUPONT NUTRITION BIOSCIENCES APS",fa:0.008887,em:0.002665,ov:true,c:1},{i:584,n:"GLANZSTOFF LONGLAVILLE",fa:0.00886,em:0.016152,ov:false,c:1},{i:585,n:"GIE CHIMIE SALINDRES",fa:0.00881,em:0.049099,ov:false,c:1},{i:586,n:"VERNIS, SA",fa:0.008682,em:0.013576,ov:false,c:1},{i:587,n:"HONEYWELL SPECIALTY CHEMICALS SEELZE GMBH",fa:0.008641,em:0.021183,ov:false,c:1},{i:588,n:"PURAC BIOQUIMICA SA",fa:0.008422,em:0.017355,ov:false,c:1},{i:589,n:"ADVACHEM",fa:0.008277,em:0.005951,ov:true,c:1},{i:590,n:"ANTARCHILE S.A.",fa:0.008141,em:0.00344,ov:true,c:1},{i:591,n:"BASF IRELAND LIMITED",fa:0.008019,em:0.012177,ov:false,c:1},{i:592,n:"TRINSEO BELGIUM",fa:0.007838,em:0.007742,ov:true,c:1},{i:593,n:"RADICIFIL S.P.A.",fa:0.007738,em:0.009288,ov:false,c:1},{i:594,n:"ALLNEX BELGIUM",fa:0.007571,em:0.014057,ov:false,c:1},{i:595,n:"OCI CHEMICALS B.V.",fa:0.007484,em:1e-6,ov:true,c:1},{i:596,n:"DRUSTVO HRAST PINA HRASTNIK",fa:0.007432,em:0.009857,ov:false,c:1},{i:597,n:"ESMALTES, SOCIEDAD ANONIMA",fa:0.007363,em:0.010335,ov:false,c:1},{i:598,n:"FENZI SPA",fa:0.007339,em:0.008946,ov:false,c:1},{i:599,n:"NEOELECTRA SC ECOENERGIA NAVARRA SL.",fa:0.007094,em:0.05312,ov:false,c:1},{i:600,n:"IDEAL GROUP",fa:0.007087,em:0.00392,ov:true,c:1},{i:601,n:"GELATINES WEISHARDT",fa:0.007012,em:0.014428,ov:false,c:1},{i:602,n:"THE PROCTER & GAMBLE COMPANY",fa:0.007003,em:0.024595,ov:false,c:1},{i:603,n:"SOLUCIONES INDUSTRIALES EXTREMENAS SL",fa:0.006856,em:0.024269,ov:false,c:1},{i:604,n:"BASF ESPANOLA, SLU",fa:0.006596,em:0.002262,ov:true,c:1},{i:605,n:"YILFERT BENELUX B.V.",fa:0.006527,em:0.009055,ov:false,c:1},{i:606,n:"DUKOL OSTRAVA, S.R.O.",fa:0.006503,em:0.005634,ov:true,c:1},{i:607,n:"DIC CORPORATION",fa:0.006418,em:0.01663,ov:false,c:1},{i:608,n:"MOSTOS VINOS Y ALCOHOLES SOCIEDAD ANONIMA",fa:0.006402,em:0.036919,ov:false,c:1},{i:609,n:"HIDRÓGENO VERDE PUERTOLLANO",fa:0.006252,em:0,ov:true,c:1},{i:610,n:"COLORS & EFFECTS FRANCE SAS",fa:0.006198,em:0.019186,ov:false,c:1},{i:611,n:"CLIMAX MOLYBDENUM B.V.",fa:0.00619,em:0.008978,ov:false,c:1},{i:612,n:"AXENS",fa:0.006032,em:0.01739,ov:false,c:1},{i:613,n:"SETOLAS HOLDINGS, INC.",fa:0.005874,em:0.009813,ov:false,c:1},{i:614,n:"DIAKOL STRAZSKE, S.R.O.",fa:0.005662,em:0.007451,ov:false,c:1},{i:615,n:"FUJIFILM MANUFACTURING EUROPE B.V.",fa:0.005624,em:0.025353,ov:false,c:1},{i:616,n:"EURENCO",fa:0.005507,em:0.011356,ov:false,c:1},{i:617,n:"CANAL DE ISABEL II SA.",fa:0.005441,em:0.05132,ov:false,c:1},{i:618,n:"TESIUM GMBH",fa:0.005419,em:0.021693,ov:false,c:1},{i:619,n:"KAO CORPORATION SA",fa:0.005388,em:0.027031,ov:false,c:1},{i:620,n:"CHEMINOVA A/S",fa:0.005323,em:0.029092,ov:false,c:1},{i:621,n:"CERDIA FRANCE SAS",fa:0.004922,em:0.01025,ov:false,c:1},{i:622,n:"KRONOCHEM SEBES SRL",fa:0.004875,em:0.006462,ov:false,c:1},{i:623,n:"ROUSSELOT ANGOULEME",fa:0.004839,em:0.027551,ov:false,c:1},{i:624,n:"VINCI",fa:0.004715,em:0.006675,ov:false,c:1},{i:625,n:"LUBRIZOL FRANCE",fa:0.004666,em:0.025039,ov:false,c:1},{i:626,n:"BEWI ASA",fa:0.004637,em:0.00693,ov:false,c:1},{i:627,n:"AZULINDUS Y MARTI, SA",fa:0.00446,em:0.003555,ov:true,c:1},{i:628,n:"BASF ITALIA S.P.A.",fa:0.004387,em:0.03747,ov:false,c:1},{i:629,n:"KRONOSPAN CHEMICAL SZCZECINEK SP. Z O.O.",fa:0.004372,em:0.00507,ov:false,c:1},{i:630,n:"POLYCHIM INDUSTRIE",fa:0.004338,em:0.001863,ov:true,c:1},{i:631,n:"MADIN",fa:0.004308,em:0.014933,ov:false,c:1},{i:632,n:"JACKON GMBH",fa:0.004222,em:0.007637,ov:false,c:1},{i:633,n:"PREFERE RESINS FINLAND OY",fa:0.004178,em:0.00216,ov:true,c:1},{i:634,n:"MONDELANGE INDUSTRIES",fa:0.004175,em:0.009293,ov:false,c:1},{i:635,n:"LUDWIG G. BRAUN GMBH U. CO. KG",fa:0.004069,em:0.021531,ov:false,c:1},{i:636,n:"BEAULIEU INTERNATIONAL GROUP",fa:0.004,em:0.001407,ov:true,c:1},{i:637,n:"ARIANEGROUP SAS",fa:0.003926,em:0.026183,ov:false,c:1},{i:638,n:"ROCHE DIAGNOSTICS GMBH",fa:0.003856,em:0.016142,ov:false,c:1},{i:639,n:"AIR LIQUIDE INDUSTRIEGASE GMBH & CO. KG",fa:0.003758,em:0.018543,ov:false,c:1},{i:640,n:"NIPPON GASES DEUTSCHLAND GMBH",fa:0.003651,em:0.008308,ov:false,c:1},{i:641,n:"FORESA FRANCE",fa:0.003506,em:0.005325,ov:false,c:1},{i:642,n:"PERFORMANCE POLYAMIDES GMBH",fa:0.003384,em:0.00361,ov:false,c:1},{i:643,n:"SICER ESPANA COLORIFICIO CERAMICO SL",fa:0.00338,em:1e-6,ov:true,c:1},{i:644,n:"PROCTER & GAMBLE - RAKONA, S.R.O.",fa:0.003208,em:0.012432,ov:false,c:1},{i:645,n:"BEIERSDORF AG",fa:0.003164,em:0.015174,ov:false,c:1},{i:646,n:"HENKEL AG & CO. KGAA",fa:0.003043,em:0.044978,ov:false,c:1},{i:647,n:"BORSODCHEM-KREMS CHEMIE FORMALIN KORLATOLT FELELOSSEGU TARSASAG",fa:0.002798,em:0.006666,ov:false,c:1},{i:648,n:"TOYO INK EUROPE SPECIALTY CHEMICALS",fa:0.002719,em:0.004304,ov:false,c:1},{i:649,n:"XENTRYS LEUNA GMBH",fa:0.002627,em:0.002381,ov:true,c:1},{i:650,n:"TOYO INK SC HOLDINGS CO., LTD.",fa:0.002573,em:0.004118,ov:false,c:1},{i:651,n:"COLOROBBIA POLSKA SP. Z O.O.",fa:0.002474,em:0.003884,ov:false,c:1},{i:652,n:"ALI 1 DEM S.R.L.",fa:0.002467,em:0.005411,ov:false,c:1},{i:653,n:"SAMMA S.A.S. DI ING. MARCO FANTONI",fa:0.002419,em:0.001287,ov:true,c:1},{i:654,n:"CELANESE PRODUCTION SWEDEN AB",fa:0.002309,em:0.001407,ov:true,c:1},{i:655,n:"FENZI AGT NETHERLANDS B.V.",fa:0.002257,em:0.003126,ov:false,c:1},{i:656,n:"LATEXCO",fa:0.002154,em:0.010636,ov:false,c:1},{i:657,n:"KASU AS",fa:0.002135,em:0.001596,ov:true,c:1},{i:658,n:"ANTIN INFRASTRUCTURE LUXEMBOURG III.10",fa:0.00204,em:0.021205,ov:false,c:1},{i:659,n:"ARDIAN HOLDING",fa:0.002031,em:0.003584,ov:false,c:1},{i:660,n:"BASF COATINGS GMBH",fa:0.001988,em:0.013096,ov:false,c:1},{i:661,n:"AIRBUS SE",fa:0.001801,em:0.002836,ov:false,c:1},{i:662,n:"OLEON GMBH",fa:0.001728,em:0.002171,ov:false,c:1},{i:663,n:"INOVYN BELGIUM",fa:0.001582,em:0.025073,ov:false,c:1},{i:664,n:"BASF POLYURETHANES GMBH",fa:0.001457,em:0.002232,ov:false,c:1},{i:665,n:"B. BRAUN MELSUNGEN AKTIENGESELLSCHAFT",fa:0.001317,em:0.003959,ov:false,c:1},{i:666,n:"SUNDE AS",fa:0.001154,em:62e-5,ov:true,c:1},{i:667,n:"LAMBERTI SPA",fa:0.001128,em:0.003551,ov:false,c:1},{i:668,n:"HENKEL ITALIA OPERATIONS S.R.L.",fa:0.001069,em:0.017662,ov:false,c:1},{i:669,n:"IDEX ENERGIES",fa:801e-6,em:0.008261,ov:false,c:1},{i:670,n:"IMERYS CARBONATES AUSTRIA GMBH",fa:801e-6,em:236e-6,ov:true,c:1},{i:671,n:"TESSENDERLO GROUP NV",fa:78e-5,em:0.004783,ov:false,c:1},{i:672,n:"BRASKEM S.A.",fa:607e-6,em:0.007209,ov:false,c:1},{i:673,n:"SOCIÉTÉ DES PÉTROLES SHELL- ETAB. DE NANTERRE",fa:581e-6,em:0.002249,ov:false,c:1},{i:674,n:"BRASKEM EUROPE GMBH",fa:561e-6,em:0.003162,ov:false,c:1},{i:675,n:"ALCOPLAST SRL",fa:116e-6,em:0,ov:true,c:1},{i:676,n:"ATHENA BETEILIGUNGEN AG",fa:0,em:0.032587,ov:false,c:1},{i:677,n:"SWISS KRONO SP. Z O.O.",fa:0,em:0.015887,ov:false,c:1},{i:678,n:"MANFRED ASAMER BETEILIGUNGS- UND MANAGEMENT GMBH",fa:0,em:69e-6,ov:false,c:1},{i:679,n:"APPRYL SNC",fa:0,em:0,ov:false,c:1},{i:680,n:"AS NITROFERT",fa:0,em:0,ov:false,c:1},{i:681,n:"INEOS CHEMICALS LAVERA SAS",fa:0,em:0,ov:false,c:1},{i:682,n:"MAXAM TAN SAS",fa:0,em:0,ov:false,c:1},{i:683,n:"NITROFERT AS",fa:0,em:0,ov:false,c:1},{i:684,n:"SC VIROMET SA",fa:0,em:0,ov:false,c:1},{i:685,n:"CAFFARO BRESCIA S.R.L. IN LIQUIDAZIONE",fa:0,em:0,ov:false,c:1},{i:686,n:"CAFFARO BRESCIA SRL IN LIQUIDAZIONE",fa:0,em:0,ov:false,c:1},{i:687,n:"CERDIA FRANCE SAS - ROUSSILLON",fa:0,em:0,ov:false,c:1},{i:688,n:"CPTE STE DES PETROLES SHELL",fa:0,em:0,ov:false,c:1},{i:689,n:"KVOODID:EE73",fa:0,em:0,ov:false,c:1},{i:690,n:"OPERATOR ACCOUNT",fa:0,em:0,ov:false,c:1},{i:691,n:"OXOCHIMIE",fa:0,em:0,ov:false,c:1},{i:692,n:"USINE CHIMIQUE DE LAVÉRA- LPP",fa:0,em:0,ov:false,c:1},{i:693,n:"VIBACTERMOLI",fa:0,em:0,ov:false,c:1},{i:694,n:"SOLVAY GMBH WASSERSTOFFPRODUKTION",fa:0,em:0.039626,ov:false,c:1},{i:695,n:"WSA3 (WASSERSTOFFANLAGE)",fa:0,em:0.031728,ov:false,c:1},{i:696,n:"ARCELORMITTAL SA",fa:0,em:0.023384,ov:false,c:1},{i:697,n:"AGROFERM ZRT.",fa:0,em:0.00409,ov:false,c:1},{i:698,n:"UE",fa:0,em:529e-6,ov:false,c:1},{i:699,n:"KEMIRA ÄETSÄ PÄÄSTÖOIKEUSTILI",fa:0,em:1e-5,ov:false,c:1},{i:700,n:"KEMIRA JOUTSENON PÄÄSTÖOIKEUSTILI",fa:0,em:9e-6,ov:false,c:1},{i:701,n:"P2X GHP01 HARJAVALTA, PÄÄSTÖOIKEUSTILI",fa:0,em:7e-6,ov:false,c:1},{i:702,n:"DOWANOL",fa:0,em:6e-6,ov:false,c:1},{i:703,n:"NOURYON FINLAND OY OULUN TEHDAS",fa:0,em:2e-6,ov:false,c:1},{i:704,n:"ACETYLENANLAGE",fa:0,em:0,ov:false,c:1},{i:705,n:"ELEKTROLYSE",fa:0,em:0,ov:false,c:1},{i:706,n:"IPA-ANLAGE",fa:0,em:0,ov:false,c:1},{i:707,n:"PVC",fa:0,em:0,ov:false,c:1}];

    const ROWS = Math.ceil(OWNERS.length / COLS);

    // margin.top(10) + margin.bottom(5) + axis label area below grid (22)
    const SVG_OVERHEAD = 37;

    // DOT_R from available width
    const DOT_R_width = Math.floor(((outerWidth - BAR_W - BAR_GAP) / COLS - DOT_GAP) / 2);

    // DOT_R from available height on mobile:
    // invert DOT_H = ROWS*(2*r+gap)+r to solve for r, accounting for SVG margins
    const DOT_R_height = isMobile
        ? Math.floor((fullHeight * 0.44 - SVG_OVERHEAD - ROWS * DOT_GAP) / (2 * ROWS + 1))
        : DOT_R_width;

    const DOT_R = Math.max(3, Math.min(DOT_R_width, DOT_R_height));

    const DOT_STEP = DOT_R * 2 + DOT_GAP;
    const DOT_W = outerWidth - BAR_W - BAR_GAP;
    const gridActualWidth = (COLS - 1) * DOT_STEP + 2 * DOT_R;
    const gridOffsetX = Math.floor((DOT_W - gridActualWidth) / 2); // center grid in DOT_W
    const DOT_H = ROWS * DOT_STEP + DOT_R;
    const BAR_H = DOT_H;
    const innerHeight = DOT_H + 22;

    const svg = chart.append("svg")
        .attr("viewBox", `0 0 ${outerWidth + margin.left + margin.right} ${innerHeight + margin.top + margin.bottom}`)
        .style("width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tip = d3.select('body').append('div').attr('class', 'waffle-tip');

    const barX = DOT_W + BAR_GAP;

    const barTrack = svg.append('rect')
        .attr('class', 'waffle-bar-track')
        .attr('x', barX).attr('y', 0)
        .attr('width', BAR_RECT).attr('height', BAR_H)
        .attr('fill', '#444').attr('rx', 2);

    const groupBounds = [
        { y1: 0, y2: 0.5 },
        { y1: 0.5, y2: 0.803 },
        { y1: 0.803, y2: 1.0 },
    ];

    const barSegs = svg.selectAll('.waffle-bar-seg')
        .data(groupBounds)
        .join('rect')
        .attr('class', 'waffle-bar-seg')
        .attr('x', barX)
        .attr('y', d => d.y1 * BAR_H)
        .attr('width', BAR_RECT)
        .attr('height', d => (d.y2 - d.y1) * BAR_H)
        .attr('fill', (d, i) => GRP_COLORS[i])
        .attr('rx', 2)
        .attr('opacity', 0);

    const barLines = [];
    const barPctLabels = [];

    [0.5, 0.803, 1].forEach(pct => {
        barLines.push(
            svg.append('line')
                .attr('class', 'waffle-bar-line')
                .attr('x1', barX - 4).attr('x2', barX + BAR_RECT)
                .attr('y1', pct * BAR_H).attr('y2', pct * BAR_H)
                .attr('stroke', '#000').attr('stroke-width', 1.5)
        );

        barPctLabels.push(
            svg.append('text')
                .attr('class', 'waffle-bar-pct')
                .attr('x', barX + (BAR_RECT/2)).attr('y', pct * BAR_H -10)
                .attr('text-anchor', 'middle').attr('font-size',11).attr('fill', 'black')
                .style('font-weight','bold')
                .text(d3.format(',.0%')(pct))
        );
    });

    const barGroup = svg.selectAll('.waffle-bar-track, .waffle-bar-line, .waffle-bar-pct');

    // How many top companies to show enlarged in step 1.
    // On mobile, 4 rows of 5 bubbles would overflow DOT_H, so cap at 10 (2 rows).
    const TOP50 = OWNERS.filter(d => d.c < 0.5);
    const numTop = TOP50.length;
    const TOP50_VISIBLE = OWNERS.filter(d => d.i < numTop);
    const top50Cols = 5;
    const numTopRows = Math.ceil(numTop / top50Cols);

    // DOT_R_BIG must fit numTopRows rows within DOT_H.
    // Derived from: last label bottom y = numTopRows * (2*r + 32) ≤ DOT_H
    const DOT_R_BIG = Math.min(40, Math.max(DOT_R + 2,
        Math.floor((DOT_H - 32 * numTopRows) / (2 * numTopRows))
    ));

    const top50SpacingX = (DOT_W - DOT_R_BIG * 2) / (top50Cols - 1);
    const top50SpacingY = DOT_R_BIG * 2 + 10;
    const top50OffsetY = 20;

    const radiusScale = d3.scaleSqrt()
        .domain([d3.min(TOP50_VISIBLE, d => d.fa), d3.max(TOP50_VISIBLE, d => d.fa)])
        .range([DOT_R, DOT_R_BIG]);

    function top50X(d) { return (d.i % top50Cols) * top50SpacingX + DOT_R_BIG; }
    function top50Y(d) { return Math.floor(d.i / top50Cols) * top50SpacingY + DOT_R_BIG + top50OffsetY; }
    function gridX(d) { return gridOffsetX + (d.i % COLS) * DOT_STEP + DOT_R; }
    function gridY(d) { return Math.floor(d.i / COLS) * DOT_STEP + DOT_R; }

    const dots = svg.selectAll('.waffle-dot')
        .data(OWNERS)
        .join('circle')
        .attr('class', 'waffle-dot')
        .attr('cx', gridX)
        .attr('cy', gridY)
        .attr('r', DOT_R)
        .attr('fill', 'lightgrey')
        .style('cursor', 'pointer')

    const nameLabels = svg.selectAll('.waffle-name-label')
        .data(TOP50_VISIBLE)
        .join('text')
        .attr('class', 'waffle-name-label')
        .attr('x', top50X)
        .attr('y', d => top50Y(d) + radiusScale(d.fa) + 12)
        .attr('text-anchor', 'middle')
        .style('font-size', fullWidth > 1000 ? 10 : 8)
        .attr('fill','white')
        .attr('opacity', 0)
        // truncate long names on mobile to prevent overlap with bar labels
        .text(d => isMobile && d.n.length > 14 ? d.n.slice(0, 14) + '…' : d.n);

    const faLabels = svg.selectAll('.waffle-fa-label')
        .data(TOP50_VISIBLE)
        .join('text')
        .attr('class', 'waffle-fa-label')
        .attr('x', top50X)
        .attr('y', d=>top50Y(d)+3)
        .attr('text-anchor', 'middle')
        .attr('font-size', d=>radiusScale(d.fa)*0.8)
        .attr('font-weight','bold')
        .style('fill', 'black')
        .attr('opacity', 1)
        .style('cursor', 'pointer')
        .text(d => `${d3.format(',.0f')(d.fa)}${(d.i == 0?'M':'')}`);

    const api = { dots, nameLabels, faLabels, barSegs, barGroup, top50X, top50Y, gridX, gridY, grp, GRP_COLORS, DOT_R, radiusScale, numTop, tip };
    onWaffleStep(api, 1); // paint the default view before any step is actually scrolled to
    return api;
}

// step 1: top recipients enlarged and named (BASF and peers)
// step 2: top 35 companies highlighted -> 80% of the free allowance budget
// step 3: remaining 206 companies highlighted -> the other 20%
// step 4 (and any step beyond): which individual companies were overallocated
function onWaffleStep(api, stepNum) {
    const { dots, nameLabels, faLabels, barSegs, barGroup, top50X, top50Y, gridX, gridY, grp, GRP_COLORS, DOT_R, radiusScale, numTop, tip } = api;
    const DUR = 550;

    if (stepNum == 1) {
        dots.filter(d => d.i < numTop)
            .transition().duration(DUR)
            .attr('cx', top50X).attr('cy', top50Y)
            .attr('r', d => radiusScale(d.fa))
            .attr('fill', GRP_COLORS[0]);

        dots.filter(d => d.i >= numTop)
            .transition().duration(DUR)
            .attr('cx', gridX).attr('cy', gridY)
            .attr('r', DOT_R)
            .attr('opacity', 0)
            .attr('fill', '#666');

        nameLabels.transition().duration(DUR).attr('opacity', 1);
        faLabels.transition().duration(DUR).attr('opacity', 1);
        barSegs.transition().duration(DUR).attr('opacity', (d, i) => i === 0 ? 1 : 0);
        barGroup.transition().duration(DUR).style('opacity', 1);
        dots.on('mouseover', function(event, d) {
            if (d.i < 19) {
                const surplus = (d.fa - d.em).toFixed(3);
                const surplusLabel = d.ov
                    ? `<span style="color:#f1948a">+${d3.format(',.0f')(d.fa*1000000 - d.em*1000000)} tonnes overallocated</span>`
                    : `<span style="color:#85c1e9">${d3.format(',.0%')(d.fa/d.em)} emissions covered for free</span>`;
                const emLabel = d.em > 0 ? d.em.toFixed(3) + ' MtCO₂' : 'not reported';
                tip.html(`<strong>${d.n}</strong><br>Free allowances: ${d.fa.toFixed(3)} MtCO₂<br>Verified emissions: ${emLabel}<br>${surplusLabel}`)
                    .classed('show', true);
            }
        })
        .on('mousemove', function(event) {
            tip.style('left', (event.clientX + 14) + 'px')
                .style('top', (event.clientY - 40) + 'px');
        })
        .on('mouseleave', function() { tip.classed('show', false); });        
        return;
    }

    // steps 2-4 all show the full grid (no enlarged top-recipient bubbles)
    nameLabels.transition().duration(DUR).attr('opacity', 0);
    faLabels.transition().duration(DUR).attr('opacity', 0);
    dots.on('mouseover', function(event, d) {
        const surplus = (d.fa*1000000 - d.em*1000000).toFixed(3);
        const surplusLabel = d.ov
                    ? `<span style="color:#f1948a">+${d3.format(',.0f')(d.fa*1000000 - d.em*1000000)} tonnes overallocated</span>`
                    : `<span style="color:#85c1e9">${d3.format(',.0%')(d.fa/d.em)} emissions covered for free</span>`;
        const emLabel = d.em > 0 ? d.em.toFixed(3) + ' MtCO₂' : 'not reported';
        tip.html(`<strong>${d.n}</strong><br>Free allowances: ${d.fa.toFixed(3)} MtCO₂<br>Verified emissions: ${emLabel}<br>${surplusLabel}`)
            .classed('show', true);
    })
    .on('mousemove', function(event) {
        tip.style('left', (event.clientX + 14) + 'px')
            .style('top', (event.clientY - 40) + 'px');
    })
    .on('mouseleave', function() { tip.classed('show', false); });

    if (stepNum == 2) {
        dots.transition().duration(DUR)
            .attr('cx', gridX).attr('cy', gridY).attr('r', DOT_R).attr('opacity', 1)
            .attr('fill', d => {
                const g = grp(d);
                if (g === 0) return GRP_COLORS[0];
                if (g === 1) return GRP_COLORS[1];
                return '#666';
            });
        barSegs.transition().duration(DUR).attr('opacity', (d, i) => i <= 1 ? 1 : 0);
        barGroup.transition().duration(DUR).style('opacity', 1);
    }

    if (stepNum == 3) {
        dots.transition().duration(DUR)
            .attr('cx', gridX).attr('cy', gridY).attr('r', DOT_R).attr('opacity', 1)
            .attr('fill', d => GRP_COLORS[grp(d)]);
        barSegs.transition().duration(DUR).attr('opacity', 1);
        barGroup.transition().duration(DUR).style('opacity', 1);
    }

    if (stepNum >= 4) {
        dots.transition().duration(DUR)
            .attr('cx', gridX).attr('cy', gridY).attr('r', DOT_R).attr('opacity', 1)
            .attr('fill', d => d.ov ? '#D10787' : '#666');
        barSegs.transition().duration(DUR).attr('opacity', 0);
        barGroup.transition().duration(DUR).style('opacity', 0);
    }
}

var width = d3.select('body').node().offsetWidth;
var height = window.innerHeight;

initScrolly({
    width: width,
    height: height,
    sectionId: 'headline',
    drawChart: drawHeadlineChart,
    onStep: onHeadlineStep
});

initScrolly({
    width: width,
    height: height,
    sectionId: 'scroll',
    drawChart: drawChemicalsChart,
    onStep: onChemicalsStep
});

initScrolly({
    width: width,
    height: height,
    sectionId: 'map',
    drawChart: drawMapChart,
    onStep: onMapStep
});

initScrolly({
    width: width,
    height: height,
    sectionId: 'waffle',
    drawChart: drawWaffleChart,
    onStep: onWaffleStep
});

window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'scrollDelta') {
        window.scrollBy(0, e.data.deltaY);
    }
});