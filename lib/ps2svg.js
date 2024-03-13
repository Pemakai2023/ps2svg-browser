import { ryb2rgb } from "./ryb2rgb.js";

// OK
function getBoundingBox(buff) {
    const boundingBoxRegex = /%%BoundingBox: (\d+\u0020?)+/g;
    const boundingBoxMatches = buff.match(boundingBoxRegex); // [ '%%BoundingBox: 0 0 563 314' ]
    // console.log("boundingBoxMatches", boundingBoxMatches);
    if (boundingBoxMatches === null) {
        return { boundingBoxFull: "0 0 2480 3508", boundingBoxHeight: "3508", boundingBoxWidth: "2480" };
    }
    const boundingBoxFull = boundingBoxMatches[0].replace("%%BoundingBox: ", "").trim(); // "0 0 563 314"
    const boundingBoxWidth = boundingBoxFull.split(" ")[2].trim(); // "563"
    const boundingBoxHeight = boundingBoxFull.split(" ")[3].trim(); // "314"
    return { boundingBoxWidth, boundingBoxHeight, boundingBoxFull };
}

// OK
function getHighlightDef(buff) {
    const highlightRegex = /\/\w+\u0020?{/g; // /highlight {
    const highlightMatches = buff.match(highlightRegex); // ["/highlight {"]
    // console.log("highlightMatches", highlightMatches);
    const highlight = highlightMatches[0].replace("/", "").replace(" {", "").trim(); // highlight
    return { highlight };
}

function getHighlightColor(high_light, buff) {
    const highlightColor = [];
    if (high_light) {
        const highlightColorRegex = /(\d?\.\d+\u0020){3}setrgbcolor/g;
        const highlightColorMatches = buff.match(highlightColorRegex); // [".95 .83 .82 setrgbcolor"]
        // console.log("highlightColorMatches", highlightColorMatches);
        if (highlightColorMatches === null) {
            return { rgb: [0, 0, 0] };
        }
        const highlightColorFull = highlightColorMatches[0].replace(" setrgbcolor", "").trim().split(" "); // [".95", ".83", ".82"]
        for (const i of highlightColorFull) {
            highlightColor.push(Number(i)); // [.95, .83, .82]
        }
    }
    const rgb = ryb2rgb(highlightColor);
    return { rgb };
}

// OK
function getHighlightCoordinates(buff, high_light) {
    const highlightCoordinatesRegex = /((\d+\.)?\d+\u0020)+\w+/g;
    const highlightCoordinatesMatches = buff.match(highlightCoordinatesRegex); // [ "59.784 66.176 76.525 16.088 highlight" ]
    // console.log("highlightCoordinatesMatches", highlightCoordinatesMatches);
    if (highlightCoordinatesMatches === null) {
        return { highlightCoordinatesFull: [""] };
    }
    const highlightCoordinates = [];
    for (const i of highlightCoordinatesMatches) {
        if (i.includes(high_light)) {
            highlightCoordinates.push(i);
        }
    }
    // console.log(highlightCoordinates);
    if (highlightCoordinates.length === 0) {
        return { highlightCoordinatesFull: [] };
    }
    const highlightCoordinatesFull = highlightCoordinates[0].split(" "); // ["59.784", "66.176", "76.525", "16.088", "highlight"]
    return { highlightCoordinatesFull };
}

// OK
function getFontSize(buff) {
    const findFontRegex = /findfont\u0020\d+/g;
    const findFontMatches = buff.match(findFontRegex); // [ "findfont 11" ]
    // console.log("findFontMatches", findFontMatches);
    const fontSize = findFontMatches[0].replace("findfont ", "").trim(); // "11"
    return { fontSize };
}

// OK
function getMoveTo(buff) {
    const moveToRegex = /((\d+\.)?\d+\u0020){2}moveto/g;
    const moveToMatches = buff.match(moveToRegex); // ["162.092 297.792 moveto"]
    // console.log("moveToMatches", moveToMatches);
    if (moveToMatches === null) {
        return { moveToCoordinates: [[""]] };
    }
    const moveToCoordinates = [];
    for (const moveTo of moveToMatches) {
        const moveToCoordinate = moveTo.replace(" moveto", "").trim().split(" "); // ["162.092", "297.792"]
        moveToCoordinates.push(moveToCoordinate); // [["162.092", "297.792"]]
    }
    return { moveToCoordinates };
}

// OK
function getLineTo(buff) {
    const lineToRegex = /((\d+\.)?\d+\u0020){2}lineto/g;
    const lineToMatches = buff.match(lineToRegex); // ["58.850 280.792 lineto"]
    // console.log("lineToMatches", lineToMatches);
    if (lineToMatches === null) {
        return { lineToCoordinates: [[""]] };
    }
    const lineToCoordinates = [];
    for (const lineTo of lineToMatches) {
        const lineToCoordinate = lineTo.replace(" lineto", "").trim().split(" "); // ["58.850", "280.792"]
        lineToCoordinates.push(lineToCoordinate); // [["58.850", "280.792"]]
    }
    return { lineToCoordinates };
}

// OK
function getIdentifierTexts(buff) {
    const showRegex = /[\u0020-\u007e]+show/g;
    const showMatches = buff.match(showRegex); // ["(a) show"]
    // console.log("showMatches", showMatches);
    const identifierTexts = [];
    for (const show of showMatches) {
        const texts = show.replace("(", "").replace(")", "").replace(" show", ""); // "a"
        const textRemovedEscapes = texts
            .replace(/^\\/g, "") // \\n => \n
            .replace(/'\\'>\)/g, "')'>")
            .trim();
        const text = textRemovedEscapes.replace(/</g, "&#60;").replace(/>/g, "&#62;").trim();
        // console.log("text", text);
        identifierTexts.push(text); // ["a"]
    }
    return { identifierTexts };
}


// OK
function getLineCoordinates(moveTo_Coordinates, lineTo_Coordinates) {
    // console.log("moveTo_Coordinates", moveTo_Coordinates[0]);
    // console.log("lineTo_Coordinates", lineTo_Coordinates[0]);
    const lineCoordinates = [];
    for (const i in moveTo_Coordinates) {
        lineCoordinates.push([moveTo_Coordinates[i], lineTo_Coordinates[i]]);
    }
    // console.log("lineCoordinates", lineCoordinates);
    return { lineCoordinates };
}

function getIdentifierCoordinates(line_Coordinates) {
    const identifierCoordinates = [];
    // console.log("lineCoordinates", lineCoordinates[0]);
    // console.log("lineCoordinates", lineCoordinates[lineCoordinates.length - 1]);
    for (const i in line_Coordinates) {
        // console.log("m", line_Coordinates[i][0]);
        // console.log("l", line_Coordinates[i][1]);
        if (line_Coordinates[i][1] === undefined) {
            identifierCoordinates.push(line_Coordinates[i][0]);
        }
        // console.log(identifierCoordinates);
    }
    return { identifierCoordinates };
}

// OK
function getTagText(identifier_Coordinates, identifier_Texts, fontSize) {
    const tagText = [];
    for (const i in identifier_Coordinates) {
        tagText.push(`<text fill="#000000" font-size="${fontSize}" x="${identifier_Coordinates[i][0]}" y="-${identifier_Coordinates[i][1]}">${identifier_Texts[i]}</text>`);
    }
    // console.log("tagText", tagText);
    return { tagText };
}

// OK
function getTagPath(line_Coordinates) {
    // console.log("line_Coordinates", line_Coordinates[0]);
    // console.log("line_Coordinates", line_Coordinates[lineCoordinates.length - 1]);
    const tagPath = [];
    for (const i in line_Coordinates) {
        // console.log("m", line_Coordinates[i][0]);
        // console.log("l", line_Coordinates[i][1]);
        if (line_Coordinates[i][1] !== undefined) {
            const move = line_Coordinates[i][0];
            const line = line_Coordinates[i][1];
            tagPath.push(`<path stroke="#000000" d="M${move[0]},-${move[1]} L${line[0]},-${line[1]}"/>`);
        }
    }
    // console.log("tagPath", tagPath);
    return { tagPath };
}

// OK
function getTagHighlight(highlightCoordinates_Full, RGBColor) {
    const tagHighlight = [];
    if (highlightCoordinates_Full.length === 0) {
        return { tagHighlight };
    }
    // 0.95 0.82 0.83 setrgbcolor => #f2d4d1 / rgb(242, 212, 209)
    tagHighlight.push(`<g id="${highlightCoordinates_Full[4]}" transform="translate(0 -${highlightCoordinates_Full[3]})">
<rect x="${highlightCoordinates_Full[0]}" y="-${highlightCoordinates_Full[1]}" width="${highlightCoordinates_Full[2]}" height="${highlightCoordinates_Full[3]}" fill="rgb(${RGBColor[0]}, ${RGBColor[1]}, ${RGBColor[2]})" />
</g>`);
    // console.log("tagHighlight", tagHighlight);
    return { tagHighlight };
}
////////////////////////

// OK
function svgBuilder(boundingBox_Width, boundingBox_Height, boundingBox_Full, tag_Text, tag_Path, tag_Highlight) {
    const SVG = `<svg width="${boundingBox_Width}" height="${boundingBox_Height}" viewBox="${boundingBox_Full}" fill="none" xmlns="http://www.w3.org/2000/svg">
<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto');
</style>
<rect id="background" width="${boundingBox_Width}" height="${boundingBox_Height}" fill="#ffffff"/>
<g id="tree" transform="translate(0 ${boundingBox_Height})" font-family="Roboto">
${tag_Highlight.join("\n")}
${tag_Path.join("\n")}
${tag_Text.join("\n")}
</g>
</svg>
`;
    return { SVG };
}

function processBuffer(buffer) {
  
  const { boundingBoxFull, boundingBoxHeight, boundingBoxWidth } = getBoundingBox(buffer);
  const { highlight } = getHighlightDef(buffer);
  const { rgb } = getHighlightColor(highlight, buffer);
  const { highlightCoordinatesFull } = getHighlightCoordinates(buffer, highlight);
  const { fontSize } = getFontSize(buffer);
  const { moveToCoordinates } = getMoveTo(buffer);
  const { lineToCoordinates } = getLineTo(buffer);
  const { identifierTexts } = getIdentifierTexts(buffer);
  
  return {boundingBoxFull, boundingBoxHeight, boundingBoxWidth,highlight, rgb, highlightCoordinatesFull, fontSize, moveToCoordinates, lineToCoordinates, identifierTexts}
}

function processSVG(buff) {
  const {boundingBoxFull, boundingBoxHeight, boundingBoxWidth,highlight, rgb , highlightCoordinatesFull, fontSize, moveToCoordinates, lineToCoordinates, identifierTexts} = processBuffer(buff);
  
  const { lineCoordinates } = getLineCoordinates(moveToCoordinates, lineToCoordinates);
  const { identifierCoordinates } = getIdentifierCoordinates(lineCoordinates);
  const { tagText } = getTagText(identifierCoordinates, identifierTexts, fontSize);
  const { tagPath } = getTagPath(lineCoordinates);
  const { tagHighlight } = getTagHighlight(highlightCoordinatesFull, rgb);
  const { SVG } = svgBuilder(boundingBoxWidth, boundingBoxHeight, boundingBoxFull, tagText, tagPath, tagHighlight);
  return SVG
}

export default processSVG