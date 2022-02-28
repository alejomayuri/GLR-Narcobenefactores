function linechart() {
    var margin = { top: 100, right: 50, bottom: 30, left: 20 },
        width = $("#container_coca").width();
    var height = $("#container_coca").height(),
        tooltip = { width: 100, height: 100, x: 10, y: -30 };

    var parseDate = d3.time.format("%Y-%m-%d").parse,
        bisectDate = d3.bisector(function(d) {
            return d.date;
        }).left,
        dateFormatter = d3.time.format("%Y");

    var svg = d3
        .select("#container_coca")
        // .html("")
        .append("svg")
        .attr("viewBox", [0.5, 30.5, width - 30, height + 30])
        .attr("width", width)
        .attr("height", height - margin.top)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.time.scale().range([0, width]);

    var y = d3.scale.linear().range([height - margin.top, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg
        .axis()
        .scale(x)
        .ticks(5)
        .innerTickSize(15)
        .outerTickSize(0)
        .orient("bottom");

    var yAxis = d3.svg
        .axis()
        .scale(y)
        .tickFormat(function(d) {
            return d;
        })
        .ticks(6)
        .innerTickSize(15)
        .outerTickSize(0)
        .orient("left");

    var line = d3.svg
        .line()
        .interpolate("monotone")
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.price);
        });

    d3.csv("data_coca.csv", function(error, data) {
        color.domain(
            d3.keys(data[0]).filter(function(key) {
                return key !== "date";
            })
        );
        // console.log(data)
        data.forEach(function(d) {
            // console.log(d);
            d.date = parseDate(d.date);
        });

        var companies = color.domain().map(function(name) {
            //console.log(name)
            return {
                name: name,
                values: data.map(function(d) {
                    //console.log(d[name])
                    return { date: d.date, price: +d[name] };
                }),
            };
        });

        x.domain(
            d3.extent(data, function(d) {
                return d.date;
            })
        );

        y.domain([
            d3.min(companies, function(c) {
                return 0;
            }),
            d3.max(companies, function(c) {
                return d3.max(c.values, function(v) {
                    return v.price + 100;
                });
            }),
        ]);

        svg
            .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.top) + ")")
            .call(xAxis);

        svg
            .append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Hectareas totales");

        svg.append("line").attr({
            class: "horizontalGrid",
            x1: 0,
            x2: width,
            y1: y(0),
            y2: y(0),
            fill: "none",
            "shape-rendering": "crispEdges",
            stroke: "black",
            "stroke-width": "1px",
            "stroke-dasharray": "3, 3",
        });

        svg.append("line").attr({
            class: "verticalGrid",
            x1: 0,
            x2: 0,
            y1: 0,
            y2: height - margin.top,
            fill: "none",
            "shape-rendering": "crispEdges",
            stroke: "black",
            "stroke-width": "1px",
            "stroke-dasharray": "3, 3",
        });

        var company = svg
            .selectAll(".company")
            .data(companies)
            .enter()
            .append("g")
            .attr("class", "company");

        var path = svg
            .selectAll(".company")
            .append("path")
            .attr("class", "line")
            .attr("d", function(d) {
                return line(d.values);
            })
            .style("stroke", function(d) {
                //console.log(d)
                if (d.name == "Pevas") {
                    return "#8b821c";
                }
                if (d.name == "Ramón Castilla") {
                    return "#546022";
                }
                if (d.name == "San Pablo") {
                    return "#a99e22";
                }
                if (d.name == "Yavari") {
                    return "#849249";
                } else {
                    return "#9d02d7";
                }
            });

        parent_transition = d3.select({}).transition().duration(10000);

        var circle = company
            .selectAll("circle")
            .data(function(d) {
                return d.values;
            })
            .enter()
            .append("circle")
            .attr("r", 5)
            .style("opacity", "0")
            .style("fill", function(d, i, j) {
                if (companies[j].name == "Pevas") {
                    return "#8b821c";
                }
                if (companies[j].name == "Ramón Castilla") {
                    return "#546022";
                }
                if (companies[j].name == "San Pablo") {
                    return "#a99e22";
                }
                if (companies[j].name == "Yavari") {
                    return "#849249";
                } else {
                    return "#9d02d7";
                }
            })
            .on("mouseover", mousemove)
            // .on("mouseout", function () {
            //   focus.style("display", "none");
            // })
            .on("mousemove", function() {
                focus.style("display", null);
            });

        var focus = svg.append("g").attr("class", "focus").style("display", "none");

        focus.append("text").attr("x", 9).attr("dy", ".35em");

        focus
            .append("rect")
            .attr("class", "tooltip")
            //.attr("text-anchor","middle")
            .attr("width", 150)
            .attr("height", 50)
            .attr("x", 10)
            .attr("y", -22)
            .attr("rx", 4)
            .attr("ry", 4);

        focus
            .append("text")
            .attr("class", "tooltip-date")
            // .attr("text-anchor","middle")
            .attr("x", 18)
            .attr("y", -2);

        focus.append("text").attr("x", 18).attr("y", 18).text("Hectáreas:");

        focus
            .append("text")
            .attr("class", "tooltip-likes")
            .attr("x", 100)
            .attr("y", 18);

        function mousemove(c) {
            // var x0 = x.invert(d3.mouse(this)[0]),
            //   i = bisectDate(companies, x0, 1),
            //   d0 = companies[i - 1],
            //   d1 = companies[i],
            //   d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            console.log();
            var name;

            Object.keys(companies).map(function(key, index) {
                // console.log(c.price, key, companies[key]);
                var datita = companies[key].values;
                Object.keys(datita).map(function(k, i) {
                    // console.log(datita[k]);

                    if (c.price == datita[k].price) {
                        name = companies[key].name;
                    }
                });
            });

            focus.attr(
                "transform",
                "translate(" + (d3.mouse(this)[0] - 150) + "," + (y(c.price) - 20) + ")"
            );
            focus.select(".tooltip-date").text(name);
            focus.select(".tooltip-likes").text(c.price);
        }

        var totalLength = [
            path[0][0].getTotalLength(),
            path[0][1].getTotalLength(),
            path[0][2].getTotalLength(),
            path[0][3].getTotalLength(),
        ];

        d3.select(path[0][0])
            .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0])
            .attr("stroke-dashoffset", totalLength[0])
            .transition()
            .duration(5000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

        d3.select(path[0][1])
            .attr("stroke-dasharray", totalLength[1] + " " + totalLength[1])
            .attr("stroke-dashoffset", totalLength[1])
            .transition()
            .duration(5000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

        d3.select(path[0][2])
            .attr("stroke-dasharray", totalLength[2] + " " + totalLength[2])
            .attr("stroke-dashoffset", totalLength[2])
            .transition()
            .duration(5000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);

        d3.select(path[0][3])
            .attr("stroke-dasharray", totalLength[3] + " " + totalLength[3])
            .attr("stroke-dashoffset", totalLength[3])
            .transition()
            .duration(5000)
            .ease("linear")
            .attr("stroke-dashoffset", 0)
            .each("end", function() {
                circle
                    .transition()
                    .attr("cx", function(d) {
                        return x(d.date);
                    })
                    .attr("cy", function(d) {
                        return y(d.price);
                    })
                    .style("opacity", "1");
            });
    });
}

function legend() {
    var data_legend = [
        // { color: "#000", value: 0 },
        { color: "#949062", value: 1184 },
        { color: "#778248", value: 1536 },
        { color: "#849249", value: 2781 },
        { color: "#777345", value: 3851 },
        { color: "#61603a", value: 4382 },
        { color: "#546022", value: 5474 },
        { color: "#728037", value: 6389 },
        { color: "#b8ad38", value: 9181 },
    ];

    // console.log(data_legend);
    var extent = d3.extent(data_legend, (d) => d.value);
    var padding = 9;
    var width = 370;
    var innerWidth = width - padding * 2;
    var barHeight = 8;
    var height = 28;

    var xScale = d3.scale.linear().range([0, innerWidth]).domain(extent);

    var xTicks = ["2000", "4000", "6000", "8000", "9000"];

    var svg = d3
        .select("#legend_mapa")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // console.log(extent, xTicks);

    var xAxis = d3.svg
        .axis()
        .scale(xScale)
        // .tickSize(barHeight * 2)
        .ticks(5)
        .innerTickSize(15)
        .tickValues(xTicks)
        .orient("bottom");

    // var xAxis = d3.svg
    //   .axis()
    //   .scale(x)
    //   .ticks(5)
    //   .innerTickSize(15)
    //   .outerTickSize(0)
    //   .orient("bottom");

    var g = svg.append("g").attr("transform", "translate(" + padding + ", 0)");

    var defs = svg.append("defs");

    var linearGradient = defs.append("linearGradient").attr("id", "myGradient");

    // console.log(d.value, extent[0]);

    linearGradient
        .selectAll("stop")
        .data(data_legend)
        .enter()
        .append("stop")
        .attr(
            "offset",
            (d) => ((d.value - extent[0]) / (extent[1] - extent[0])) * 100 + "%"
        )
        .attr("stop-color", (d) => d.color);

    // (d.value - extent[0]) / (extent[1] - extent[0]) (d.value, extent[0])) * 100 + "%"

    g.append("rect")
        .attr("width", innerWidth)
        .attr("height", barHeight)
        .style("fill", "url(#myGradient)");

    g.append("g").call(xAxis).select(".domain").remove();
}

function map_rm() {
    var width = $("#container_mapa").width();
    var height = $("#container_mapa").height();

    var projection = d3.geo.mercator();

    var svg = d3
        .select("#container_mapa")
        .append("svg")
        .attr("viewBox", [0.5, 30.5, width - 30, height + 30])
        .attr("width", width)
        .attr("height", height);

    // var path = d3.geo.path()
    //     .projection(projection);
    // var g = svg.append("g");

    var projection = d3.geo
        .mercator()
        .center([-73.7, -3.4])
        .scale(2700)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path().projection(projection);

    d3.json("loreto.json", function(error, topology) {
        // console.log(topology);

        //     svg.append("path")
        // .datum(topojson.feature(topology, topology.objects.loreto))
        // .attr("d", path);

        var region = svg
            .selectAll(".subunit")
            .data(topojson.feature(topology, topology.objects.loreto).features)
            .enter()
            .append("path")
            .attr("class", function(d) {
                return "subunit " + d.properties.id;
            })
            .attr("d", path)
            .on("mousemove", mousemove)
            .on("mouseout", function() {
                focus.style("display", "none");
            })
            .on("mouseover", function() {
                focus.style("display", null);
            });

        svg
            .selectAll("text")
            .data(topojson.feature(topology, topology.objects.loreto).features)
            .enter()
            .append("svg:text")
            .text(function(d) {
                return d.properties.NOMBPROV;
            })
            .attr("x", function(d) {
                return path.centroid(d)[0];
            })
            .attr("y", function(d) {
                return path.centroid(d)[1];
            })
            .attr("text-anchor", "middle")
            .attr("font-size", "7pt");

        var focus = svg.append("g").attr("class", "focus").style("display", "none");

        // focus.append("text").attr("x", 9).attr("dy", ".35em");

        focus
            .append("rect")
            .attr("class", "tooltip")
            .attr("width", 140)
            .attr("height", 50)
            .attr("x", 10)
            .attr("y", -22)
            .attr("rx", 4)
            .attr("ry", 4);

        // focus
        //   .append("text")
        //   .attr("class", "tooltip-date")
        //   .attr("x", 18)
        //   .attr("y", -2);

        focus.append("text").attr("x", 18).attr("y", 2).text("Hectáreas ");
        focus.append("text").attr("x", 18).attr("y", 17).text("perdidas:");

        focus
            .append("text")
            .attr("class", "tooltip-likes")
            .attr("x", 80)
            .attr("y", 18);

        function mousemove(c) {
            // var x0 = x.invert(d3.mouse(this)[0]),
            //   i = bisectDate(companies, x0, 1),
            //   d0 = companies[i - 1],
            //   d1 = companies[i],
            //   d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            //console.log(c);

            focus.attr(
                "transform",
                "translate(" +
                (d3.mouse(this)[0] - 100) +
                "," +
                (d3.mouse(this)[1] - 30) +
                ")"
            );
            // focus.select(".tooltip-date").text(dateFormatter(c.date));
            focus.select(".tooltip-likes").text(c.properties.ha_perdidas + " ha.");
        }
    });
}

var firstTime_1 = 0;

var firstTime_2 = 0;

$(window).on("scroll", function() {
    centerDiv("#container_coca");
    centerDiv("#container_mapa");
});

function centerDiv(that) {
    //console.log(stop_1, stop_2);
    var element = document.querySelector(that);
    var position = element.getBoundingClientRect();

    // checking whether fully visible
    if (position.top >= 0 && position.bottom <= window.innerHeight) {}

    // checking for partial visibility
    if (position.top < window.innerHeight && position.bottom >= 0) {
        //console.log("Element is partially visible in screen");

        if (that == "#container_coca") {
            if (firstTime_1 == 0) {
                linechart();
            }
            firstTime_1 = 1;
        }
        if (that == "#container_mapa") {
            if (firstTime_2 == 0) {
                map_rm();
                legend();
            }
            firstTime_2 = 1;
        }
    }
}

$(function() {
    var current = 1;
    var max = $("li").length + 1;

    $(".slidercontent").hide();
    $(".slidercontent:nth-child(1)").fadeIn("slow");

    //function to change to next quote
    function changeUp() {
        $(".slidercontent").hide();
        current += 1;
        if (current === max) {
            current = 1;
        }
        $(".slidercontent:nth-child(" + current + ")").fadeIn("slow");
    }

    function changeDown() {
        $(".slidercontent").hide();
        current -= 1;

        if (current === 0) {
            current = max - 1;
        }

        $(".slidercontent:nth-child(" + current + ")").fadeIn("slow");
    }

    startChange();

    $(".sliderspot2").click(function() {
        stopChange();
        changeUp();
        startChange();
    });

    $(".sliderspot").click(function() {
        stopChange();
        changeDown();
        startChange();
    });

    //FUNCTIONS TO CONTROL TIMING CHANGES
    function startChange() {
        changeIt = setInterval(function() {
            changeUp();
        }, 8000);
    }

    function stopChange() {
        clearInterval(changeIt);
    }
});