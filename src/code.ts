import {TailwindConfig} from "tailwindcss/tailwind-config";
import {figmaRGBToHex, figmaRGBToWebRGB} from "@figma-plugin/helpers";

function hexToRGB(hex: string, alpha: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (alpha) {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
}


figma.showUI(__html__);

figma.ui.resize(600, 700);

figma.ui.onmessage = (msg) => {
    // if (msg.type === "create-rectangles") {
    //   const nodes = [];
    //
    //   for (let i = 0; i < msg.count; i++) {
    //     const rect = figma.createRectangle();
    //     rect.x = i * 150;
    //     rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
    //     figma.currentPage.appendChild(rect);
    //     nodes.push(rect);
    //   }
    //
    //   figma.currentPage.selection = nodes;
    //   figma.viewport.scrollAndZoomIntoView(nodes);
    // }
    if (msg.type === 'analyse-design') {
        const nodes = figma.currentPage.findAll();
        const config: TailwindConfig = msg.config;

        const lastColors = Object.keys(config?.theme?.extend.colors ?? {})
            .map(key => {
                const value = (config?.theme?.extend.colors ?? {})[key]
                if (value.includes('#')) {
                    return hexToRGB(value, `1`)
                }else return value;
            })

        const newColors: string[] = []

        nodes.forEach((node, k) => {
            if (node.type === 'TEXT') {
                if (((node.fills as Paint[]).length || 0) > 0) {
                    let alpha = node.fills[0].opacity
                    alpha = Math.round(alpha * 100) /100
                    const color = hexToRGB(figmaRGBToHex(node.fills[0].color), `${alpha}`);
                    if (!newColors.includes(color) && !lastColors.includes(color)) {
                        newColors.push(color);
                    }
                }
            }
        });

        console.log("lastColors", lastColors);
        console.log("newColors", newColors);

        figma.ui.postMessage({type: "analyse-design-response", nodes})
    }

    // figma.closePlugin();
};

figma.on('selectionchange', () => {
    detectSelection();
});

const detectSelection = () => {
    const {selection} = figma.currentPage;
    if (selection.length) {
        figma.ui.postMessage({type: 'ITEM_SELECTED'});
        console.log('ITEM_SELECTED', selection);
    } else {
        figma.ui.postMessage({type: 'ITEM_NOT_SELECTED'});
    }
}