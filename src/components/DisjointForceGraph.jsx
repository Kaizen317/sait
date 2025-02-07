import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const DisjointForceGraph = () => {
  const svgRef = useRef();

  useEffect(() => {
    // Datos de ejemplo para el grafo
    const data = {
      nodes: [
        { id: "A", group: 1 },
        { id: "B", group: 2 },
        { id: "C", group: 3 },
        { id: "D", group: 4 },
        { id: "E", group: 5 },
        { id: "F", group: 6 },
        { id: "G", group: 7 },
        { id: "H", group: 8 },
        { id: "I", group: 9 },
        { id: "J", group: 10 },
      ],
      links: [
        { source: "A", target: "B", value: 1 },
        { source: "A", target: "C", value: 2 },
        { source: "B", target: "D", value: 3 },
        { source: "C", target: "E", value: 4 },
        { source: "D", target: "E", value: 5 },
        { source: "F", target: "G", value: 6 },
        { source: "G", target: "H", value: 7 },
        { source: "H", target: "I", value: 8 },
        { source: "I", target: "J", value: 9 },
        { source: "J", target: "F", value: 10 },
      ],
    };

    // Especifica las dimensiones del gráfico
    const width = 928;
    const height = 680;

    // Especifica la escala de colores
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Crea una copia de los datos para que no se muten
    const links = data.links.map((d) => ({ ...d }));
    const nodes = data.nodes.map((d) => ({ ...d }));

    // Crea una simulación con varias fuerzas
    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id))
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    // Crea el contenedor SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Añade una línea para cada enlace
    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // Añade un círculo para cada nodo
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", (d) => color(d.group));

    // Añade un título a cada nodo
    node.append("title").text((d) => d.id);

    // Añade comportamiento de arrastre
    node.call(
      d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    // Actualiza la posición de los enlaces y nodos en cada "tick" de la simulación
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    });

    // Funciones para el comportamiento de arrastre
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Limpia la simulación al desmontar el componente
    return () => simulation.stop();
  }, []);

  return <svg ref={svgRef}></svg>;
};

export default DisjointForceGraph;