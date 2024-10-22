import { createEffect, onMount } from "solid-js";
import * as d3 from "d3";
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

interface D3ChartProps {
  data: number[][];
}

const D3Chart = (props: D3ChartProps) => {
  let heatmapRef: HTMLDivElement | undefined;

  const draw = (data_: number[][] | null) => {
    if (!heatmapRef) return;
    heatmapRef.innerHTML = "";

    const margin = { top: 50, right: 30, bottom: 50, left: 60 };
    const width = 960 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(heatmapRef)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const data = daysOfWeek.flatMap((day, dayIndex) =>
      hours.map((hour, hourIndex) => ({
        day,
        hour,
        value: data_?.[dayIndex]?.[hourIndex] ?? 0,
        dayIndex,
        hourIndex,
      }))
    );

    // Define scales
    const x = d3.scaleBand().range([0, width]).domain(hours).padding(0.01);
    const y = d3.scaleBand().range([0, height * 0.6]).domain(daysOfWeek).padding(0.01);
    const color = d3.scaleSequential(d3.interpolateReds).domain([0, 50]);

    // Draw the squares
    const cells = svg
      .selectAll()
      .data(data)
      .enter()
      .append("g");

    cells
      .append("rect")
      .attr("x", d => x(d.hour)!)
      .attr("y", d => y(d.day)!)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => color(d.value))
      .style("stroke", "#ccc");

    // Add text labels inside squares
    cells
      .append("text")
      .attr("x", d => x(d.hour)! + x.bandwidth() / 2)
      .attr("y", d => y(d.day)! + y.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("fill", "black")
      .text(d => d.value);

    // Add X axis
    svg
      .append("g")
      .call(d3.axisTop(x).tickSize(0))
      .selectAll("text")
      .style("text-anchor", "middle");

    // Add Y axis
    svg.append("g").call(d3.axisLeft(y).tickSize(0));
  };

  onMount(() => {
    draw(null);
  });

  createEffect(() => {
    draw(props.data);
  });

  return <div ref={heatmapRef}></div>;
};

export default D3Chart;
