import { LightningElement, wire, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";

// import d3js from static resource
import D3Js from "@salesforce/resourceUrl/D3Js";

import getStocksData from "@salesforce/apex/CandleStickChartController.getStocksData";

export default class CandleStickChartD3js extends LightningElement {
    @api svgWidth = 1000;
    @api svgHeight = 400;
    startDate;
    endDate;
    d3Initialized = false;
    stocksData;

    handleStartDateChange(event) {
        this.startDate = event.target.value;
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value;
    }

    renderedCallback() {
        if (this.d3Initialized) {
            return;
        }

        Promise.all([loadScript(this, D3Js + "dist/d3.min.js")])
            .then(() => {
                this.d3Initialized = true;
                this.initializeD3();
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error loading D3",
                        message: error.message,
                        variant: "error"
                    })
                );
            });
    }

    handleSubmit(){
        console.log(this.startDate + this.endDate);
        getStocksData({ startDate : this.startDate, endDate : this.endDate }).then(
            result =>{
                this.stocksData = result.map((item) => {
                    let newItem = {
                        low: item.Low_Price__c,
                        open: item.Open_Price__c,
                        symbol: item.Symbol__c,
                        close: item.Close_Price__c,
                        high: item.High_Price__c,
                        date: new Date(item.Date__c)
                    };
                    return newItem;
                });

                this.initializeD3();
            }
        ).catch(error =>{
            console.log(
                "error while getting stocks data",
                JSON.stringify(error)
            );
        })
    }

    initializeD3() {
        if (!this.d3Initialized || !this.stocksData) {
            return;
        }
        let height = this.svgHeight;
        let width = this.svgWidth;

        let data = this.stocksData;
        let margin = { top: 20, right: 30, bottom: 30, left: 40 };

        // X scale
        let x = d3
            .scaleBand()
            .domain(
                d3.utcDay.range(data[0].date, +data[data.length - 1].date + 1)
            )
            .range([margin.left, width - margin.right])
            .padding(0.2);

        // y scale
        let y = d3
            .scaleLog()
            .domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)])
            .rangeRound([height - margin.bottom, margin.top]);

        // x axis
        let xAxis = (g) =>
            g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .style("font-size", "0.8rem")
                .call(
                    d3
                        .axisBottom(x)
                        .tickValues(
                            d3.utcMonday
                                .every(width > 720 ? 1 : 2)
                                .range(data[0].date, data[data.length - 1].date)
                        )
                        .tickFormat(d3.utcFormat("%-m/%-d/%Y"))
                )
                .call((g) => g.select(".domain").remove());

        // y axis
        let yAxis = (g) =>
            g
                .attr("transform", `translate(${margin.left},0)`)
                .style("font-size", "0.8rem")
                .call(
                    d3
                        .axisLeft(y)
                        .tickFormat(d3.format("$~f"))
                        .tickValues(d3.scaleLinear().domain(y.domain()).ticks())
                )
                .call((g) =>
                    g
                        .selectAll(".tick line")
                        .clone()
                        .attr("stroke-opacity", 0.2)
                        .attr("x2", width - margin.left - margin.right)
                )
                .call((g) => g.select(".domain").remove());

        // format date
        let formatDate = d3.utcFormat("%B %-d, %Y");

        function formatChange() {
            const f = d3.format("+.2%");
            return (y0, y1) => f((y1 - y0) / y0);
        }

        const svg = d3.select(this.template.querySelector("svg.d3"));
        svg.attr("viewBox", [0, 0, width, height]);
        svg.append("g").call(xAxis);

        svg.append("g").call(yAxis);

        const g = svg
            .append("g")
            .attr("stroke-linecap", "round")
            .attr("stroke", "black")
            .selectAll("g")
            .data(data)
            .join("g")
            .attr("transform", (d) => {
                return `translate(${x(d.date)},0)`;
            });

        g.append("line")
            .attr("y1", (d) => y(d.low))
            .attr("y2", (d) => y(d.high));

        g.append("line")
            .attr("y1", (d) => y(d.open))
            .attr("y2", (d) => y(d.close))
            .attr("stroke-width", x.bandwidth())
            .attr("stroke", (d) =>
                d.open > d.close
                    ? d3.schemeSet1[0]
                    : d.close > d.open
                    ? d3.schemeSet1[2]
                    : d3.schemeSet1[8]
            );

        g.append("title").text(
            (d) =>
                `${formatDate(d.date)} \n` +
                `Open: ${d.open}\n` +
                `Close: ${d.close} (${formatChange()(d.open, d.close)})\n` +
                `Low: ${d.low}\n` +
                `High: ${d.high}`
        );
    }
}