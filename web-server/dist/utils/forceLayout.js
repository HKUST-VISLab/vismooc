"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const d3 = require("d3-force");
function forceLayout(graph, IteratorTimes = 100) {
    const link = d3.forceLink()
        .id(d => d.id)
        .links(graph.links)
        .distance(100);
    const manybody = d3.forceManyBody()
        .strength(d => -Math.sqrt(d.activeness) * 10);
    // .distanceMin(20);
    const simulation = d3.forceSimulation()
        .force('charge', manybody)
        .force('center', d3.forceCenter());
    simulation
        .nodes(graph.nodes);
    simulation
        .force('link', link);
    for (let i = 0; i < IteratorTimes; ++i) {
        if (i % 10 === 0) {
            console.info('iter', i);
        }
        simulation.tick();
    }
    return {
        links: graph.links.map(d => ({
            source: d.source.id,
            target: d.target.id,
            weight: d.weight,
        })),
        nodes: graph.nodes,
    };
}
exports.forceLayout = forceLayout;
//# sourceMappingURL=forceLayout.js.map