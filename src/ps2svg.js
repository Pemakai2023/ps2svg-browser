import child_process from "node:child_process";
import fs from "node:fs";
import process from "node:process";
import { ryb2rgb } from "./ryb2rgb.js";
const argv = process.argv.slice(2);
// console.log("argv", argv);
export function cli(argv) {
  if (argv.length < 1 || argv.length > 2) {
    console.log(`Usage:
    ps2svg my_ps         => my_ps.svg
    ps2svg my_ps new_svg => new_svg.svg
    ps2svg find          => ["path/to/my_ps.ps"]
    `);
    process.exit(1);
  }
  const inputRegex = /[.:\w\d\\/]+(\.ps)?/g;
  const outputRegex = /\w+(\.svg)?$/g;
  const inputMatches = argv[0].match(inputRegex);
  // console.log("inputMatches", inputMatches);
  const input = inputMatches[0].replace(/\.ps/g, "").trim(); // my_ps
  const outputMatches = argv[1]?.match(outputRegex);
  // console.log("outputMatches", outputMatches);
  let output;
  if (outputMatches === undefined) {
    output = "";
  } else {
    output = outputMatches[0].replace(/\.svg/g, "").trim(); // new_svg
  }
  let inputName = "";
  let outputName = "";
  if (argv.length === 1 && argv[0].match(/^find$/)) {
    const psFiles = child_process.execFileSync("find", ["-name", "*.ps"]).toString().trim().split("\n");
    console.log(psFiles);
    process.exit(1);
  }
  if (argv.length === 1) {
    inputName = input;
  }
  if (argv.length === 2) {
    inputName = input;
    outputName = output;
  }
  // console.log("(1)", inputName);
  // console.log("(2)", outputName);
  return { inputName, outputName };
}
const { inputName, outputName } = cli(argv);
const file = fs.readFileSync(`${inputName}.ps`, "utf-8");
/* OK */
export function getBoundingBox(file) {
  const boundingBoxRegex = /%%BoundingBox: (\d+\u0020?)+/g;
  const boundingBoxMatches = file.match(boundingBoxRegex); // [ '%%BoundingBox: 0 0 563 314' ]
  // console.log("boundingBoxMatches", boundingBoxMatches);
  const boundingBoxFull = boundingBoxMatches[0].replace("%%BoundingBox: ", "").trim(); // "0 0 563 314"
  const boundingBoxWidth = boundingBoxFull.split(" ")[2].trim(); // "563"
  const boundingBoxHeight = boundingBoxFull.split(" ")[3].trim(); // "314"
  return { boundingBoxWidth, boundingBoxHeight, boundingBoxFull };
}
const { boundingBoxFull, boundingBoxHeight, boundingBoxWidth } = getBoundingBox(file);
/* OK */
export function getHighlightDef(file) {
  const highlightRegex = /%% (\w+\u0020?)+/g;
  const highlightMatches = file.match(highlightRegex); // ["%% w y w h highlight"]
  // console.log("highlightMatches", highlightMatches);
  const highlightFull = highlightMatches[0].replace("%% ", "").trim().split(" "); // ["w", "y", "w", "h", "highlight"]
  const highlight = highlightFull[4].trim(); // "highlight"
  return { highlight, highlightFull };
}
const { highlight, highlightFull } = getHighlightDef(file);
export function getHighlightColor(highlight, file) {
  const highlightColor = [];
  if (highlight) {
    const highlightColorRegex = /(\d?\.\d+\u0020){3}setrgbcolor/g;
    const highlightColorMatches = file.match(highlightColorRegex); // [".95 .83 .82 setrgbcolor"]
    // console.log("highlightColorMatches", highlightColorMatches);
    const highlightColorFull = highlightColorMatches[0].replace(" setrgbcolor", "").trim().split(" "); // [".95", ".83", ".82"]
    for (const i of highlightColorFull) {
      highlightColor.push(Number(i)); // [.95, .83, .82]
    }
  }
  const rgb = ryb2rgb(highlightColor);
  return { rgb };
}
const { rgb } = getHighlightColor(highlight, file);
/* OK */
export function getHighlightCoordinates(file, highlight, highlightFull) {
  const highlightCoordinatesRegex = /(\d+\.\d+\u0020)+highlight/g;
  const highlightCoordinatesMatches = file.match(highlightCoordinatesRegex); // [ "59.784 66.176 76.525 16.088 highlight" ]
  if (highlightCoordinatesMatches === null) {
    console.log("No highlight coordinates found");
    return { highlightCoordinatesFull: [] };
  }
  // console.log("highlightCoordinatesMatches", highlightCoordinatesMatches);
  const highlightCoordinatesFull = highlightCoordinatesMatches[0].split(" "); // ["59.784", "66.176", "76.525", "16.088", "highlight"]
  const highlightMatch = highlightCoordinatesFull.length === highlightFull.length;
  const highlightIncludes = highlightCoordinatesFull.includes(highlight);
  if (highlightIncludes !== highlightMatch) {
    console.log("Highlight not matched");
  }
  return { highlightCoordinatesFull };
}
const { highlightCoordinatesFull } = getHighlightCoordinates(file, highlight, highlightFull);
/* OK */
export function getFontSize(file) {
  const findFontRegex = /findfont\u0020\d+/g;
  const findFontMatches = file.match(findFontRegex); // [ "findfont 11" ]
  // console.log("findFontMatches", findFontMatches);
  const fontSize = findFontMatches[0].replace("findfont ", "").trim(); // "11"
  return { fontSize };
}
const { fontSize } = getFontSize(file);
/* OK */
export function getMoveTo(file) {
  const moveToRegex = /(\d+\.\d+\u0020){2}moveto/g;
  const moveToMatches = file.match(moveToRegex); // ["162.092 297.792 moveto"]
  // console.log("moveToMatches", moveToMatches);
  const moveToCoordinates = [];
  for (const moveTo of moveToMatches) {
    const moveToCoordinate = moveTo.replace(" moveto", "").trim().split(" "); // ["162.092", "297.792"]
    moveToCoordinates.push(moveToCoordinate); // [["162.092", "297.792"]]
  }
  return { moveToCoordinates };
}
const { moveToCoordinates } = getMoveTo(file);
/* OK */
export function getLineTo(file) {
  const lineToRegex = /(\d+\.\d+\u0020){2}lineto/g;
  const lineToMatches = file.match(lineToRegex); // ["58.850 280.792 lineto"]
  // console.log("lineToMatches", lineToMatches);
  const lineToCoordinates = [];
  for (const lineTo of lineToMatches) {
    const lineToCoordinate = lineTo.replace(" lineto", "").trim().split(" "); // ["58.850", "280.792"]
    lineToCoordinates.push(lineToCoordinate); // [["58.850", "280.792"]]
  }
  return { lineToCoordinates };
}
const { lineToCoordinates } = getLineTo(file);
/* OK */
export function getIdentifierTexts(file) {
  const showRegex = /[\u0020-\u007e]+show/g;
  const showMatches = file.match(showRegex); // ["(a) show"]
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
const { identifierTexts } = getIdentifierTexts(file);
/* OK */
export function getLineCoordinates(moveToCoordinates, lineToCoordinates) {
  // console.log("moveToCoordinates", moveToCoordinates[0]);
  // console.log("lineToCoordinates", lineToCoordinates[0]);
  const lineCoordinates = [];
  for (const i in moveToCoordinates) {
    lineCoordinates.push([moveToCoordinates[i], lineToCoordinates[i]]);
  }
  // console.log("lineCoordinates", lineCoordinates);
  return { lineCoordinates };
}
const { lineCoordinates } = getLineCoordinates(moveToCoordinates, lineToCoordinates);
export function getIdentifierCoordinates(lineCoordinates) {
  const identifierCoordinates = [];
  // console.log("lineCoordinates", lineCoordinates[0]);
  // console.log("lineCoordinates", lineCoordinates[lineCoordinates.length - 1]);
  for (const i in lineCoordinates) {
    // console.log("m", lineCoordinates[i][0]);
    // console.log("l", lineCoordinates[i][1]);
    if (lineCoordinates[i][1] === undefined) {
      identifierCoordinates.push(lineCoordinates[i][0]);
    }
    // console.log(identifierCoordinates);
  }
  return { identifierCoordinates };
}
const { identifierCoordinates } = getIdentifierCoordinates(lineCoordinates);
/* OK */
export function getTagText(identifierCoordinates, identifierTexts) {
  const tagText = [];
  for (const i in identifierCoordinates) {
    tagText.push(
      `<text fill="#000000" font-size="${fontSize}" x="${identifierCoordinates[i][0]}" y="-${identifierCoordinates[i][1]}">${identifierTexts[i]}</text>`
    );
  }
  // console.log("tagText", tagText);
  return { tagText };
}
const { tagText } = getTagText(identifierCoordinates, identifierTexts);
/* OK */
export function getTagPath(lineCoordinates) {
  // console.log("lineCoordinates", lineCoordinates[0]);
  // console.log("lineCoordinates", lineCoordinates[lineCoordinates.length - 1]);
  const tagPath = [];
  for (const i in lineCoordinates) {
    // console.log("m", lineCoordinates[i][0]);
    // console.log("l", lineCoordinates[i][1]);
    if (lineCoordinates[i][1] !== undefined) {
      const move = lineCoordinates[i][0];
      const line = lineCoordinates[i][1];
      tagPath.push(`<path stroke="#000000" d="M${move[0]},-${move[1]} L${line[0]},-${line[1]}"/>`);
    }
  }
  // console.log("tagPath", tagPath);
  return { tagPath };
}
const { tagPath } = getTagPath(lineCoordinates);
/* OK */
export function getTagHighlight(highlightCoordinatesFull, RGBColor) {
  const tagHighlight = [];
  if (highlightCoordinatesFull.length === 0) {
    return { tagHighlight };
  }
  // const t = (Number(highlightCoordinatesFull[2]) - 14).toFixed(3);
  // 0.95 0.82 0.83 setrgbcolor => #f2d4d1 / rgb(242, 212, 209)
  tagHighlight.push(`<g id="${highlightCoordinatesFull[4]}" transform="translate(0 -${highlightCoordinatesFull[3]})">
<rect x="${highlightCoordinatesFull[0]}" y="-${highlightCoordinatesFull[1]}" width="${highlightCoordinatesFull[2]}" height="${highlightCoordinatesFull[3]}" fill="rgb(${RGBColor[0]}, ${RGBColor[1]}, ${RGBColor[2]})" />
</g>`);
  return { tagHighlight };
}
const { tagHighlight } = getTagHighlight(highlightCoordinatesFull, rgb);
/* OK */
export function svgBuilder(
  boundingBoxWidth,
  boundingBoxHeight,
  boundingBoxFull,
  tagText,
  tagPath,
  tagHighlight
) {
  const SVG = `<svg width="${boundingBoxWidth}" height="${boundingBoxHeight}" viewBox="${boundingBoxFull}" fill="none" xmlns="http://www.w3.org/2000/svg">
<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto');
</style>
<rect id="background" width="${boundingBoxWidth}" height="${boundingBoxHeight}" fill="#ffffff"/>
<g id="tree" transform="translate(0 ${boundingBoxHeight})" font-family="Roboto">
${tagHighlight.join("\n")}
${tagPath.join("\n")}
${tagText.join("\n")}
</g>
</svg>
`;
  return { SVG };
}
const { SVG } = svgBuilder(
  boundingBoxWidth,
  boundingBoxHeight,
  boundingBoxFull,
  tagText,
  tagPath,
  tagHighlight
);
fs.writeFile(`${outputName}.svg`, SVG, "utf-8", (err) => {
  if (err) throw err;
  console.log("💱 The file has been converted! 💱");
});
