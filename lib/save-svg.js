export default function saveSvg(svgEl, name) {
  if(typeof svgEl === 'object' || ({}).toString.call(svg) === '[object SVGSVGElement]') {
    var svg = svgEl
    var serializer = new XMLSerializer();
    svgEl = serializer.serializeToString(svg);
  }
  
  svgEl = svgEl.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink wit    hout namespace
  svgEl = svgEl.replace(/ns\d+:href/g, 'xlink:href'); // Safari NS namespace fix.
  if (!svgEl.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgEl = svgEl.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  if (!svgEl.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      svgEl = svgEl.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  var svgData = svgEl
  var preface = '<?xml version="1.0" standalone="no"?>\r\n';
  var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
